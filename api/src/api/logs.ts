/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getGlobal,
  registerGlobal,
  unregisterGlobal,
} from '../internal/global-utils';
import type { LoggerProvider } from '../logs/LoggerProvider';
import type { Logger } from '../logs/Logger';
import type { LoggerOptions } from '../logs/LoggerOptions';
import { ProxyLoggerProvider } from '../logs/ProxyLoggerProvider';
import { DiagAPI } from './diag';

const API_NAME = 'logs';

/**
 * Singleton object which represents the entry point to the OpenTelemetry Logs API
 *
 * @since 1.10.0
 */
export class LogsAPI {
  private static _instance?: LogsAPI;

  private _proxyLoggerProvider = new ProxyLoggerProvider();

  /** Empty private constructor prevents end users from constructing a new instance of the API */
  private constructor() {}

  /** Get the singleton instance of the Logs API */
  public static getInstance(): LogsAPI {
    if (!this._instance) {
      this._instance = new LogsAPI();
    }

    return this._instance;
  }

  public setGlobalLoggerProvider(provider: LoggerProvider): boolean {
    const success = registerGlobal(API_NAME, provider, DiagAPI.instance());
    if (success) {
      this._proxyLoggerProvider._setDelegate(provider);
    }
    return success;
  }

  /**
   * Returns the global logger provider.
   *
   * @returns LoggerProvider
   */
  public getLoggerProvider(): LoggerProvider {
    return getGlobal(API_NAME) || this._proxyLoggerProvider;
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
    unregisterGlobal(API_NAME, DiagAPI.instance());
    this._proxyLoggerProvider = new ProxyLoggerProvider();
  }
}
