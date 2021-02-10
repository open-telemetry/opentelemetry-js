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

import { DiagAPI } from '../api/diag';
import { Logger } from '../common/Logger';
import { DiagLogger, DiagLogFunction, createNoopDiagLogger } from './logger';

/**
 * Defines the available internal logging levels for the diagnostic logger, the numeric values
 * of the levels are defined to match the original values from the initial LogLevel to avoid
 * compatibility/migration issues for any implementation that assume the numeric ordering.
 */
export enum DiagLogLevel {
  /** Diagnostic Logging level setting to disable all logging (except and forced logs) */
  NONE = 0,

  /**
   * Identifies a terminal situation that would cause the API to completely fail to initialize,
   * if this type of error is logged functionality of the API is not expected to be functional.
   */
  TERMINAL = 10,

  /**
   * Identifies a critical error that needs to be addressed, functionality of the component
   * that emits this log detail may non-functional.
   */
  CRITICAL = 20,

  /** Identifies an error scenario */
  ERROR = 30,

  /** Identifies startup and failure (lower) scenarios */
  STARTUP = 40,

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

/**
 * This is equivalent to:
 * type LogLevelString = 'NONE' | TERMINAL' | 'CRITICAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'VERBOSE' | 'ALL';
 */
export type DiagLogLevelString = keyof typeof DiagLogLevel;

/**
 * Mapping from DiagLogger function name to Legacy Logger function used if
 * the logger instance doesn't have the DiagLogger function
 */
const fallbackLoggerFuncMap: { [n: string]: keyof Logger } = {
  terminal: 'error',
  critical: 'error',
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
  verbose: 'debug',
  startupInfo: 'info',
};

/** Mapping from DiagLogger function name to logging level. */
const levelMap: { n: keyof DiagLogger; l: DiagLogLevel }[] = [
  { n: 'terminal', l: DiagLogLevel.TERMINAL },
  { n: 'critical', l: DiagLogLevel.CRITICAL },
  { n: 'error', l: DiagLogLevel.ERROR },
  { n: 'warn', l: DiagLogLevel.WARN },
  { n: 'info', l: DiagLogLevel.INFO },
  { n: 'debug', l: DiagLogLevel.DEBUG },
  { n: 'verbose', l: DiagLogLevel.VERBOSE },
  { n: 'startupInfo', l: DiagLogLevel.ERROR },
];

/**
 * Create a Diagnostic logger which limits the messages that are logged via the wrapped logger based on whether the
 * message has a {@link DiagLogLevel} equal to the maximum logging level or lower, unless the {@link DiagLogLevel} is
 * NONE which will return a noop logger instance. This can be useful to reduce the amount of logging used for the
 * system or for a specific component based on any local configuration.
 * If you don't supply a logger it will use the global api.diag as the destination which will use the
 * current logger and any filtering it may have applied.
 * To avoid / bypass any global level filtering you should pass the current logger returned via
 * api.diag.getLogger() however, any changes to the logger used by api.diag won't be reflected for this case.
 * @param maxLevel - The max level to log any logging of a lower
 * @param logger - The specific logger to limit, if not defined or supplied will default to api.diag
 * @implements {@link DiagLogger}
 * @returns {DiagLogger}
 */

export function createLogLevelDiagLogger(
  maxLevel: DiagLogLevel,
  logger?: DiagLogger | null
): DiagLogger {
  if (maxLevel < DiagLogLevel.NONE) {
    maxLevel = DiagLogLevel.NONE;
  } else if (maxLevel > DiagLogLevel.ALL) {
    maxLevel = DiagLogLevel.ALL;
  }

  if (maxLevel === DiagLogLevel.NONE) {
    return createNoopDiagLogger();
  }

  if (!logger) {
    logger = DiagAPI.instance();
  }

  function _filterFunc(
    theLogger: DiagLogger,
    funcName: keyof DiagLogger,
    theLevel: DiagLogLevel
  ): DiagLogFunction {
    if (maxLevel >= theLevel) {
      return function () {
        const orgArguments = arguments as unknown;
        const theFunc =
          theLogger[funcName] || theLogger[fallbackLoggerFuncMap[funcName]];
        if (theFunc && typeof theFunc === 'function') {
          return theFunc.apply(
            logger,
            orgArguments as Parameters<DiagLogFunction>
          );
        }
      };
    }
    return function () {};
  }

  const newLogger = {} as DiagLogger;
  for (let i = 0; i < levelMap.length; i++) {
    const name = levelMap[i].n;
    newLogger[name] = _filterFunc(logger, name, levelMap[i].l);
  }

  return newLogger;
}
