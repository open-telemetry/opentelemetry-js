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

import * as api from '@opentelemetry/api-logs';
import { LoggerProvider } from './LoggerProvider';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { LogData } from './export/LogData';

export class Logger implements api.Logger {
  readonly resource: Resource;
  readonly instrumentationLibrary: InstrumentationLibrary;
  readonly provider: LoggerProvider;

  constructor(
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    provider: LoggerProvider
  ) {
    this.resource = resource;
    this.instrumentationLibrary = instrumentationLibrary;
    this.provider = provider;
  }

  emitLogRecord(logRecord: api.LogRecord): void {
    const data = new LogData(logRecord, this.instrumentationLibrary);
    this.provider.processors.forEach(processor => {
      processor.emit(data);
    });
  }

  emitEvent(event: api.LogEvent): void {
    const log: api.LogRecord = {
      timestamp: event.timestamp,
      traceFlags: event.traceFlags,
      spanId: event.spanId,
      traceId: event.traceId,
      attributes: event.attributes
    };

    if (!log.attributes) {
      log.attributes = {};
    }

    log.attributes['event.name'] = event.name;    

    this.emitLogRecord(log);
  }
}
