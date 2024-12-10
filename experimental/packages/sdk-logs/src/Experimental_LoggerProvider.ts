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
import { diag } from '@opentelemetry/api';
import type * as logsAPI from '@opentelemetry/api-logs/experimental';
import { NOOP_LOGGER } from '@opentelemetry/api-logs/experimental';
import { LoggerProvider as BaseLoggerProvider } from './LoggerProvider';

import type { LoggerProviderConfig } from './types';
import { Logger } from './Experimental_Logger';

export const DEFAULT_LOGGER_NAME = 'unknown';

export class LoggerProvider
  extends BaseLoggerProvider
  implements logsAPI.LoggerProvider
{
  constructor(config: LoggerProviderConfig = {}) {
    super(config);
  }

  /**
   * Get a logger with the configuration of the LoggerProvider.
   */
  override getLogger(
    name: string,
    version?: string,
    options?: logsAPI.LoggerOptions
  ): logsAPI.Logger {
    if (this._shutdownOnce.isCalled) {
      diag.warn('A shutdown LoggerProvider cannot provide a Logger');
      return NOOP_LOGGER;
    }

    if (!name) {
      diag.warn('Logger requested without instrumentation scope name.');
    }
    const loggerName = name || DEFAULT_LOGGER_NAME;
    const key = `${loggerName}@${version || ''}:${options?.schemaUrl || ''}`;
    if (!this._sharedState.loggers.has(key)) {
      this._sharedState.loggers.set(
        key,
        new Logger(
          { name: loggerName, version, schemaUrl: options?.schemaUrl },
          this._sharedState
        )
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._sharedState.loggers.get(key)! as logsAPI.Logger;
  }
}
