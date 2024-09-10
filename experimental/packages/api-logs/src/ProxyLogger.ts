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

import { NOOP_LOGGER } from './NoopLogger';
import { Logger } from './types/Logger';
import { LoggerOptions } from './types/LoggerOptions';
import { LogRecord } from './types/LogRecord';

export class ProxyLogger implements Logger {
  // When a real implementation is provided, this will be it
  private _delegate?: Logger;

  constructor(
    private _provider: LoggerDelegator,
    public readonly name: string,
    public readonly version?: string | undefined,
    public readonly options?: LoggerOptions | undefined
  ) {}

  /**
   * Emit a log record. This method should only be used by log appenders.
   *
   * @param logRecord
   */
  emit(logRecord: LogRecord): void {
    this._getLogger().emit(logRecord);
  }

  /**
   * Try to get a logger from the proxy logger provider.
   * If the proxy logger provider has no delegate, return a noop logger.
   */
  private _getLogger() {
    if (this._delegate) {
      return this._delegate;
    }
    const logger = this._provider.getDelegateLogger(
      this.name,
      this.version,
      this.options
    );
    if (!logger) {
      return NOOP_LOGGER;
    }
    this._delegate = logger;
    return this._delegate;
  }
}

export interface LoggerDelegator {
  getDelegateLogger(
    name: string,
    version?: string,
    options?: LoggerOptions
  ): Logger | undefined;
}
