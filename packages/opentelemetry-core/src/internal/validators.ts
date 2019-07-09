/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const KEY_MAX_SIZE = 256;
const VALUE_MAX_SIZE = 256;

/**
 * Key is opaque string up to 256 characters printable. It MUST begin with a
 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
 * underscores _, dashes -, asterisks *, and forward slashes /.
 */
export function validateKey(key: string): boolean {
  if (key.length > KEY_MAX_SIZE || key.charAt(0) < 'a' || key.charAt(0) > 'z') {
    return false;
  }
  for (let i = 1; i < key.length; i++) {
    const c = key.charAt(i);
    if (
      !(c >= 'a' && c <= 'z') &&
      !(c >= '0' && c <= '9') &&
      c !== '_' &&
      c !== '-' &&
      c !== '*' &&
      c !== '/'
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Value is opaque string up to 256 characters printable ASCII RFC0020
 * characters (i.e., the range 0x20 to 0x7E) except comma , and =.
 */
export function validateValue(value: string): boolean {
  if (value.length > VALUE_MAX_SIZE || value.charAt(value.length - 1) === ' ') {
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    const c = value.charAt(i);
    if (c === ',' || c === '=' || c < ' ' || c > '~') {
      return false;
    }
  }
  return true;
}
