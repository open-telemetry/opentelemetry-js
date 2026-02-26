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

import type { Context } from '@opentelemetry/api';
import { LogRecord, SeverityNumber } from './LogRecord';

export interface Logger {
  /**
   * Emit a log record. This method should only be used by log appenders.
   *
   * @param logRecord
   */
  emit(logRecord: LogRecord): void;

  /**
   * Tells if the logger is enabled for the given context, severity number and event
   * name if provided.
   * @param options the context, severity number and event name
   */
  enabled(options?: {
    context?: Context;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean;
}
