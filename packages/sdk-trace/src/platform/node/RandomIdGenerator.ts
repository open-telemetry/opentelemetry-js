/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IdGenerator } from '../../IdGenerator';

const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;

export class RandomIdGenerator implements IdGenerator {
  /**
   * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
   * characters corresponding to 128 bits.
   */
  generateTraceId(): string {
    return generateId(TRACE_ID_VIEW);
  }

  /**
   * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
   * characters corresponding to 64 bits.
   */
  generateSpanId(): string {
    return generateId(SPAN_ID_VIEW);
  }
}

// Writing through a Uint32Array view avoids the bounds and range checks of
// Buffer#writeUInt32BE. Byte order does not matter for random bytes.
const SHARED_WORDS = new Uint32Array(TRACE_ID_BYTES / 4);
const SHARED_BUFFER = Buffer.from(SHARED_WORDS.buffer);

// `Uint8Array.prototype.toHex` is only available from Node.js 25.
type HexEncodable = Uint8Array & { toHex?: () => string };
const TRACE_ID_VIEW: HexEncodable = new Uint8Array(
  SHARED_WORDS.buffer,
  0,
  TRACE_ID_BYTES
);
const SPAN_ID_VIEW: HexEncodable = new Uint8Array(
  SHARED_WORDS.buffer,
  0,
  SPAN_ID_BYTES
);
const HAS_TO_HEX = typeof TRACE_ID_VIEW.toHex === 'function';

function generateId(view: HexEncodable): string {
  const bytes = view.length;
  let anyNonZero = 0;
  for (let i = 0; i < bytes / 4; i++) {
    anyNonZero |= SHARED_WORDS[i] = (Math.random() * 2 ** 32) >>> 0;
  }

  // If buffer is all 0, set the last byte to 1 to guarantee a valid w3c id is generated
  if (anyNonZero === 0) {
    view[bytes - 1] = 1;
  }

  return HAS_TO_HEX ? view.toHex!() : SHARED_BUFFER.toString('hex', 0, bytes);
}
