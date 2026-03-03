/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoggerProvider } from './types/LoggerProvider';
import { Logger } from './types/Logger';
import { LoggerOptions } from './types/LoggerOptions';
import { NOOP_LOGGER_PROVIDER } from './NoopLoggerProvider';
import { ProxyLogger } from './ProxyLogger';

export class ProxyLoggerProvider implements LoggerProvider {
  private _delegate?: LoggerProvider;

  getLogger(
    name: string,
    version?: string | undefined,
    options?: LoggerOptions | undefined
  ): Logger {
    return (
      this._getDelegateLogger(name, version, options) ??
      new ProxyLogger(this, name, version, options)
    );
  }

  /**
   * Get the delegate logger provider.
   * Used by tests only.
   * @internal
   */
  _getDelegate(): LoggerProvider {
    return this._delegate ?? NOOP_LOGGER_PROVIDER;
  }

  /**
   * Set the delegate logger provider
   * @internal
   */
  _setDelegate(delegate: LoggerProvider) {
    this._delegate = delegate;
  }

  /**
   * @internal
   */
  _getDelegateLogger(
    name: string,
    version?: string | undefined,
    options?: LoggerOptions | undefined
  ): Logger | undefined {
    return this._delegate?.getLogger(name, version, options);
  }
}
