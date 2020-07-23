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

import {
  BasicTracerProvider,
  SpanExporter,
  ReadableSpan,
  Tracer,
  SpanProcessor,
} from '../../src';
import { ExportResult, NoopLogger, AlwaysOnSampler } from '@opentelemetry/core';

/**
 * A test-only span exporter that naively simulates triggering instrumentation
 * (creating new spans) during export.
 */
export class TestTracingSpanExporter implements SpanExporter {
  private _processedSpans: ReadableSpan[] = [];
  private _exporterCreatedSpans: ReadableSpan[] = [];
  private _stopped = false;
  private _tracer: Tracer;

  constructor() {
    const tracerProvider = new BasicTracerProvider({
      logger: new NoopLogger(),
    });

    const spanProcessor: SpanProcessor = {
      forceFlush: () => {},
      onStart: () => {},
      shutdown: () => {},
      onEnd: span => {
        this._exporterCreatedSpans.push(span);
      },
    };

    tracerProvider.addSpanProcessor(spanProcessor);

    this._tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new AlwaysOnSampler() },
      tracerProvider
    );
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._stopped) {
      return resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
    }

    // Simulates an instrumented exporter by creating a span on the tracer.
    const createdSpan = this._tracer.startSpan('exporter-created-span');
    createdSpan.end();

    this._processedSpans.push(...spans);
    return resultCallback(ExportResult.SUCCESS);
  }

  shutdown(): void {
    this._stopped = true;
    this._processedSpans = [];
    this._exporterCreatedSpans = [];
  }

  reset() {
    this._processedSpans = [];
    this._exporterCreatedSpans = [];
  }

  getExporterCreatedSpans(): ReadableSpan[] {
    return this._exporterCreatedSpans;
  }

  getProcessedSpans(): ReadableSpan[] {
    return this._processedSpans;
  }
}
