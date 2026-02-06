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

  public shutdown(): Promise<void> {
    this._stopped = true;
    this.reset();
    return Promise.resolve();
  }

  public forceFlush(): Promise<void> {
    // nothing to flush
    return Promise.resolve();
  }

  public getFinishedLogRecords(): ReadableLogRecord[] {
    return this._finishedLogRecords;
  }

  public reset(): void {
    this._finishedLogRecords = [];
  }
}
