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

import { EventLogger } from './EventLogger';
import { Logger } from './Logger';
import { LoggerProvider } from './LoggerProvider';

/**
 * A registry for creating named {@link EventLogger}s.
 */
export interface EventLoggerProvider extends LoggerProvider {
  /**
   * Returns a EventLogger instance and is responsible for emitting Events as LogRecords.
   *
   * @param logger the delegate Logger used to emit Events as LogRecords.
   * @param domain the domain of emitted events, used to set the event.domain attribute.
   */
  getEventLogger(logger: Logger, domain: string): EventLogger;
}
