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

import { callWithTimeout } from "@opentelemetry/core";

import type { LogRecordProcessor } from "./LogRecordProcessor";
import type { ReadableLogRecord } from "./export/ReadableLogRecord";

/**
 * Implementation of the {@link LogRecordProcessor} that simply forwards all
 * received events to a list of {@link LogRecordProcessor}s.
 */
export class MultiLogRecordProcessor implements LogRecordProcessor {
  private readonly _processors: LogRecordProcessor[] = [];

  constructor(private readonly _forceFlushTimeoutMillis: number) {}

  public addLogRecordProcessor(processor: LogRecordProcessor) {
    this._processors.push(processor);
  }

  public async forceFlush(): Promise<void> {
    const timeout = this._forceFlushTimeoutMillis;
    await Promise.all(this._processors.map((processor) => callWithTimeout(processor.forceFlush(), timeout)));
  }

  public onEmit(logRecord: ReadableLogRecord): void {
    this._processors.forEach((processors) => processors.onEmit(logRecord));
  }

  public async shutdown(): Promise<void> {
    await Promise.all(this._processors.map((processor) => processor.shutdown()));
  }
}
