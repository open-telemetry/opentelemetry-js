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

import { DiagLogger, DiagLogFunction } from './logger';

const consoleMap: { n: keyof DiagLogger; c: keyof Console }[] = [
  { n: 'terminal', c: 'error' },
  { n: 'critical', c: 'error' },
  { n: 'error', c: 'error' },
  { n: 'warn', c: 'warn' },
  { n: 'info', c: 'info' },
  { n: 'debug', c: 'debug' },
  { n: 'verbose', c: 'trace' },
  { n: 'startupInfo', c: 'info' },
];

/**
 * A simple Immutable Console based diagnostic logger which will output any messages to the Console.
 * If you want to limit the amount of logging to a specific level or lower use the
 * {@link diagLogLevelFilter}
 */
export class DiagConsoleLogger implements DiagLogger {
  constructor() {
    function _consoleFunc(funcName: keyof Console): DiagLogFunction {
      return function () {
        const orgArguments = arguments;
        if (console) {
          // Some environments only expose the console when the F12 developer console is open
          let theFunc = console[funcName];
          if (typeof theFunc !== 'function') {
            // Not all environments support all functions
            theFunc = console.log;
          }

          // One last final check
          if (typeof theFunc === 'function') {
            return theFunc.apply(console, orgArguments);
          }
        }
      };
    }

    for (let i = 0; i < consoleMap.length; i++) {
      this[consoleMap[i].n] = _consoleFunc(consoleMap[i].c);
    }
  }

  /**
   * Log a terminal situation that would cause the API to completely fail to initialize,
   * if this type of message is logged functionality of the API is not expected to be functional.
   */
  public terminal!: DiagLogFunction;

  /**
   * Log a critical error that NEEDS to be addressed, functionality of the component that emits
   * this log detail may non-functional. While the overall API may be.
   */
  public critical!: DiagLogFunction;

  /** Log an error scenario that was not expected and caused the requested operation to fail. */
  public error!: DiagLogFunction;

  /**
   * Logs a general informational message that is used for logging component startup and version
   * information without causing additional general informational messages when the logging level
   * is set to DiagLogLevel.WARN or lower.
   */
  public startupInfo!: DiagLogFunction;

  /**
   * Log a warning scenario to inform the developer of an issues that should be investigated.
   * The requested operation may or may not have succeeded or completed.
   */
  public warn!: DiagLogFunction;

  /**
   * Log a general informational message, this should not affect functionality.
   * This is also the default logging level so this should NOT be used for logging
   * debugging level information.
   */
  public info!: DiagLogFunction;

  /**
   * Log a general debug message that can be useful for identifying a failure.
   * Information logged at this level may include diagnostic details that would
   * help identify a failure scenario. Useful scenarios would be to log the execution
   * order of async operations
   */
  public debug!: DiagLogFunction;

  /**
   * Log a detailed (verbose) trace level logging that can be used to identify failures
   * where debug level logging would be insufficient, this level of tracing can include
   * input and output parameters and as such may include PII information passing through
   * the API. As such it is recommended that this level of tracing should not be enabled
   * in a production environment.
   */
  public verbose!: DiagLogFunction;
}
