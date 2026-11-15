/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context } from '../context/types';
import { NOOP_LOGGER } from './NoopLogger';
import type { Logger } from './Logger';
import type { LoggerOptions } from './LoggerOptions';
import type { LogRecord } from './LogRecord';
import type { SeverityNumber } from './LogRecord';

export class ProxyLogger implements Logger {
  // When a real implementation is provided, this will be it
  private _delegate?: Logger;
  private _provider: LoggerDelegator;
  public readonly name: string;
  public readonly version?: string;
  public readonly options?: LoggerOptions;

  constructor(
    provider: LoggerDelegator,
    name: string,
    version?: string,
    options?: LoggerOptions
  ) {
    this._provider = provider;
    this.name = name;
    this.version = version;
    this.options = options;
  }

  /**
   * Emit a log record. This method should only be used by log appenders.
   *
   * @param logRecord
   */
  emit(logRecord: LogRecord): void {
    this._getLogger().emit(logRecord);
  }

  enabled(options?: {
    context?: Context;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean {
    return this._getLogger().enabled(options);
  }

  /**
   * Try to get a logger from the proxy logger provider.
   * If the proxy logger provider has no delegate, return a noop logger.
   */
  private _getLogger() {
    if (this._delegate) {
      return this._delegate;
    }
    const logger = this._provider._getDelegateLogger(
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
  _getDelegateLogger(
    name: string,
    version?: string,
    options?: LoggerOptions
  ): Logger | undefined;
}
