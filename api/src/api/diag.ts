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

import { DiagComponentLogger } from '../diag/ComponentLogger';
import { createLogLevelDiagLogger } from '../diag/internal/logLevelLogger';
import {
  ComponentLoggerOptions,
  DiagLogFunction,
  DiagLogger,
  DiagLoggerApi,
  DiagLogLevel,
} from '../diag/types';
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
export class DiagAPI implements DiagLogger, DiagLoggerApi {
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
      return function (...args) {
        const logger = getGlobal('diag');
        // shortcut if logger not set
        if (!logger) return;
        return logger[funcName](...args);
      };
    }

    // Using self local variable for minification purposes as 'this' cannot be minified
    const self = this;

    // DiagAPI specific functions

    const setLogger: DiagLoggerApi['setLogger'] = (
      logger,
      optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }
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

      if (typeof optionsOrLogLevel === 'number') {
        optionsOrLogLevel = {
          logLevel: optionsOrLogLevel,
        };
      }

      const oldLogger = getGlobal('diag');
      const newLogger = createLogLevelDiagLogger(
        optionsOrLogLevel.logLevel ?? DiagLogLevel.INFO,
        logger
      );
      // There already is an logger registered. We'll let it know before overwriting it.
      if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
        const stack = new Error().stack ?? '<failed to generate stacktrace>';
        oldLogger.warn(`Current logger will be overwritten from ${stack}`);
        newLogger.warn(
          `Current logger will overwrite one already registered from ${stack}`
        );
      }

      return registerGlobal('diag', newLogger, self, true);
    };

    self.setLogger = setLogger;

    self.disable = () => {
      unregisterGlobal(API_NAME, self);
    };

    self.createComponentLogger = (options: ComponentLoggerOptions) => {
      return new DiagComponentLogger(options);
    };

    self.verbose = _logProxy('verbose');
    self.debug = _logProxy('debug');
    self.info = _logProxy('info');
    self.warn = _logProxy('warn');
    self.error = _logProxy('error');
  }

  public setLogger!: DiagLoggerApi['setLogger'];
  /**
   *
   */
  public createComponentLogger!: (
    options: ComponentLoggerOptions
  ) => DiagLogger;

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
