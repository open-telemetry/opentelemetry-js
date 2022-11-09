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
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { LogRecord } from './LogRecord';

export class Logger implements api.Logger {
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;
  readonly provider: LoggerProvider;

  constructor(
    resource: Resource,
    instrumentationScope: InstrumentationScope,
    provider: LoggerProvider
  ) {
    this.resource = resource;
    this.instrumentationScope = instrumentationScope;
    this.provider = provider;
  }

  emitLogRecord(logRecord: api.LogRecord): void {
    this._emit(new LogRecord(
      this.resource,
      this.instrumentationScope,
      logRecord.timestamp,
      logRecord.severityNumber,
      logRecord.severityText,
      logRecord.body,
      logRecord.attributes,
      logRecord.traceFlags,
      logRecord.traceId,
      logRecord.spanId
    ));
  }

  emitEvent(event: api.LogEvent): void {
    const logRecord = new LogRecord(
      this.resource,
      this.instrumentationScope,
      event.timestamp,
      undefined,
      undefined,
      undefined,
      event.attributes,
      event.traceFlags,
      event.traceId,
      event.spanId
    );

    logRecord.setAttribute('event.name', event.name);

    this._emit(logRecord);
  }

  _emit(logRecord: LogRecord): void {
    this.provider.processors.forEach(processor => {
      processor.onEmit(logRecord);
    });
  }
}
