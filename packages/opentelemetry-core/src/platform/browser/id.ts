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
const spanBytesArray = new Uint8Array(SPAN_ID_BYTES);

/** Returns a random 16-byte trace ID formatted as a 32-char hex string. */
export function randomTraceId(): string {
  return randomSpanId() + randomSpanId();
}

/** Returns a random 8-byte span ID formatted as a 16-char hex string. */
export function randomSpanId(): string {
  let spanId = '';
  cryptoLib.getRandomValues(spanBytesArray);
  for (let i = 0; i < SPAN_ID_BYTES; i++) {
    const hexStr = spanBytesArray[i].toString(16);

    // Zero pad bytes whose hex values are single digit.
    if (hexStr.length === 1) spanId += '0';

    spanId += hexStr;
  }
  return spanId;
}
