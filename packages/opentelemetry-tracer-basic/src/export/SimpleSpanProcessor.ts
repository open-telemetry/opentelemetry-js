/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { TraceFlags } from '@opentelemetry/types';
import { SpanProcessor } from '../SpanProcessor';
import { SpanExporter } from './SpanExporter';
import { Span } from '../Span';

/**
 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
 * to {@link ReadableSpan} and passes it to the configured exporter.
 *
 * Only spans that are sampled are converted.
 */
export class SimpleSpanProcessor implements SpanProcessor {
  constructor(private readonly _exporter: SpanExporter) {}

  // does nothing.
  onStart(span: Span): void {}

  onEnd(span: Span): void {
    if (span.context().traceFlags !== TraceFlags.SAMPLED) return;
    this._exporter.export([span.toReadableSpan()], () => {});
  }

  shutdown(): void {
    this._exporter.shutdown();
  }
}
