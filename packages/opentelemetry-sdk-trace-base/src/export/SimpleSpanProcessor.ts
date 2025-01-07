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
  ExportResult,
} from '@opentelemetry/core';
import { Span } from '../Span';
import { SpanProcessor } from '../SpanProcessor';
import { ReadableSpan } from './ReadableSpan';
import { SpanExporter } from './SpanExporter';
import { Resource } from '@opentelemetry/resources';

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
    // await pending exports
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

    let exportPromise: Promise<void> | undefined = undefined;

    const doExport = () =>
      internal
        ._export(this._exporter, [span])
        .then((result: ExportResult) => {
          if (exportPromise) {
            this._pendingExports.delete(exportPromise);
          }
          if (result.code !== ExportResultCode.SUCCESS) {
            globalErrorHandler(
              result.error ??
                new Error(
                  `SimpleSpanProcessor: span export failed (status ${result})`
                )
            );
          }
        })
        .catch(error => {
          globalErrorHandler(error);
        });

    if (span.resource.asyncAttributesPending) {
      exportPromise = (span.resource as Resource)
        .waitForAsyncAttributes?.()
        .then(doExport, err => globalErrorHandler(err));
    } else {
      exportPromise = doExport();
    }

    // store the unresolved exports
    if (exportPromise) {
      this._pendingExports.add(exportPromise);
    }
  }

  shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown(): Promise<void> {
    return this._exporter.shutdown();
  }
}
