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

import type { Attributes, SpanContext, TimeInput } from "@opentelemetry/api";

import type { LogEvent, LogRecord, SeverityNumber } from "./LogRecord";

export interface LogRecordOptions {
  /**
   * The time when the log record occurred as UNIX Epoch time in nanoseconds.
   */
  timestamp?: TimeInput;

  /**
   * Numerical value of the severity.
   */
  severityNumber?: SeverityNumber;

  /**
   * The severity text.
   */
  severityText?: string;

  /**
   * A value containing the body of the log record.
   */
  body?: string;

  /**
   * Attributes that define the log record.
   */
  attributes?: Attributes;

  /**
   * The trace context.
   */
  context?: SpanContext;
}

export interface Logger {
  /**
   * Get a log record. This method should only be used by log appenders.
   *
   * @param options
   */
  getLogRecord(options?: LogRecordOptions): LogRecord;

  /**
   * Get an event. This method should only be used by instrumentations emitting events.
   *
   * @param eventName the event name, which acts as a classifier for events. Within a particular event domain,
   * event name defines a particular class or type of event.
   * @param options
   */
  getLogEvent(eventName: string, options?: LogRecordOptions): LogEvent;
}
