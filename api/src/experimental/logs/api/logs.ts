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

import { LoggerProvider } from '../types/LoggerProvider';
import { NOOP_LOGGER_PROVIDER } from '../NoopLoggerProvider';
import { Logger } from '../types/Logger';
import { LoggerOptions } from '../types/LoggerOptions';
import {
  getGlobal,
  registerGlobal,
  unregisterGlobal,
} from '../../../internal/global-utils';
import { DiagAPI } from '../../../api/diag';

const API_NAME = 'logs';

export class LogsAPI {
  private static _instance?: LogsAPI;

  private constructor() {}

  public static getInstance(): LogsAPI {
    if (!this._instance) {
      this._instance = new LogsAPI();
    }

    return this._instance;
  }

  /**
   * Set the current global logger provider.
   * Returns true if the logger provider was successfully registered, else false.
   */
  public setGlobalLoggerProvider(provider: LoggerProvider): boolean {
    return registerGlobal(API_NAME, provider, DiagAPI.instance());
  }

  /**
   * Returns the global logger provider.
   *
   * @returns LoggerProvider
   */
  public getLoggerProvider(): LoggerProvider {
    return getGlobal(API_NAME) || NOOP_LOGGER_PROVIDER;
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
    unregisterGlobal(API_NAME, DiagAPI.instance());
  }
}