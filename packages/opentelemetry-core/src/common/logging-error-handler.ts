/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag, Exception } from '@opentelemetry/api';
import { ErrorHandler } from './types';

/**
 * Returns a function that logs an error using the provided logger, or a
 * console logger if one was not provided.
 */
export function loggingErrorHandler(): ErrorHandler {
  return (ex: Exception) => {
    diag.error(stringifyException(ex));
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
