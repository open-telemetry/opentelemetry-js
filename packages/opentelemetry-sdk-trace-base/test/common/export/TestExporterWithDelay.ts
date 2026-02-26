/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExportResult } from '@opentelemetry/core';
import { InMemorySpanExporter, ReadableSpan } from '../../../src';

/**
 * A test-only exporter that delays during export to mimic a real exporter.
 */
export class TestExporterWithDelay extends InMemorySpanExporter {
  private _exporterCreatedSpans: ReadableSpan[] = [];

  constructor() {
    super();
  }

  override export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    super.export(spans, result => setTimeout(() => resultCallback(result), 1));
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
