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

import type * as logsAPI from '@opentelemetry/api-logs';

import type { LoggerConfig } from './types';
import { LogRecord } from './LogRecord';
import { EVENT_LOGS_ATTRIBUTES } from './Attributes';
import { DEFAULT_EVENT_DOMAIN } from './config';

export class Logger implements logsAPI.Logger {
  constructor(private readonly config: LoggerConfig) {}

  public emitEvent(event: logsAPI.LogEvent): void {
    const logRecord = new LogRecord(this.config, event);
    logRecord.setAttributes({
      [EVENT_LOGS_ATTRIBUTES.name]: event.name,
      [EVENT_LOGS_ATTRIBUTES.domain]:
        event.domain ?? this.config.eventDomain ?? DEFAULT_EVENT_DOMAIN,
    });
    logRecord.emit();
  }

  public emitLogRecord(logRecord: logsAPI.LogRecord): void {
    new LogRecord(this.config, logRecord).emit();
  }
}
