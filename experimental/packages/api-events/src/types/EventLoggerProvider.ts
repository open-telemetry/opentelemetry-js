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
import { EventLoggerOptions } from './EventLoggerOptions';

/**
 * A registry for creating named {@link EventLogger}s.
 */
export interface EventLoggerProvider {
  /**
   * Returns an EventLogger, creating one if one with the given name, version, and
   * schemaUrl pair is not already created.
   *
   * @param name The name of the event logger or instrumentation library.
   * @param version The version of the event logger or instrumentation library.
   * @param options The options of the event logger or instrumentation library.
   * @returns EventLogger An event logger with the given name and version.
   */
  getEventLogger(
    name: string,
    version?: string,
    options?: EventLoggerOptions
  ): EventLogger;
}
