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
import { context } from '@opentelemetry/api';
import { Event } from '@opentelemetry/api-events';
import * as api from '@opentelemetry/api-events';
import { Logger, LogRecord, SeverityNumber } from '@opentelemetry/api-logs';

export class EventLogger implements api.EventLogger {
  private _logger: Logger;

  constructor(logger: Logger) {
    this._logger = logger;
  }

  emit(event: Event) {
    const attributes = event.attributes || {};
    attributes['event.name'] = event.name;

    const logRecord: LogRecord = {
      attributes: attributes,
      context: event.context || context.active(),
      severityNumber: event.severityNumber || SeverityNumber.INFO,
      timestamp: event.timestamp || Date.now(),
    };

    if (event.data) {
      logRecord.body = event.data;
    }

    this._logger.emit(logRecord);
  }
}
