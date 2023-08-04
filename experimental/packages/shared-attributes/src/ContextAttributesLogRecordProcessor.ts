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

import type { LogRecordProcessor, LogRecord } from '@opentelemetry/sdk-logs';
import { context } from '@opentelemetry/api';
import { getContextAttributes } from './utils';

/**
 * Implementation of the {@link LogRecordProcessor} that simply forwards all
 * received events to a list of {@link LogRecordProcessor}s.
 */
export class ContextAttributesLogRecordProcessor implements LogRecordProcessor {
  public async forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  public onEmit(logRecord: LogRecord): void {
    const contextAttributes = getContextAttributes(context.active());
    if (contextAttributes) {
      for (const [k, v] of Object.entries(contextAttributes)) {
        logRecord.setAttribute(k, v);
      }
    }
  }

  public async shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
