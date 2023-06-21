/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { context, Context, diag, TraceFlags } from '@opentelemetry/api';
import {
  BindOnceFuture,
  ExportResultCode,
  getEnv,
  suppressTracing,
  unrefTimer,
} from '@opentelemetry/core';
import { Span } from '../Span';
import { SpanProcessor } from '../SpanProcessor';
import { BufferConfig } from '../types';
import { ReadableSpan } from './ReadableSpan';
import { SpanExporter } from './SpanExporter';

/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
export abstract class BatchSpanProcessorBase<T extends BufferConfig>
  implements SpanProcessor {
  private readonly _maxExportBatchSize: number;
  private readonly _maxQueueSize: number;
  private readonly _scheduledDelayMillis: number;
  private readonly _exportTimeoutMillis: number;

  private _finishedSpans: ReadableSpan[] = [];
  private _timer: NodeJS.Timeout | undefined;
  private _shutdownOnce: BindOnceFuture<void>;
  private _droppedSpansCount: number = 0;
  private _waiting = false;
  private _processing = false;

  constructor(private readonly _exporter: SpanExporter, config?: T) {
    const env = getEnv();
    this._maxExportBatchSize =
      typeof config?.maxExportBatchSize === 'number'
        ? config.maxExportBatchSize
        : env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE;
    this._maxQueueSize =
      typeof config?.maxQueueSize === 'number'
        ? config.maxQueueSize
        : env.OTEL_BSP_MAX_QUEUE_SIZE;
    this._scheduledDelayMillis =
      typeof config?.scheduledDelayMillis === 'number'
        ? config.scheduledDelayMillis
        : env.OTEL_BSP_SCHEDULE_DELAY;
    this._exportTimeoutMillis =
      typeof config?.exportTimeoutMillis === 'number'
        ? config.exportTimeoutMillis
        : env.OTEL_BSP_EXPORT_TIMEOUT;

    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);

    if (this._maxExportBatchSize > this._maxQueueSize) {
      diag.warn(
        'BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize'
      );
      this._maxExportBatchSize = this._maxQueueSize;
    }
  }

  forceFlush(): Promise<void> {
    if (this._shutdownOnce.isCalled) {
      return this._shutdownOnce.promise;
    }
    return this._flushAll();
  }

  // does nothing.
  onStart(_span: Span, _parentContext: Context): void {}

  onEnd(span: ReadableSpan): void {
    if (this._shutdownOnce.isCalled) {
      return;
    }

    if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) {
      return;
    }

    if (this._finishedSpans.length >= this._maxQueueSize) {
      this._droppedSpansCount++
      return;
    }

    this._finishedSpans.push(span);

    this._maybeEagerlyProcessBatch();
    this._maybeStartTimer();
  }

  shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown() {
    return Promise.resolve()
      .then(() => {
        return this.onShutdown();
      })
      .then(() => {
        return this._flushAll();
      })
      .then(() => {
        return this._exporter.shutdown();
      });
  }

  private _maybeEagerlyProcessBatch() {
    if (!this._processing && this._finishedSpans.length >= this._maxExportBatchSize) {
      this._processOneBatch();
    }
  }

  /**
   * Send all spans to the exporter respecting the batch size limit
   * This function is used only on forceFlush or shutdown,
   * for all other cases _flush should be used
   * */
  private async _flushAll(): Promise<void> {
    const promises = [];
    // calculate number of batches
    const count = Math.ceil(
      this._finishedSpans.length / this._maxExportBatchSize
    );
    for (let i = 0, j = count; i < j; i++) {
      promises.push(this._processOneBatch());
    }

    await Promise.all(promises);
  }

  private _processOneBatch() {
    // because we eagerly export, we need to limit concurrency or we may have infinite concurrent exports
    if (this._processing) {
      this._waiting = true;
      return;
    };
    this._waiting = false;
    this._processing = true;
    this._clearTimer();

    if (this._shutdownOnce.isCalled) {
      return;
    }

    // TODO decide if we want to favor spans without pending async resource attributes
    // this is only important if a span processor is shared with multiple tracer providers
    // this._finishedSpans.sort((a, b) => {
    //   if (a.resource.asyncAttributesPending == b.resource.asyncAttributesPending) return 0;
    //   if (a.resource.asyncAttributesPending && !b.resource.asyncAttributesPending) return 1;
    //   return -1;
    // });

    // drain 1 batch from queue.
    const batch = this._finishedSpans.splice(0, this._maxExportBatchSize);

    console.log('drained', batch.length, 'spans from the queue');
    console.log('queue length', this._finishedSpans.length);


    // start timer if there are still spans in the queue
    this._maybeStartTimer();

    if (this._droppedSpansCount > 0) {
      diag.warn(
        `Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`
      );
    }
    this._droppedSpansCount = 0;

    Promise.all(
      batch
        .map(span => span.resource)
        .filter(resource => resource.asyncAttributesPending)
        .map(res => res.waitForAsyncAttributes?.())
    )
      .then(() => this._promisifiedExportBatchWithTimeout(batch))
      .catch((err) => {
        // TODO improve error message with some contextual info and err object
        diag.error("Failed to export batch")
      })
      .finally(() => {
        this._processing = false;
        if (this._waiting) {
          this._processOneBatch();
        }
        this._maybeEagerlyProcessBatch();
        this._maybeStartTimer();
      });
  }

  private _promisifiedExportBatchWithTimeout(batch: ReadableSpan[]): Promise<void> {
    // promisify and add to list of tracked export promises
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        // don't wait anymore for export, this way the next batch can start
        // we can't cancel the export so we have to just forget about it
        reject(new Error('Timeout'));
      }, this._exportTimeoutMillis);
      unrefTimer(timer);

      context.with(suppressTracing(context.active()), () => {
        this._exporter.export(batch, (result) => {
          clearTimeout(timer);
          if (result.code === ExportResultCode.SUCCESS) {
            resolve();
          } else {
            reject(
              result.error ??
              new Error('BatchSpanProcessor: span export failed')
            );
          }
        });
      });
    });
  }

  private _maybeStartTimer() {
    if (this._finishedSpans.length > 0 && this._timer == null) {
      this._timer = setTimeout(this._processOneBatch.bind(this), this._scheduledDelayMillis);
      unrefTimer(this._timer);
    }
  }

  private _clearTimer() {
    if (this._timer != null) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  protected abstract onShutdown(): void;
}
