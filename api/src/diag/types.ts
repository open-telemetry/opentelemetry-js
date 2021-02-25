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

export type DiagLogFunction = (message: string, ...args: unknown[]) => void;

/**
 * Defines an internal diagnostic logger interface which is used to log internal diagnostic
 * messages, you can set the default diagnostic logger via the {@link DiagAPI} setLogger function.
 * API provided implementations include :-
 * - a No-Op {@link createNoopDiagLogger}
 * - a {@link DiagLogLevel} filtering wrapper {@link createLogLevelDiagLogger}
 * - a general Console {@link DiagConsoleLogger} version.
 */
export interface DiagLogger {
  /** Log an error scenario that was not expected and caused the requested operation to fail. */
  error: DiagLogFunction;

  /**
   * Log a warning scenario to inform the developer of an issues that should be investigated.
   * The requested operation may or may not have succeeded or completed.
   */
  warn: DiagLogFunction;

  /**
   * Log a general informational message, this should not affect functionality.
   * This is also the default logging level so this should NOT be used for logging
   * debugging level information.
   */
  info: DiagLogFunction;

  /**
   * Log a general debug message that can be useful for identifying a failure.
   * Information logged at this level may include diagnostic details that would
   * help identify a failure scenario.
   * For example: Logging the order of execution of async operations.
   */
  debug: DiagLogFunction;

  /**
   * Log a detailed (verbose) trace level logging that can be used to identify failures
   * where debug level logging would be insufficient, this level of tracing can include
   * input and output parameters and as such may include PII information passing through
   * the API. As such it is recommended that this level of tracing should not be enabled
   * in a production environment.
   */
  verbose: DiagLogFunction;
}

/**
 * Defines the available internal logging levels for the diagnostic logger, the numeric values
 * of the levels are defined to match the original values from the initial LogLevel to avoid
 * compatibility/migration issues for any implementation that assume the numeric ordering.
 */
export enum DiagLogLevel {
  /** Diagnostic Logging level setting to disable all logging (except and forced logs) */
  NONE = 0,

  /** Identifies an error scenario */
  ERROR = 30,

  /** Identifies a warning scenario */
  WARN = 50,

  /** General informational log message */
  INFO = 60,

  /** General debug log message */
  DEBUG = 70,

  /**
   * Detailed trace level logging should only be used for development, should only be set
   * in a development environment.
   */
  VERBOSE = 80,

  /** Used to set the logging level to include all logging */
  ALL = 9999,
}
