/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExportResult } from '@opentelemetry/core';
import { InMemoryLogRecordExporter, ReadableLogRecord } from '../../../src';

/**
 * A test-only exporter that delays during export to mimic a real exporter.
 */
export class TestExporterWithDelay extends InMemoryLogRecordExporter {
  private _exporterCreatedLogRecords: ReadableLogRecord[] = [];

  constructor() {
    super();
  }

  override export(
    logRecords: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ): void {
    super.export(logRecords, () => setTimeout(resultCallback, 1));
  }

  override shutdown(): Promise<void> {
    return super.shutdown().then(() => {
      this._exporterCreatedLogRecords = [];
    });
  }

  override reset() {
    super.reset();
    this._exporterCreatedLogRecords = [];
  }

  getExporterCreatedLogRecords(): ReadableLogRecord[] {
    return this._exporterCreatedLogRecords;
  }
}
