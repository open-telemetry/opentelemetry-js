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

import { hexToBinary } from '../src/common/hex-to-binary';

/**
 * utility function to convert a string representing a hex value to a base64 string
 * that represents the bytes of that hex value.
 * @param hexStr
 */
export function toBase64(hexStr: string) {
  const decoder = new TextDecoder('utf8');
  return btoa(decoder.decode(hexToBinary(hexStr)));
}

/**
 * Cross-platform utility function to convert a Uint8Array to a base64 string.
 * This works in both Node.js and browsers so that we can avoid using Buffer in tests.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
