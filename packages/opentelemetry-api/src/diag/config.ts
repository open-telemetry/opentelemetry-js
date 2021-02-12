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

import { createLogLevelDiagLogger, DiagLogLevel } from './logLevel';
import { DiagAPI } from '../api/diag';
import { DiagLogger } from './logger';

/** Defines a basic configuration to allow options DiagLogger and DiagLogLevel */
export interface DiagLoggerConfig {
  /**
   * The optional diagnostic logging level
   */
  diagLogLevel?: DiagLogLevel;

  /**
   * The optional diagnostic logger
   */
  diagLogger?: DiagLogger;
}

/**
 * Get the current logger instance using the provided configuration, the result will be either
 * - The specified diagLogger with optional log level filtering
 * - The default api.diag instance with optional log level filtering
 * The log level filtering will be either
 * - The specified diagLogLevel
 * - Or no log level filtering
 * @param config The configuration to initialize the logger from
 * @param getDefaultLogger - A fallback callback to fetch the specific logger if no logger is configured
 */
export function getDiagLoggerFromConfig(
  config?: DiagLoggerConfig | undefined | null,
  getDefaultLogger?: () => DiagLogger
): DiagLogger {
  let theLogger;
  const theConfig = config || {};

  theLogger = theConfig.diagLogger;
  if (!theLogger && getDefaultLogger) {
    theLogger = getDefaultLogger();
  }

  const theLogLevel = theConfig.diagLogLevel;
  if (theLogLevel !== undefined && theLogLevel !== null) {
    // Note: If no existing 'theLogger' is defined the helper will wrap the api.diag.getLogger()
    theLogger = createLogLevelDiagLogger(theLogLevel, theLogger);
  }

  if (!theLogger) {
    // If we still don't have a logger then default to the api.diag
    theLogger = DiagAPI.instance();
  }

  return theLogger;
}
