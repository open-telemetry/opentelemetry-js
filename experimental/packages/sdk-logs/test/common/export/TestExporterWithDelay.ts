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
