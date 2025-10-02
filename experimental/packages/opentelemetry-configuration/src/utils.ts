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
import { getStringFromEnv } from '@opentelemetry/core';
import { inspect } from 'util';
import { ConfigPropagator } from './configModel';

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
  const raw = envVariableSubstitution(value)?.trim().toLowerCase();
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
 * Retrieves a list of booleans from a configuration file parameter.
 * - Uses ',' as the delimiter.
 * - Trims leading and trailing whitespace from each entry.
 * - Excludes empty entries.
 * - Returns `undefined` if the variable is empty or contains only whitespace.
 * - Returns an empty array if all entries are empty or whitespace.
 *
 * @param {unknown} value - The value from the config file.
 * @returns {boolean[] | undefined} - The list of strings or `undefined`.
 */
export function getBooleanListFromConfigFile(
  value: unknown
): boolean[] | undefined {
  const list = getStringFromConfigFile(value)?.split(',');
  if (list) {
    const filteredList = [];
    for (let i = 0; i < list.length; i++) {
      const element = getBooleanFromConfigFile(list[i]);
      if (element != null) {
        filteredList.push(element);
      }
    }
    return filteredList;
  }
  return list;
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
  const raw = envVariableSubstitution(value)?.trim();
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
 * Retrieves a list of numbers from a configuration file parameter.
 * - Uses ',' as the delimiter.
 * - Trims leading and trailing whitespace from each entry.
 * - Excludes empty entries.
 * - Returns `undefined` if the variable is empty or contains only whitespace.
 * - Returns an empty array if all entries are empty or whitespace.
 *
 * @param {unknown} value - The value from the config file.
 * @returns {number[] | undefined} - The list of numbers or `undefined`.
 */
export function getNumberListFromConfigFile(
  value: unknown
): number[] | undefined {
  const list = getStringFromConfigFile(value)?.split(',');
  if (list) {
    const filteredList = [];
    for (let i = 0; i < list.length; i++) {
      const element = getNumberFromConfigFile(list[i]);
      if (element) {
        filteredList.push(element);
      }
    }
    return filteredList;
  }
  return list;
}

/**
 * Retrieves a string from a configuration file parameter.
 * - Returns `undefined` if the variable is empty, unset, or contains only whitespace.
 *
 * @param {unknown} value - The value from the config file.
 * @returns {string | undefined} - The string value or `undefined`.
 */
export function getStringFromConfigFile(value: unknown): string | undefined {
  const raw = envVariableSubstitution(value)?.trim();
  if (value == null || raw === '') {
    return undefined;
  }
  return raw;
}

/**
 * Retrieves a list of strings from a configuration file parameter.
 * - Uses ',' as the delimiter.
 * - Trims leading and trailing whitespace from each entry.
 * - Excludes empty entries.
 * - Returns `undefined` if the variable is empty or contains only whitespace.
 * - Returns an empty array if all entries are empty or whitespace.
 *
 * @param {unknown} value - The value from the config file.
 * @returns {string[] | undefined} - The list of strings or `undefined`.
 */
export function getStringListFromConfigFile(
  value: unknown
): string[] | undefined {
  value = envVariableSubstitution(value);
  return getStringFromConfigFile(value)
    ?.split(',')
    .map(v => v.trim())
    .filter(s => s !== '');
}

/**
 * Retrieves a list of strings from a configuration file parameter
 * that is a list of objects.
 * e.g. Parsing the value of `composite` such as
 * composite:
 *  - tracecontext:
 *  - baggage:
 *  - b3:
 * returns ['tracecontext', 'baggage', 'b3']
 * @param value - The value from the config file.
 * @returns {string[] | undefined} - The list of strings or `undefined`.
 */
export function getListFromObjectsFromConfigFile(
  value: object[] | undefined
): string[] | undefined {
  if (value) {
    const list: string[] = [];
    for (let i = 0; i < value.length; i++) {
      list.push(...Object.keys(value[i]));
    }
    if (list.length > 0) {
      return list;
    }
  }
  return undefined;
}

export function envVariableSubstitution(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  const matches = String(value).match(/\$\{[a-zA-Z0-9,=_:.-]*\}/g);
  if (matches) {
    let stringValue = String(value);
    for (const match of matches) {
      const v = match.substring(2, match.length - 1).split(':-');
      const defaultValue = v.length === 2 ? v[1] : '';
      const replacement = getStringFromEnv(v[0]) || defaultValue;
      stringValue = stringValue.replace(match, replacement);
    }
    return stringValue;
  }
  return String(value);
}

export function isPropagator(
  propagator: unknown
): propagator is Partial<ConfigPropagator> {
  if (propagator == null) {
    return false;
  }
  if (typeof propagator === 'object') {
    if ('composite' in propagator) {
      if (Array.isArray(propagator.composite)) {
        for (let i = 0; i < propagator.composite.length; i++) {
          const element = propagator.composite[i];
          if (typeof element !== 'object') {
            return false;
          }
        }
      } else {
        return false;
      }
    }
    if ('composite_list' in propagator) {
      if (typeof propagator.composite_list !== 'string') {
        return false;
      }
    }
    return true;
  }
  return false;
}
