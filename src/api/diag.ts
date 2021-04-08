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

import { createLogLevelDiagLogger } from '../diag/internal/logLevelLogger';
import { DiagLogFunction, DiagLogger, DiagLogLevel } from '../diag/types';
import {
  getGlobal,
  registerGlobal,
  unregisterGlobal,
} from '../internal/global-utils';

const API_NAME = 'diag';

/**
 * Singleton object which represents the entry point to the OpenTelemetry internal
 * diagnostic API
 */
export class DiagAPI implements DiagLogger {
  private static _instance?: DiagAPI;

  /** Get the singleton instance of the DiagAPI API */
  public static instance(): DiagAPI {
    if (!this._instance) {
      this._instance = new DiagAPI();
    }

    return this._instance;
  }

  /**
   * Private internal constructor
   * @private
   */
  private constructor() {
    function _logProxy(funcName: keyof DiagLogger): DiagLogFunction {
      return function () {
        const logger = getGlobal('diag');
        // shortcut if logger not set
        if (!logger) return;
        return logger[funcName].apply(
          logger,
          // work around Function.prototype.apply types
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          arguments as any
        );
      };
    }

    // Using self local variable for minification purposes as 'this' cannot be minified
    const self = this;

    // DiagAPI specific functions

    self.setLogger = (
      logger: DiagLogger,
      logLevel: DiagLogLevel = DiagLogLevel.INFO
    ) => {
      if (logger === self) {
        // There isn't much we can do here.
        // Logging to the console might break the user application.
        // Try to log to self. If a logger was previously registered it will receive the log.
        const err = new Error(
          'Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation'
        );
        self.error(err.stack ?? err.message);
        return false;
      }

      return registerGlobal(
        'diag',
        createLogLevelDiagLogger(logLevel, logger),
        true
      );
    };

    self.disable = () => {
      unregisterGlobal(API_NAME);
    };

    self.verbose = _logProxy('verbose');
    self.debug = _logProxy('debug');
    self.info = _logProxy('info');
    self.warn = _logProxy('warn');
    self.error = _logProxy('error');
  }

  /**
   * Set the global DiagLogger and DiagLogLevel.
   * If a global diag logger is already set, this will override it.
   *
   * @param logger - [Optional] The DiagLogger instance to set as the default logger.
   * @param logLevel - [Optional] The DiagLogLevel used to filter logs sent to the logger. If not provided it will default to INFO.
   * @returns true if the logger was successfully registered, else false
   */
  public setLogger!: (logger: DiagLogger, logLevel?: DiagLogLevel) => boolean;

  // DiagLogger implementation
  public verbose!: DiagLogFunction;
  public debug!: DiagLogFunction;
  public info!: DiagLogFunction;
  public warn!: DiagLogFunction;
  public error!: DiagLogFunction;

  /**
   * Unregister the global logger and return to Noop
   */
  public disable!: () => void;
}
