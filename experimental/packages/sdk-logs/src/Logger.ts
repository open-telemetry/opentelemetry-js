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

import type * as logsAPI from "@opentelemetry/api-logs";
import type { InstrumentationScope } from "@opentelemetry/core";

import type { LoggerConfig } from "./types";
import type { LoggerSharedState } from "./LoggerSharedState";
import { LogRecord } from "./LogRecord";
import { EVENT_LOGS_ATTRIBUTES } from "./semantic-conventions";

export class Logger implements logsAPI.Logger {
  private readonly _eventDomain: string;
  private readonly _loggerSharedState: LoggerSharedState;
  private readonly _instrumentationScope: InstrumentationScope;

  constructor(config: LoggerConfig) {
    this._eventDomain = config.eventDomain;
    this._loggerSharedState = config.loggerSharedState;
    this._instrumentationScope = config.instrumentationScope;
  }

  /**
   * Get a new {@link LogRecord} instance
   *
   * @param options LogRecordOptions used for LogRecord creation
   * @returns return a LogRecord instance
   */
  public getLogRecord(options: logsAPI.LogRecordOptions = {}): logsAPI.LogRecord {
    return new LogRecord(this._loggerSharedState, {
      instrumentationScope: this._instrumentationScope,
      ...options,
    });
  }

  /**
   * Get a new {@link LogEvent} instance
   *
   * @param eventName the name of event
   * @param options LogRecordOptions used for LogRecord creation
   * @returns
   */
  public getLogEvent(eventName: string, options: logsAPI.LogRecordOptions = {}): logsAPI.LogEvent {
    // inject 'event.name' and 'event.domain' attributes
    return this.getLogRecord(options).setAttributes({
      [EVENT_LOGS_ATTRIBUTES.name]: eventName,
      [EVENT_LOGS_ATTRIBUTES.domain]: this._eventDomain,
    });
  }
}
