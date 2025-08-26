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

import { Context, TraceFlags } from '@opentelemetry/api';
import {
  internal,
  ExportResultCode,
  globalErrorHandler,
  BindOnceFuture,
} from '@opentelemetry/core';
import { Span } from '../Span';
import { SpanProcessor } from '../SpanProcessor';
import { ReadableSpan } from './ReadableSpan';
import { SpanExporter } from './SpanExporter';

/**
 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
 * to {@link ReadableSpan} and passes it to the configured exporter.
 *
 * Only spans that are sampled are converted.
 *
 * NOTE: This {@link SpanProcessor} exports every ended span individually instead of batching spans together, which causes significant performance overhead with most exporters. For production use, please consider using the {@link BatchSpanProcessor} instead.
 */
export class SimpleSpanProcessor implements SpanProcessor {
  private _shutdownOnce: BindOnceFuture<void>;
  private _pendingExports: Set<Promise<void>>;

  constructor(private readonly _exporter: SpanExporter) {
    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
    this._pendingExports = new Set<Promise<void>>();
  }

  async forceFlush(): Promise<void> {
    await Promise.all(Array.from(this._pendingExports));
    if (this._exporter.forceFlush) {
      await this._exporter.forceFlush();
    }
  }

  onStart(_span: Span, _parentContext: Context): void {}

  onEnd(span: ReadableSpan): void {
    if (this._shutdownOnce.isCalled) {
      return;
    }

    if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) {
      return;
    }

    const pendingExport = this._doExport(span).catch(err =>
      globalErrorHandler(err)
    );
    // Enqueue this export to the pending list so it can be flushed by the user.
    this._pendingExports.add(pendingExport);
    void pendingExport.finally(() =>
      this._pendingExports.delete(pendingExport)
    );
  }

  private async _doExport(span: ReadableSpan): Promise<void> {
    if (span.resource.asyncAttributesPending) {
      // Ensure resource is fully resolved before exporting.
      await span.resource.waitForAsyncAttributes?.();
    }

    const result = await internal._export(this._exporter, [span]);
    if (result.code !== ExportResultCode.SUCCESS) {
      throw (
        result.error ??
        new Error(`SimpleSpanProcessor: span export failed (status ${result})`)
      );
    }
  }

  shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown(): Promise<void> {
    return this._exporter.shutdown();
  }
}
