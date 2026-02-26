/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';

import type { ReadableLogRecord } from './ReadableLogRecord';
import type { LogRecordExporter } from './LogRecordExporter';

/**
 * This class can be used for testing purposes. It stores the exported LogRecords
 * in a list in memory that can be retrieved using the `getFinishedLogRecords()`
 * method.
 */
export class InMemoryLogRecordExporter implements LogRecordExporter {
  private _finishedLogRecords: ReadableLogRecord[] = [];

  /**
   * Indicates if the exporter has been "shutdown."
   * When false, exported log records will not be stored in-memory.
   */
  protected _stopped = false;

  public export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (this._stopped) {
      return resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Exporter has been stopped'),
      });
    }

    this._finishedLogRecords.push(...logs);
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  public async shutdown(): Promise<void> {
    this._stopped = true;
    this.reset();
  }

  public async forceFlush(): Promise<void> {
    // nothing to flush
  }

  public getFinishedLogRecords(): ReadableLogRecord[] {
    return this._finishedLogRecords;
  }

  public reset(): void {
    this._finishedLogRecords = [];
  }
}
