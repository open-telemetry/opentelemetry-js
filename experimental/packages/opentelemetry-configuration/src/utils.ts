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
 * Retrieves a boolean value from a configuration file parameter.
 * - Trims leading and trailing whitespace and ignores casing.
 * - Returns `undefined` if the value is empty, unset, or contains only whitespace.
 * - Returns `undefined` and a warning for values that cannot be mapped to a boolean.
 *
 * @param {unknown} value - The value from the config file.
 * @returns {boolean} - The boolean value or `false` if the environment variable is unset empty, unset, or contains only whitespace.
 */
export function getBooleanFromConfigFile(value: unknown): boolean | undefined {
  const raw = String(value)?.trim().toLowerCase();
  if (raw === 'true') {
    return true;
  } else if (raw === 'false') {
    return false;
  } else if (raw == null || raw === '') {
    return undefined;
  } else {
    diag.warn(`Unknown value ${inspect(raw)}, expected 'true' or 'false'`);
    return undefined;
  }
}

/**
 * Retrieves a number from a configuration file parameter.
 * - Returns `undefined` if the environment variable is empty, unset, or contains only whitespace.
 * - Returns `undefined` and a warning if is not a number.
 * - Returns a number in all other cases.
 *
 * @param {unknown} value - The value from the config file.
 * @returns {number | undefined} - The number value or `undefined`.
 */
export function getNumberFromConfigFile(value: unknown): number | undefined {
  const raw = String(value)?.trim();
  if (raw == null || raw.trim() === '') {
    return undefined;
  }

  const n = Number(raw);
  if (isNaN(n)) {
    diag.warn(`Unknown value ${inspect(raw)}, expected a number`);
    return undefined;
  }

  return n;
}

/**
 * Retrieves a string from a configuration file parameter.
 * - Returns `undefined` if the environment variable is empty, unset, or contains only whitespace.
 *
 * @param {unknown} value - The value from the config file.
 * @returns {string | undefined} - The string value or `undefined`.
 */
export function getStringFromConfigFile(value: unknown): string | undefined {
  const raw = String(value)?.trim();
  if (value == null || raw === '') {
    return undefined;
  }
  return raw;
}
