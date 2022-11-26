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

import type { ExportResult } from "@opentelemetry/core";
import { ExportResultCode } from "@opentelemetry/core";

import type { ReadableLogRecord } from "./ReadableLogRecord";
import type { LogRecordExporter } from "./LogRecordExporter";

/**
 * This is implementation of {@link LogRecordExporter} that prints LogRecords to the
 * console. This class can be used for diagnostic purposes.
 */
export class ConsoleLogRecordExporter implements LogRecordExporter {
  /**
   * Export logs.
   * @param logs
   * @param resultCallback
   */
  public export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void) {
    this._sendLogRecords(logs).then((res) => resultCallback(res));
  }

  /**
   * Shutdown the exporter.
   */
  public shutdown(): Promise<void> {
    return Promise.resolve();
  }

  private _sendLogRecords(logRecords: ReadableLogRecord[]): Promise<ExportResult> {
    for (const logRecord of logRecords) {
      console.dir(logRecord, { depth: 3 });
    }
    return Promise.resolve({ code: ExportResultCode.SUCCESS });
  }
}
