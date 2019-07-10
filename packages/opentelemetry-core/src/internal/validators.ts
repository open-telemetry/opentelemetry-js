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

const VALUE_MAX_SIZE = 256;
const VALID_KEY_REGEX = /^[a-z][_0-9a-z-*/]{0,255}$/;

/**
 * Key is opaque string up to 256 characters printable. It MUST begin with a
 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
 * underscores _, dashes -, asterisks *, and forward slashes /.
 */
export function validateKey(key: string): boolean {
  return VALID_KEY_REGEX.test(key);
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
