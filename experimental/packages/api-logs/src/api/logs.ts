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
import type { LoggerProvider } from '../types/LoggerProvider';
import { NOOP_LOGGER_PROVIDER } from '../NoopLoggerProvider';
import type { Logger } from '../types/Logger';
import type { LoggerOptions } from '../types/LoggerOptions';
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
   * Returns a Logger, creating one if one with the given name, version,
   * schemaUrl, and attributes is not already created.
   *
   * Getting a Logger may be expensive, especially when `attributes` are
   * provided. Reuse Logger instances where possible instead of calling
   * `getLogger()` on hot paths.
   *
   * @param name The name of the logger or instrumentation library.
   * @param version The version of the logger or instrumentation library.
   * @param options The options of the logger or instrumentation library.
   * @returns {@link Logger}
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
