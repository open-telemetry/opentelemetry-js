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
import { DiagLogger, DiagLogFunction } from './logger';

/**
 * Defines the available internal logging levels for the diagnostic logger, the numeric values
 * of the levels are defined to match the original values from the initial LogLevel to avoid
 * compatibility/migration issues for any implementation that assume the numeric ordering.
 */
export enum DiagLogLevel {
  /** DIagnostic Logging level setting to disable all logging (except and forced logs) */
  NONE = -99,

  /** Identifies a terminal situation that would cause the API to completely fail to initialize,
   * if this type of error is logged functionality of the API is not expected to be functional.
   */
  TERMINAL = -2,

  /** Identifies a critical error that needs to be addressed, functionality of the component
   * that emits this log detail may non-functional.
   */
  CRITICAL = -1,

  /** Identifies an error scenario */
  ERROR = 0,

  /** Identifies a warning scenario */
  WARN = 1,

  /** General informational log message */
  INFO = 2,

  /** General debug log message */
  DEBUG = 3,

  /** Detailed trace level logging should only be used for development, should only be set
   * in a development environment.
   */
  TRACE = 4,

  /** Used to set the logging level to include all logging */
  ALL = 9999,
}

/**
 * This is equivalent to:
 * type LogLevelString = 'NONE' | TERMINAL' | 'CRITICAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'ALL';
 */
export type DiagLogLevelString = keyof typeof DiagLogLevel;

/**
 * Mapping from DiagLogger function name to logging level
 */
const levelMap: { n: keyof DiagLogger; l: DiagLogLevel; f?: boolean }[] = [
  { n: 'terminal', l: DiagLogLevel.TERMINAL },
  { n: 'critical', l: DiagLogLevel.CRITICAL },
  { n: 'error', l: DiagLogLevel.ERROR },
  { n: 'warn', l: DiagLogLevel.WARN },
  { n: 'info', l: DiagLogLevel.INFO },
  { n: 'debug', l: DiagLogLevel.DEBUG },
  { n: 'trace', l: DiagLogLevel.TRACE },
  { n: 'forcedInfo', l: DiagLogLevel.INFO, f: true },
];

/**
 * An Immutable Diagnostic logger that limits the reported diagnostic log messages to those at the
 * maximum logging level or lower.
 * This can be useful to reduce the amount of logging used for a specific component based on any
 * local configuration
 */

/**
 * Create a Diagnostic filter logger which limits the logged messages to the defined provided maximum
 * logging level or lower. This can be useful to reduce the amount of logging used for the system or
 * for a specific component based on any local configuration.
 * If you don't supply a logger it will use the global api.diag as the destination which will use the
 * current logger and any filtering it may have applied.
 * To avoid / bypass any global level filtering you should pass the current logger returned via
 * api.diag.getLogger() however, any changes to the logger used by api.diag won't be reflected for this case.
 * @param maxLevel - The max level to log any logging of a lower
 * @param logger - The specific logger to limit, if not defined or supplied will default to api.diag
 * @implements {@link DiagLogger}
 * @returns {DiagLogger}
 */

export function diagLogLevelFilter(
  maxLevel: DiagLogLevel,
  logger?: DiagLogger | null
): DiagLogger {
  if (!logger) {
    logger = DiagAPI.inst() as DiagLogger;
  }

  if (maxLevel < DiagLogLevel.NONE) {
    maxLevel = DiagLogLevel.NONE;
  } else if (maxLevel > DiagLogLevel.ALL) {
    maxLevel = DiagLogLevel.ALL;
  }

  function _filterFunc(
    theLogger: DiagLogger,
    funcName: keyof DiagLogger,
    theLevel: DiagLogLevel,
    isForced?: boolean
  ): DiagLogFunction {
    if (isForced || maxLevel >= theLevel) {
      return function () {
        const orgArguments = arguments as unknown;
        const theFunc = theLogger[funcName];
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
  for (let lp = 0; lp < levelMap.length; lp++) {
    const name = levelMap[lp].n;
    newLogger[name] = _filterFunc(logger, name, levelMap[lp].l, levelMap[lp].f);
  }

  return newLogger;
}
