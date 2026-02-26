/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  API_BACKWARDS_COMPATIBILITY_VERSION,
  GLOBAL_LOGS_API_KEY,
  _global,
  makeGetter,
} from '../internal/global-utils';
import { LoggerProvider } from '../types/LoggerProvider';
import { NOOP_LOGGER_PROVIDER } from '../NoopLoggerProvider';
import { Logger } from '../types/Logger';
import { LoggerOptions } from '../types/LoggerOptions';
import { ProxyLoggerProvider } from '../ProxyLoggerProvider';

export class LogsAPI {
  private static _instance?: LogsAPI;

  private _proxyLoggerProvider = new ProxyLoggerProvider();

  private constructor() {}

  public static getInstance(): LogsAPI {
    if (!this._instance) {
      this._instance = new LogsAPI();
    }

    return this._instance;
  }

  public setGlobalLoggerProvider(provider: LoggerProvider): LoggerProvider {
    if (_global[GLOBAL_LOGS_API_KEY]) {
      return this.getLoggerProvider();
    }

    _global[GLOBAL_LOGS_API_KEY] = makeGetter<LoggerProvider>(
      API_BACKWARDS_COMPATIBILITY_VERSION,
      provider,
      NOOP_LOGGER_PROVIDER
    );
    this._proxyLoggerProvider._setDelegate(provider);

    return provider;
  }

  /**
   * Returns the global logger provider.
   *
   * @returns LoggerProvider
   */
  public getLoggerProvider(): LoggerProvider {
    return (
      _global[GLOBAL_LOGS_API_KEY]?.(API_BACKWARDS_COMPATIBILITY_VERSION) ??
      this._proxyLoggerProvider
    );
  }

  /**
   * Returns a logger from the global logger provider.
   *
   * @returns Logger
   */
  public getLogger(
    name: string,
    version?: string,
    options?: LoggerOptions
  ): Logger {
    return this.getLoggerProvider().getLogger(name, version, options);
  }

  /** Remove the global logger provider */
  public disable(): void {
    delete _global[GLOBAL_LOGS_API_KEY];
    this._proxyLoggerProvider = new ProxyLoggerProvider();
  }
}
