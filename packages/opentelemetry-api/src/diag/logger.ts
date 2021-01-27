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

import { Logger } from '../common/Logger';

/** Defines a type which can be used for as a parameter without breaking backward
 * compatibility. The {@link Logger} reference will be removed with the removal
 * of the Logger definition, this can be used as a replacement for functions
 * that are currently passing Logger references during migration to minimize
 * breaks that will occur with the removal of the Logger interface.
 */
export type OptionalDiagLogger = Logger | DiagLogger | null | undefined;

export type DiagLogFunction = (message: string, ...args: unknown[]) => void;

/** Defines an internal diagnostic logger interface which is used to log internal diagnostic
 * messages, you can set the default diagnostic logger via the {@link DiagAPI} setLogger function.
 * API provided implementations include :-
 * - a No-Op {@link noopDiagLogger}
 * - a {@link DiagLogLevel} filtering wrapper {@link diagLogLevelFilter}
 * - a general Console {@link DiagConsoleLogger} version.
 */
export interface DiagLogger {
  /** Log a terminal situation that would cause the API to completely fail to initialize,
   * if this type of message is logged functionality of the API is not expected to be functional.
   */
  terminal: DiagLogFunction;

  /** Log a critical error that NEEDS to be addressed, functionality of the component that emits
   * this log detail may non-functional. While the overall API may be.
   */
  critical: DiagLogFunction;

  /** Log an error scenario that was not expected and caused the requested operation to fail. */
  error: DiagLogFunction;

  /** Log a warning scenario to inform the developer of an issues that should be investigated.
   * The requested operation may or may not have succeeded or completed.
   */
  warn: DiagLogFunction;

  /** Log a general informational message, this should not affect functionality.
   * This is also the default logging level so this should NOT be used for logging
   * debugging level information.
   */
  info: DiagLogFunction;

  /** Log a general debug message that can be useful for identifying a failure.
   * Information logged at this level may include diagnostic details that would
   * help identify a failure scenario. Useful scenarios would be to log the execution
   * order of async operations
   */
  debug: DiagLogFunction;

  /** Log a detailed (verbose) trace level logging that can be used to identify failures
   * where debug level logging would be insufficient, this level of tracing can include
   * input and output parameters and as such may include PII information passing through
   * the API. As such it is recommended that this level of tracing should not be enabled
   * in a production environment.
   */
  trace: DiagLogFunction;

  /** Log a general informational message that should always be logged regardless of the
   * current {@Link DiagLogLevel) and configured filtering level. This type of logging is
   * useful for logging component startup and version information without causing additional
   * general informational messages when the logging level is set to DiagLogLevel.WARN or lower.
   */
  forcedInfo: DiagLogFunction;
}

const loggerMapFuncs: { d: keyof DiagLogger; l: keyof Logger }[] = [
  { d: 'trace', l: 'debug' },
  { d: 'debug', l: 'debug' },
  { d: 'info', l: 'info' },
  { d: 'warn', l: 'warn' },
  { d: 'error', l: 'error' },
  { d: 'critical', l: 'error' },
  { d: 'terminal', l: 'error' },
  { d: 'forcedInfo', l: 'info' },
];

function noopLogFunction() {}

/**
 * Returns a No-Op Diagnostic logger where all messages do nothing.
 * @implements {@link DiagLogger}
 * @returns {DiagLogger}
 */
export function noopDiagLogger(): DiagLogger {
  const diagLogger = {} as DiagLogger;

  for (let lp = 0; lp < loggerMapFuncs.length; lp++) {
    const map = loggerMapFuncs[lp];
    diagLogger[map.d] = noopLogFunction;
  }

  return diagLogger;
}

/**
 * @deprecated This helper will return either the original passed logger if it implements {@link DiagLogger} a
 * wrapped instance if it only implements {@link Logger} or null if it's null, undefined.
 * This helper will be removed as part of the {@link Logger} deprecation, please use {@link DiagLogger} from the api.
 * @see {@link DiagLogLevel} and {@link DiagLogger}
 * @returns The passed Logger wrapped as a DiagLogger or null if no Logger was supplied.
 */
export function diagLoggerAdapter(
  logger?: OptionalDiagLogger
): DiagLogger | null | undefined {
  if (!logger) {
    return null;
  }

  if (typeof (logger as DiagLogger).forcedInfo === 'function') {
    // already looks like a DiagLogger;
    return logger as DiagLogger;
  }

  function _mapToLogger(
    theLogger: Logger,
    funcName: keyof Logger
  ): DiagLogFunction {
    const theFunc = theLogger[funcName];
    if (theFunc && typeof theFunc === 'function') {
      return function () {
        const orgArguments = arguments as unknown;
        return theFunc.apply(
          theLogger,
          orgArguments as Parameters<DiagLogFunction>
        );
      };
    }

    return noopLogFunction;
  }

  const diagLogger = {} as DiagLogger;

  for (let lp = 0; lp < loggerMapFuncs.length; lp++) {
    const map = loggerMapFuncs[lp];
    diagLogger[map.d] = _mapToLogger(logger, map.l);
  }

  return diagLogger;
}
