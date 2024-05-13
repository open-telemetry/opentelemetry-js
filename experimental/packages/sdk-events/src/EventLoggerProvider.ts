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
import * as api from '@opentelemetry/api-events';
import { EventLogger } from './EventLogger';
import { LoggerProvider } from '@opentelemetry/sdk-logs';

export class EventLoggerProvider implements api.EventLoggerProvider {
  private _loggerProvider: LoggerProvider;

  constructor(loggerProvider: LoggerProvider) {
    this._loggerProvider = loggerProvider;
  }

  getEventLogger(
    name: string,
    version?: string,
    options?: api.EventLoggerOptions
  ): api.EventLogger {
    const logger = this._loggerProvider.getLogger(name, version, options);
    return new EventLogger(logger);
  }

  public forceFlush(): Promise<void> {
    return this._loggerProvider.forceFlush();
  }
}
