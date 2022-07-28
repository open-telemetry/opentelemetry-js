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
import { LogRecord } from './LogRecord';
import { Event } from './Event';

export interface Logger {
  /**
   * Creates a new LogRecord.
   *
   * @returns LogRecord
   */
  createLogRecord(): LogRecord;

  /**
   * Creates a new Event.
   *
   * @param name the name of the event
   * @param [domain] the domain of the event
   * @returns Event The newly created event
   */
  createEvent(name: string, domain?: string): Event;

  /**
   * Emits a log record
   *
   * @param logRecord
   */
  emit(logRecord: LogRecord): void;

  /**
   * Emits an event
   *
   * @param name
   * @param attributes
   */
  emitEvent(name: string, attributes?: Attributes): void;
}
