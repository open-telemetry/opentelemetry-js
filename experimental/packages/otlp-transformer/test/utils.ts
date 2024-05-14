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

import { hexToBinary } from '@opentelemetry/core';

/**
 * utility function to convert a string representing a hex value to a base64 string
 * that represents the bytes of that hex value. This is needed as we need to support Node.js 14
 * where btoa() does not exist, and the Browser, where Buffer does not exist.
 * @param hexStr
 */
export function toBase64(hexStr: string) {
  if (typeof btoa !== 'undefined') {
    const decoder = new TextDecoder('utf8');
    return btoa(decoder.decode(hexToBinary(hexStr)));
  }

  return Buffer.from(hexToBinary(hexStr)).toString('base64');
}
