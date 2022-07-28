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

import { Logger } from './types/Logger';
import { Event } from './types/Event';
import { Attributes } from '@opentelemetry/api';
import { LogRecord } from './types/LogRecord';
import { NonRecordingLogRecord } from './NonRecordingLogRecord';
import { NonRecordingEvent } from './NonRecordingEvent';

export class NoopLogger implements Logger {
  createLogRecord(): LogRecord {
    return new NonRecordingLogRecord();
  }

  createEvent(name: string, domain?: string): Event {
    return new NonRecordingEvent(name, domain);
  }

  emit(logRecord: LogRecord): void;
  emit(event: Event): void;
  emit(_event: unknown): void {}

  emitEvent(_name: string, _attributes?: Attributes): void {}
}
