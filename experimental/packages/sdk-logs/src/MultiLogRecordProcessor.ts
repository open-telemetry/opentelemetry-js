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

import { callWithTimeout } from '@opentelemetry/core';
import type { Context } from '@opentelemetry/api';
import type { LogRecordProcessor } from './LogRecordProcessor';
import type { LogRecord } from './LogRecord';

/**
 * Implementation of the {@link LogRecordProcessor} that simply forwards all
 * received events to a list of {@link LogRecordProcessor}s.
 */
export class MultiLogRecordProcessor implements LogRecordProcessor {
  constructor(
    public readonly processors: LogRecordProcessor[],
    public readonly forceFlushTimeoutMillis: number
  ) {}

  public async forceFlush(): Promise<void> {
    const timeout = this.forceFlushTimeoutMillis;
    await Promise.all(
      this.processors.map(processor =>
        callWithTimeout(processor.forceFlush(), timeout)
      )
    );
  }

  public onEmit(logRecord: LogRecord, context?: Context): void {
    this.processors.forEach(processors =>
      processors.onEmit(logRecord, context)
    );
  }

  public async shutdown(): Promise<void> {
    await Promise.all(this.processors.map(processor => processor.shutdown()));
  }
}
