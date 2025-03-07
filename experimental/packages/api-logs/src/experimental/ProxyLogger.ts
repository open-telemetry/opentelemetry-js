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
import { LoggerOptions } from '../types/LoggerOptions';
import { EventRecord } from './types/EventRecord';
import { ProxyLogger as BaseProxyLogger } from '../ProxyLogger';

export class ProxyLogger extends BaseProxyLogger implements Logger {
  // When a real implementation is provided, this will be it
  override _delegate?: Logger;

  constructor(
    override _provider: LoggerDelegator,
    name: string,
    version?: string | undefined,
    options?: LoggerOptions | undefined
  ) {
    super(_provider, name, version, options);
  }

  /**
   * Emit a log record. This method should only be used by log appenders.
   * @param logRecord
   */
  emitEvent(eventRecord: EventRecord): void {
    const logger = this._getLogger();
    // make sure that emitEvent function exists
    if (typeof logger.emitEvent === 'function') {
      this._getLogger().emitEvent(eventRecord);
    }
  }

  /**
   * Try to get a logger from the proxy logger provider.
   * If the proxy logger provider has no delegate, return a noop logger.
   */
  override _getLogger() {
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
