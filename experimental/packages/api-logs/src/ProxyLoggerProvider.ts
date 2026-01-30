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

import { LoggerProvider } from './types/LoggerProvider';
import { Logger } from './types/Logger';
import { LoggerOptions } from './types/LoggerOptions';
import { NOOP_LOGGER_PROVIDER } from './NoopLoggerProvider';
import { ProxyLogger } from './ProxyLogger';
import { Entity } from '@opentelemetry/api';

export class ProxyLoggerProvider implements LoggerProvider {
  private _delegate?: LoggerProvider;
  private _boundEntity?: Entity;

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

  forEntity(entity: Entity): LoggerProvider {
    const boundProvider = this._delegate?.forEntity(entity);
    if (boundProvider) {
      return boundProvider;
    }
    const proxyLoggerProvider = new ProxyLoggerProvider();
    proxyLoggerProvider._boundEntity = entity;
    return proxyLoggerProvider;
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
    if (this._boundEntity) {
      const boundProvider = this._delegate?.forEntity(this._boundEntity);
      return boundProvider?.getLogger(name, version, options);
    }
    return this._delegate?.getLogger(name, version, options);
  }
}
