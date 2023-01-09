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

/**
 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
 * to {@link ReadableSpan} and passes it to the configured exporter.
 *
 * Only spans that are sampled are converted.
 */
export class SimpleSpanProcessor implements SpanProcessor {
  private _shutdownOnce: BindOnceFuture<void>;
  private _unresolvedResources: Set<Promise<void>>;

  constructor(private readonly _exporter: SpanExporter) {
    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
    this._unresolvedResources = new Set<Promise<void>>();
  }

  async forceFlush(): Promise<void> {
    // await unresolved resources before resolving
    for (const unresolvedResource of this._unresolvedResources) {
      await unresolvedResource;
    }

    return Promise.resolve();
  }

  onStart(_span: Span, _parentContext: Context): void {
    // store the resource's unresolved promise
    if (!_span.resource.asyncAttributesHaveResolved()) {
      this._unresolvedResources.add(_span.resource.waitForAsyncAttributes());
    }
  }

  onEnd(span: ReadableSpan): void {
    if (this._shutdownOnce.isCalled) {
      return;
    }

    if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) {
      return;
    }

    const doExport = () =>
      internal
        ._export(this._exporter, [span])
        .then((result: ExportResult) => {
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

    // Avoid scheduling a promise to make the behavior more predictable and easier to test
    if (span.resource.asyncAttributesHaveResolved()) {
      void doExport();
    } else {
      span.resource
        .waitForAsyncAttributes()
        .then(doExport, err => globalErrorHandler(err));
    }
  }

  shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown(): Promise<void> {
    return this._exporter.shutdown();
  }
}
