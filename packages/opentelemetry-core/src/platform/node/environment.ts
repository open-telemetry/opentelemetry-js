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

import { diag } from '@opentelemetry/api';
import { inspect } from 'util';

/**
 * Retrieves a number from an environment variable.
 * - Returns `undefined` if the environment variable is empty, unset, contains only whitespace, or is not a number.
 * - Returns a number in all other cases.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {number | undefined} - The number value or `undefined`.
 */
export function getNumberFromEnv(key: string): number | undefined {
  const raw = process.env[key];
  if (raw == null || raw.trim() === '') {
    return undefined;
  }

  const value = Number(raw);
  if (isNaN(value)) {
    diag.warn(
      `Unknown value ${inspect(raw)} for ${key}, expected a number, using defaults`
    );
    return undefined;
  }

  return value;
}

/**
 * Retrieves a string from an environment variable.
 * - Returns `undefined` if the environment variable is empty, unset, or contains only whitespace.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {string | undefined} - The string value or `undefined`.
 */
export function getStringFromEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null || raw.trim() === '') {
    return undefined;
  }
  return raw;
}

/**
 * Retrieves a boolean value from an environment variable.
 * - Trims leading and trailing whitespace and ignores casing.
 * - Returns `false` if the environment variable is empty, unset, or contains only whitespace.
 * - Returns `false` for strings that cannot be mapped to a boolean.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {boolean} - The boolean value or `false` if the environment variable is unset empty, unset, or contains only whitespace.
 */
export function getBooleanFromEnv(key: string): boolean {
  const raw = process.env[key]?.trim().toLowerCase();
  if (raw == null || raw === '') {
    // NOTE: falling back to `false` instead of `undefined` as required by the specification.
    // If you have a use-case that requires `undefined`, consider using `getStringFromEnv()` and applying the necessary
    // normalizations in the consuming code.
    return false;
  }
  if (raw === 'true') {
    return true;
  } else if (raw === 'false') {
    return false;
  } else {
    diag.warn(
      `Unknown value ${inspect(raw)} for ${key}, expected 'true' or 'false', falling back to 'false' (default)`
    );
    return false;
  }
}

/**
 * Retrieves a list of strings from an environment variable.
 * - Uses ',' as the delimiter.
 * - Trims leading and trailing whitespace from each entry.
 * - Excludes empty entries.
 * - Returns `undefined` if the environment variable is empty or contains only whitespace.
 * - Returns an empty array if all entries are empty or whitespace.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {string[] | undefined} - The list of strings or `undefined`.
 */
export function getStringListFromEnv(key: string): string[] | undefined {
  return getStringFromEnv(key)
    ?.split(',')
    .map(v => v.trim())
    .filter(s => s !== '');
}
