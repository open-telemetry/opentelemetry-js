/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExportResult } from '@opentelemetry/core';
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace';
import {
  InMemorySpanExporter,
  AlwaysOnSampler,
} from '@opentelemetry/sdk-trace';
import { BasicTracerProvider } from '../../../src/index-shim';


/**
 * A test-only span exporter that naively simulates triggering instrumentation
 * (creating new spans) during export.
 */
export class TestTracingSpanExporter extends InMemorySpanExporter {
  private _exporterCreatedSpans: ReadableSpan[] = [];
  private _tracer;

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
      sampler: new AlwaysOnSampler(),
    });

    this._tracer = tracerProvider.getTracer('default', '0.0.1');
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
