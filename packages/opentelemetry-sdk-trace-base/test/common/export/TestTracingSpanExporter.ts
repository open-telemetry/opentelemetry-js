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

import { ExportResult } from '@opentelemetry/core';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  ReadableSpan,
  SpanProcessor,
  AlwaysOnSampler,
} from '../../../src';
import { Tracer } from '../../../src/Tracer';

/**
 * A test-only span exporter that naively simulates triggering instrumentation
 * (creating new spans) during export.
 */
export class TestTracingSpanExporter extends InMemorySpanExporter {
  private _exporterCreatedSpans: ReadableSpan[] = [];
  private _tracer: Tracer;

  constructor() {
    super();

    const spanProcessor: SpanProcessor = {
      forceFlush: () => {
        return Promise.resolve();
      },
      onStart: () => {},
      shutdown: () => {
        return Promise.resolve();
      },
      onEnd: span => {
        this._exporterCreatedSpans.push(span);
      },
    };

    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [spanProcessor],
    });

    this._tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new AlwaysOnSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
  }

  override export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (!this._stopped) {
      // Simulates an instrumented exporter by creating a span on the tracer.
      const createdSpan = this._tracer.startSpan('exporter-created-span');
      createdSpan.end();
    }

    super.export(spans, resultCallback);
  }

  override shutdown(): Promise<void> {
    return super.shutdown().then(() => {
      this._exporterCreatedSpans = [];
    });
  }

  override reset() {
    super.reset();
    this._exporterCreatedSpans = [];
  }

  getExporterCreatedSpans(): ReadableSpan[] {
    return this._exporterCreatedSpans;
  }
}
