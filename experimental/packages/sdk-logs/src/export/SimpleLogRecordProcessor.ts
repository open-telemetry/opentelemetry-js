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
import { ExportResultCode, globalErrorHandler } from "@opentelemetry/core";

import type { LogRecordExporter } from "./LogRecordExporter";
import type { LogRecordProcessor } from "../LogRecordProcessor";
import type { ReadableLogRecord } from "./ReadableLogRecord";

export class SimpleLogRecordProcessor implements LogRecordProcessor {
  constructor(private readonly _exporter: LogRecordExporter) {}

  public onEmit(logRecord: ReadableLogRecord): void {
    this._exporter.export([logRecord], (res: ExportResult) => {
      if (res.code !== ExportResultCode.SUCCESS) {
        globalErrorHandler(
          res.error ?? new Error(`SimpleLogRecordProcessor: log record export failed (status ${res})`)
        );
        return;
      }
    });
  }

  public forceFlush(): Promise<void> {
    // do nothing as all spans are being exported without waiting
    return Promise.resolve();
  }

  public shutdown(): Promise<void> {
    return this._exporter.shutdown();
  }
}
