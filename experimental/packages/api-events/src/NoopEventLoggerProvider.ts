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

import { EventLoggerProvider } from './types/EventLoggerProvider';
import { EventLogger } from './types/EventLogger';
import { EventLoggerOptions } from './types/EventLoggerOptions';
import { NoopEventLogger } from './NoopEventLogger';

export class NoopEventLoggerProvider implements EventLoggerProvider {
  getEventLogger(
    _name: string,
    _version?: string | undefined,
    _options?: EventLoggerOptions | undefined
  ): EventLogger {
    return new NoopEventLogger();
  }
}

export const NOOP_EVENT_LOGGER_PROVIDER = new NoopEventLoggerProvider();
