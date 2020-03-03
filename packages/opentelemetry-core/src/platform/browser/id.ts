/*!
 * Copyright 2019, OpenTelemetry Authors
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

// IE 11 exposes `crypto` as `msCrypto`.
declare type WindowWithMsCrypto = Window & {
  msCrypto?: Crypto;
};
const cryptoLib = window.crypto || (window as WindowWithMsCrypto).msCrypto;

const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;
const randomBytesArray = new Uint8Array(TRACE_ID_BYTES);

/** Returns a random 16-byte trace ID formatted as a 32-char hex string. */
export function randomTraceId(): string {
  cryptoLib.getRandomValues(randomBytesArray);
  return toHex(randomBytesArray.slice(0, TRACE_ID_BYTES));
}

/** Returns a random 8-byte span ID formatted as a 16-char hex string. */
export function randomSpanId(): string {
  cryptoLib.getRandomValues(randomBytesArray);
  return toHex(randomBytesArray.slice(0, SPAN_ID_BYTES));
}

/**
 * Get the hex string representation of a byte array
 *
 * @param byteArray
 */
function toHex(byteArray: Uint8Array) {
  const chars: number[] = new Array(byteArray.length * 2);
  const alpha = 'a'.charCodeAt(0) - 10;
  const digit = '0'.charCodeAt(0);

  let p = 0;
  for (let i = 0; i < byteArray.length; i++) {
    let nibble = (byteArray[i] >>> 4) & 0xf;
    chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
    nibble = byteArray[i] & 0xf;
    chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
  }

  return String.fromCharCode.apply(null, chars);
}
