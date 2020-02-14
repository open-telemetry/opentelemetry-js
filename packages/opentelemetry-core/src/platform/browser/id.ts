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

const byteToHex: string[] = [];
for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, '0');
  byteToHex.push(hexOctet);
}

/**
 * Encodes an Uint8Array into a hex string.
 * @param buf the array buffer to encode
 */
export function idToHex(buf: Uint8Array): string {
  const hex = new Array(buf.length);
  for (let i = 0; i < buf.length; ++i) {
    hex.push(byteToHex[buf[i]]);
  }
  return hex.join('');
}

/**
 * Converts hex encoded string into an Uint8Array
 * @param s the string to convert
 */
export function hexToId(s: string): Uint8Array {
  const cnt = s.length / 2;
  const buf = new Uint8Array(cnt);
  for (let i = 0; i < cnt; i++) {
    buf[i] = parseInt(s.substring(2 * i, 2 * i + 2), 16);
  }
  return buf;
}

/*
 * Compare if two id are equal.
 * @param id1 first id to compare
 * @param id2 second id to compare
 */
export function idsEquals(id1: Uint8Array, id2: Uint8Array): boolean {
  if (id1.byteLength !== id2.byteLength) {
    return false;
  }
  for (let i = 0; i < id1.byteLength; i++) {
    if (id1[i] !== id2[i]) {
      return false;
    }
  }
  return true;
}

/** Returns a random 16-byte trace ID. */
export function randomTraceId(): Uint8Array {
  const traceId = new Uint8Array(TRACE_ID_BYTES);
  cryptoLib.getRandomValues(traceId);
  return traceId;
}

/** Returns a random 8-byte span ID. */
export function randomSpanId(): Uint8Array {
  let spanId = new Uint8Array(SPAN_ID_BYTES);
  cryptoLib.getRandomValues(spanId);
  return spanId;
}
