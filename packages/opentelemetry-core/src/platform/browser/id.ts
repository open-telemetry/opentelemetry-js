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

/** Returns a random 16-byte trace ID formatted as a 32-char hex string. */
export function randomTraceId(): string {
  return randomId(TRACE_ID_BYTES);
}

/** Returns a random 8-byte span ID formatted as a 16-char hex string. */
export function randomSpanId(): string {
  return randomId(SPAN_ID_BYTES);
}

const randomBytesArray = new Uint8Array(TRACE_ID_BYTES);
function randomId(byteLength: number): string {
  let id = '';
  cryptoLib.getRandomValues(randomBytesArray);
  for (let i = 0; i < byteLength; i++) {
    const hexStr = randomBytesArray[i].toString(16);

    // Zero pad bytes whose hex values are single digit.
    if (hexStr.length === 1) id += '0';

    id += hexStr;
  }
  return id;
}
