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

import {
  DiagLogger,
  DiagLogFunction,
  createNoopDiagLogger,
  diagLoggerFunctions,
} from '../diag/logger';
import { DiagLogLevel, createLogLevelDiagLogger } from '../diag/logLevel';
import {
  API_BACKWARDS_COMPATIBILITY_VERSION,
  GLOBAL_DIAG_LOGGER_API_KEY,
  makeGetter,
  _global,
} from './global-utils';

/** Internal simple Noop Diag API that returns a noop logger and does not allow any changes */
function noopDiagApi(): DiagAPI {
  const noopApi = createNoopDiagLogger() as DiagAPI;

  noopApi.getLogger = () => noopApi;
  noopApi.setLogger = noopApi.getLogger;
  noopApi.setLogLevel = () => {};

  return noopApi;
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
    let _logLevel: DiagLogLevel = DiagLogLevel.INFO;
    let _filteredLogger: DiagLogger | null;
    let _logger: DiagLogger = createNoopDiagLogger();

    function _logProxy(funcName: keyof DiagLogger): DiagLogFunction {
      return function () {
        const orgArguments = arguments as unknown;
        const theLogger = _filteredLogger || _logger;
        const theFunc = theLogger[funcName];
        if (typeof theFunc === 'function') {
          return theFunc.apply(
            theLogger,
            orgArguments as Parameters<DiagLogFunction>
          );
        }
      };
    }

    // Using self local variable for minification purposes as 'this' cannot be minified
    const self = this;

    // DiagAPI specific functions

    self.getLogger = (): DiagLogger => {
      // Return itself if no existing logger is defined (defaults effectively to a Noop)
      return _logger;
    };

    self.setLogger = (logger: DiagLogger): DiagLogger => {
      const prevLogger = _logger;
      if (prevLogger !== logger && logger !== self) {
        // Simple special case to avoid any possible infinite recursion on the logging functions
        _logger = logger || createNoopDiagLogger();
        _filteredLogger = createLogLevelDiagLogger(_logLevel, _logger);
      }

      return prevLogger;
    };

    self.setLogLevel = (maxLogLevel: DiagLogLevel) => {
      if (maxLogLevel !== _logLevel) {
        _logLevel = maxLogLevel;
        if (_logger) {
          _filteredLogger = createLogLevelDiagLogger(maxLogLevel, _logger);
        }
      }
    };

    for (let i = 0; i < diagLoggerFunctions.length; i++) {
      const name = diagLoggerFunctions[i];
      self[name] = _logProxy(name);
    }
  }

  /**
   * Return the currently configured logger instance, if no logger has been configured
   * it will return itself so any log level filtering will still be applied in this case.
   */
  public getLogger!: () => DiagLogger;

  /**
   * Set the DiagLogger instance
   * @param logger - The DiagLogger instance to set as the default logger
   * @returns The previously registered DiagLogger
   */
  public setLogger!: (logger: DiagLogger) => DiagLogger;

  /** Set the default maximum diagnostic logging level */
  public setLogLevel!: (maxLogLevel: DiagLogLevel) => void;

  // DiagLogger implementation
  public verbose!: DiagLogFunction;
  public debug!: DiagLogFunction;
  public info!: DiagLogFunction;
  public warn!: DiagLogFunction;
  public startupInfo!: DiagLogFunction;
  public error!: DiagLogFunction;
  public critical!: DiagLogFunction;
  public terminal!: DiagLogFunction;
}
