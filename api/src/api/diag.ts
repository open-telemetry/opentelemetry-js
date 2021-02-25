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
import { createNoopDiagLogger } from '../diag/internal/noopLogger';
import { DiagLogFunction, DiagLogger, DiagLogLevel } from '../diag/types';
import {
  API_BACKWARDS_COMPATIBILITY_VERSION,
  GLOBAL_DIAG_LOGGER_API_KEY,
  makeGetter,
  _global,
} from './global-utils';

function nop() {}

/** Internal simple Noop Diag API that returns a noop logger and does not allow any changes */
function noopDiagApi(): DiagAPI {
  return Object.assign(
    { disable: nop, setLogger: nop },
    createNoopDiagLogger()
  );
}

/**
 * Singleton object which represents the entry point to the OpenTelemetry internal
 * diagnostic API
 */
export class DiagAPI implements DiagLogger {
  /** Get the singleton instance of the DiagAPI API */
  public static instance(): DiagAPI {
    let theInst = null;
    if (_global[GLOBAL_DIAG_LOGGER_API_KEY]) {
      // Looks like a previous instance was set, so try and fetch it
      theInst = _global[GLOBAL_DIAG_LOGGER_API_KEY]?.(
        API_BACKWARDS_COMPATIBILITY_VERSION
      ) as DiagAPI;
    }

    if (!theInst) {
      theInst = new DiagAPI();
      _global[GLOBAL_DIAG_LOGGER_API_KEY] = makeGetter(
        API_BACKWARDS_COMPATIBILITY_VERSION,
        theInst,
        noopDiagApi()
      );
    }

    return theInst;
  }

  /**
   * Private internal constructor
   * @private
   */
  private constructor() {
    let _filteredLogger: DiagLogger | undefined;

    function _logProxy(funcName: keyof DiagLogger): DiagLogFunction {
      return function () {
        // shortcut if logger not set
        if (!_filteredLogger) return;
        return _filteredLogger[funcName].apply(
          _filteredLogger,
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
        if (_filteredLogger) {
          const err = new Error(
            'Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation'
          );
          _filteredLogger.error(err.stack ?? err.message);
          logger = _filteredLogger;
        } else {
          // There isn't much we can do here.
          // Logging to the console might break the user application.
          return;
        }
      }

      _filteredLogger = createLogLevelDiagLogger(logLevel, logger);
    };

    self.disable = () => {
      _filteredLogger = undefined;
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
   * @returns The previously registered DiagLogger
   */
  public setLogger!: (logger: DiagLogger, logLevel?: DiagLogLevel) => void;

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
