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

import { Attributes } from '@opentelemetry/api';

export interface LogRecord {
  /**
   * The time when the log record occurred as UNIX Epoch time in nanoseconds.
   */
  timestamp?: number;

  /**
   * Numerical value of the severity.
   */
  severityNumber?: number;

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
   * 8 least significant bits are the trace flags as defined in W3C Trace Context specification.
   */
  traceFlags?: number;

  /**
   * A unique identifier for a trace.
   */
  traceId?: string;

  /**
   * A unique identifier for a span within a trace.
   */
  spanId?: string;
}
