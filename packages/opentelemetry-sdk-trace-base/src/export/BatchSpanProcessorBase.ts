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
  getNumberFromEnv,
  globalErrorHandler,
  suppressTracing,
} from '@opentelemetry/core';
import { Span } from '../Span';
import { SpanProcessor } from '../SpanProcessor';
import { BufferConfig } from '../types';
import { ReadableSpan } from './ReadableSpan';
import { SpanExporter } from './SpanExporter';

/**
 * Waits for all pending async resources in the log records to be resolved.
 */
async function waitForResources(logRecords: ReadableSpan[]): Promise<void> {
  const pendingResources: Array<Promise<void>> = [];
  for (let i = 0, len = logRecords.length; i < len; i++) {
    const logRecord = logRecords[i];
    if (
      logRecord.resource.asyncAttributesPending &&
      logRecord.resource.waitForAsyncAttributes
    ) {
      pendingResources.push(logRecord.resource.waitForAsyncAttributes());
    }
  }

  if (pendingResources.length > 0) {
    await Promise.all(pendingResources);
  }
}

/**
 * Represents an export operation that handles the entire export workflow.
 */
class ExportOperation {
  private _exportCompleted: Promise<void>;
  private _exportScheduledPromise: Promise<void>;
  private _exportScheduledResolve!: () => void;

  constructor(
    exporter: SpanExporter,
    logRecords: ReadableSpan[],
    exportTimeoutMillis: number
  ) {
    this._exportScheduledPromise = new Promise<void>(resolve => {
      this._exportScheduledResolve = resolve;
    });
    this._exportCompleted = this._executeExport(
      exporter,
      logRecords,
      exportTimeoutMillis
    );
  }

  /** Get the promise that resolves when the export completes */
  get exportCompleted(): Promise<void> {
    return this._exportCompleted;
  }

  /** Get the promise that resolves when exporter.export() has been called */
  get exportScheduled(): Promise<void> {
    return this._exportScheduledPromise;
  }

  private async _executeExport(
    exporter: SpanExporter,
    spans: ReadableSpan[],
    exportTimeoutMillis: number
  ): Promise<void> {
    try {
      // Wait for all pending resources before exporting
      await waitForResources(spans);

      // Export with timeout, wrapped in suppressTracing context
      await context.with(suppressTracing(context.active()), async () => {
        await this._exportWithTimeout(exporter, spans, exportTimeoutMillis);
      });
    } catch (e) {
      // ensure we never reject here, as we may call await after it has already resolved.
      globalErrorHandler(e);
      // resolve, as the error may have occurred before export was scheduled
      this._exportScheduledResolve();
    }
  }

  private async _exportWithTimeout(
    exporter: SpanExporter,
    spans: ReadableSpan[],
    exportTimeoutMillis: number
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout'));
      }, exportTimeoutMillis);

      // Call exporter.export() and immediately resolve exportScheduled
      exporter.export(spans, result => {
        clearTimeout(timer);
        if (result.code === ExportResultCode.SUCCESS) {
          resolve();
        } else {
          reject(
            result.error ??
              new Error('BatchLogRecordProcessor: log record export failed')
          );
        }
      });

      // Resolve exportScheduled immediately after calling exporter.export()
      this._exportScheduledResolve();
    });
  }
}

