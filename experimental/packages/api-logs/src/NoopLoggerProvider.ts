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

import { Entity } from '@opentelemetry/api';
import { NoopLogger } from './NoopLogger';
import { Logger } from './types/Logger';
import { LoggerOptions } from './types/LoggerOptions';
import { LoggerProvider } from './types/LoggerProvider';

export class NoopLoggerProvider implements LoggerProvider {
  getLogger(
    _name: string,
    _version?: string | undefined,
    _options?: LoggerOptions | undefined
  ): Logger {
    return new NoopLogger();
  }

  forEntity(_entity: Entity): LoggerProvider {
    return this;
  }
}

export const NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
