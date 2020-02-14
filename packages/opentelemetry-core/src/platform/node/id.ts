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

import * as crypto from 'crypto';

const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;

/**
 * Encodes an Uint8Array into a hex string.
 * @param buf the array buffer to encode
 */
export function idToHex(buf: Uint8Array): string {
  return Buffer.from(buf).toString('hex');
}

/**
 * Converts hex encoded string into an Uint8Array
 * @param s the string to convert
 */
export function hexToId(s: string): Uint8Array {
  const buf = Buffer.from(s, 'hex');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

/**
 * Compare if two id are equal.
 * @param id1 first id to compare
 * @param id2 second id to compare
 */
export function idsEquals(id1: Uint8Array, id2: Uint8Array): boolean {
  return Buffer.compare(id1, id2) === 0;
}

/**
 * Returns a random 16-byte trace ID.
 */
export function randomTraceId(): Uint8Array {
  const traceId = crypto.randomBytes(TRACE_ID_BYTES);
  return new Uint8Array(traceId.buffer, traceId.byteOffset, traceId.byteLength);
}

/**
 * Returns a random 8-byte span ID.
 */
export function randomSpanId(): Uint8Array {
  const spanId = crypto.randomBytes(SPAN_ID_BYTES);
  return new Uint8Array(spanId.buffer, spanId.byteOffset, spanId.byteLength);
}