/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
export abstract class BatchSpanProcessorBase<T extends BufferConfig>
  implements SpanProcessor
{
  private readonly _maxExportBatchSize: number;
  private readonly _maxQueueSize: number;
  private readonly _scheduledDelayMillis: number;
  private readonly _exportTimeoutMillis: number;
  private readonly _exporter: SpanExporter;

  private _currentExport: ExportOperation | null = null;
  private _finishedSpans: ReadableSpan[] = [];
  private _timer: NodeJS.Timeout | number | undefined;
  private _shutdownOnce: BindOnceFuture<void>;
  private _droppedSpansCount: number = 0;

  constructor(exporter: SpanExporter, config?: T) {
    this._exporter = exporter;
    this._maxExportBatchSize =
      typeof config?.maxExportBatchSize === 'number'
        ? config.maxExportBatchSize
        : (getNumberFromEnv('OTEL_BSP_MAX_EXPORT_BATCH_SIZE') ?? 512);
    this._maxQueueSize =
      typeof config?.maxQueueSize === 'number'
        ? config.maxQueueSize
        : (getNumberFromEnv('OTEL_BSP_MAX_QUEUE_SIZE') ?? 2048);
    this._scheduledDelayMillis =
      typeof config?.scheduledDelayMillis === 'number'
        ? config.scheduledDelayMillis
        : (getNumberFromEnv('OTEL_BSP_SCHEDULE_DELAY') ?? 5000);
    this._exportTimeoutMillis =
      typeof config?.exportTimeoutMillis === 'number'
        ? config.exportTimeoutMillis
        : (getNumberFromEnv('OTEL_BSP_EXPORT_TIMEOUT') ?? 30000);

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

    this._addToBuffer(span);
  }

  shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private async _shutdown(): Promise<void> {
    this.onShutdown();
    await this._flushAll();
    await this._exporter.shutdown();
  }

  /** Add a span in the buffer. */
  private _addToBuffer(span: ReadableSpan) {
    if (this._finishedSpans.length >= this._maxQueueSize) {
      // limit reached, drop span

      if (this._droppedSpansCount === 0) {
        diag.debug('maxQueueSize reached, dropping spans');
      }
      this._droppedSpansCount++;

      return;
    }

    if (this._droppedSpansCount > 0) {
      // some spans were dropped, log once with count of spans dropped
      diag.warn(
        `Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`
      );
      this._droppedSpansCount = 0;
    }

    this._finishedSpans.push(span);
    this._maybeStartTimer();
  }

  /**
   * Send all LogRecords to the exporter respecting the batch size limit
   * This function is used only on forceFlush or shutdown,
   * for all other cases _flush should be used
   * */
  private async _flushAll(): Promise<void> {
    // Clear timer to prevent concurrent exports
    this._clearTimer();

    // Wait for any in-progress export to complete
    if (this._currentExport !== null) {
      // speed up execution for current export
      await this._exporter.forceFlush?.();
      await this._currentExport.exportCompleted;
      this._currentExport = null;
    }

    // Now flush all batches sequentially to avoid race conditions
    while (this._finishedSpans.length > 0) {
      const logRecords = this._extractBatch();
      if (logRecords === null) {
        break;
      }

      const exportOp = new ExportOperation(
        this._exporter,
        logRecords,
        this._exportTimeoutMillis
      );
      this._currentExport = exportOp;

      // await export scheduled, then force flush exporter to speed up export
      try {
        // TODO: figure out which ones of these throw, what the impact is on not doing the others.
        await exportOp.exportScheduled;
        await this._exporter.forceFlush?.();
        await exportOp.exportCompleted;
      } catch (e) {
        globalErrorHandler(e);
      } finally {
        this._currentExport = null;
      }
    }
  }

  /**
   * Extracts one batch from the buffer.
   * Returns null if buffer is empty.
   */
  private _extractBatch(): ReadableSpan[] | null {
    if (this._finishedSpans.length === 0) {
      return null;
    }

    if (this._finishedSpans.length <= this._maxExportBatchSize) {
      const batch = this._finishedSpans;
      this._finishedSpans = [];
      return batch;
    } else {
      return this._finishedSpans.splice(0, this._maxExportBatchSize);
    }
  }

  private _exportOneBatch(): void {
    this._clearTimer();

    const logRecords = this._extractBatch();
    if (logRecords === null) {
      return;
    }

    const exportOp = new ExportOperation(
      this._exporter,
      logRecords,
      this._exportTimeoutMillis
    );
    this._currentExport = exportOp;

    // Handle completion asynchronously
    exportOp.exportCompleted
      .then(() => {
        this._currentExport = null;
        this._maybeStartTimer();
      })
      .catch(error => {
        this._currentExport = null;
        globalErrorHandler(error);
        this._maybeStartTimer();
      });
  }

  private _maybeStartTimer() {
    if (this._shutdownOnce.isCalled) {
      return;
    }

    if (this._finishedSpans.length === 0) {
      return;
    }

    if (this._currentExport !== null) {
      return;
    }

    // If batch is full, export immediately
    if (this._finishedSpans.length >= this._maxExportBatchSize) {
      this._exportOneBatch();
      return;
    }

    // If timer is already set, don't set another one
    if (this._timer !== undefined) {
      return;
    }

    // Set timer for scheduled export
    this._timer = setTimeout(() => {
      this._timer = undefined;
      this._exportOneBatch();
    }, this._scheduledDelayMillis);

    // Unref timer so it doesn't keep process alive
    if (typeof this._timer !== 'number') {
      this._timer.unref();
    }
  }

  private _clearTimer() {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  protected abstract onShutdown(): void;
}
