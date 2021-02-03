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
  Logger,
  Exception,
  DiagLogLevel,
  DiagConsoleLogger,
  createLogLevelDiagLogger,
} from '@opentelemetry/api';
import { ErrorHandler } from './types';

/**
 * Returns a function that logs an error using the provided logger, or a
 * console logger if one was not provided.
 * @param {Logger} logger
 */
export function loggingErrorHandler(logger?: Logger): ErrorHandler {
  logger =
    logger ??
    createLogLevelDiagLogger(DiagLogLevel.ERROR, new DiagConsoleLogger());
  return (ex: Exception) => {
    logger!.error(stringifyException(ex));
  };
}

/**
 * Converts an exception into a string representation
 * @param {Exception} ex
 */
function stringifyException(ex: Exception | string): string {
  if (typeof ex === 'string') {
    return ex;
  } else {
    return JSON.stringify(flattenException(ex));
  }
}

/**
 * Flattens an exception into key-value pairs by traversing the prototype chain
 * and coercing values to strings. Duplicate properties will not be overwritten;
 * the first insert wins.
 */
function flattenException(ex: Exception): Record<string, string> {
  const result = {} as Record<string, string>;
  let current = ex;

  while (current !== null) {
    Object.getOwnPropertyNames(current).forEach(propertyName => {
      if (result[propertyName]) return;
      const value = current[propertyName as keyof typeof current];
      if (value) {
        result[propertyName] = String(value);
      }
    });
    current = Object.getPrototypeOf(current);
  }

  return result;
}
