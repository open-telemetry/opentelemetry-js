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

import type * as logsAPI from '@opentelemetry/api-logs/experimental';
import { Logger as BaseLogger } from './Logger';
import type { InstrumentationScope } from '@opentelemetry/core';
import { context } from '@opentelemetry/api';
import { LoggerProviderSharedState } from './internal/LoggerProviderSharedState';
import { SeverityNumber } from '@opentelemetry/api-logs/experimental';

export class Logger extends BaseLogger implements logsAPI.Logger {
  constructor(
    instrumentationScope: InstrumentationScope,
    _sharedState: LoggerProviderSharedState
  ) {
    super(instrumentationScope, _sharedState);
  }

  public emitEvent(eventRecord: logsAPI.EventRecord): void {
    const attributes = eventRecord.attributes || {};

    // TODO: change to ATTR_EVENT_NAME, it is under experimental_attributes currently.
    // this will add more dependencies.
    attributes['event.name'] = eventRecord.name;

    const logRecord: logsAPI.LogRecord = {
      attributes: attributes,
      context: eventRecord.context || context.active(),
      severityNumber: eventRecord.severityNumber || SeverityNumber.INFO,
      timestamp: eventRecord.timestamp || Date.now(),
    };

    if (eventRecord.data) {
      logRecord.body = eventRecord.data;
    }
    if (this.emit) {
      this.emit(logRecord);
    }
  }
}
