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

import { IdGenerator } from '../../IdGenerator';

const TRACE_ID_BYTES = 16;
const SPAN_ID_BYTES = 8;

const TRACE_BUFFER = new Uint8Array(TRACE_ID_BYTES);
const SPAN_BUFFER = new Uint8Array(SPAN_ID_BYTES);

// Byte-to-hex lookup is faster than toString(16) in browsers
const HEX: string[] = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0')
);

/**
 * Fills buffer with random bytes, ensuring at least one is non-zero
 * per W3C Trace Context spec.
 */
function randomFill(buf: Uint8Array): void {
  for (let i = 0; i < buf.length; i++) {
    buf[i] = (Math.random() * 256) >>> 0;
  }
  // Ensure non-zero
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] > 0) return;
  }
  buf[buf.length - 1] = 1;
}

function toHex(buf: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < buf.length; i++) {
    hex += HEX[buf[i]];
  }
  return hex;
}

export class RandomIdGenerator implements IdGenerator {
  /**
   * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
   * characters corresponding to 128 bits.
   */
  generateTraceId(): string {
    randomFill(TRACE_BUFFER);
    return toHex(TRACE_BUFFER);
  }

  /**
   * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
   * characters corresponding to 64 bits.
   */
  generateSpanId(): string {
    randomFill(SPAN_BUFFER);
    return toHex(SPAN_BUFFER);
  }
}
