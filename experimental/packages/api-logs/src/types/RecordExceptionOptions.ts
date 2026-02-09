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

import { Context, TimeInput } from '@opentelemetry/api';
import { LogAttributes, LogBody, SeverityNumber } from './LogRecord';

export interface RecordExceptionOptions {
  /**
   * The time when the log record occurred as UNIX Epoch time in nanoseconds.
   */
  timestamp?: TimeInput;

  /**
   * Time when the event was observed by the collection system.
   */
  observedTimestamp?: TimeInput;

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
  body?: LogBody;

  /**
   * The event name of the log record.
   */
  eventName?: string;

  /**
   * Attributes that define the log record.
   */
  attributes?: LogAttributes;

  /**
   * The Context associated with the LogRecord.
   */
  context?: Context;
}
