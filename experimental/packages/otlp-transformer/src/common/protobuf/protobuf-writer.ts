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
import { diag } from '@opentelemetry/api';
import type { IProtobufWriter } from './i-protobuf-writer';
import { sizeAsVarint } from './utils';

export const GROWING_BUFFER_DEBUG_MESSAGE =
  'ProtobufWriter: estimated size was too small, growing buffer.';

/**
 * bytes reserved for length in length-delimited fields
 * using 1 to assume most length-delimited fields are small
 */
const RESERVED_LENGTH_BYTES = 1;

/**
 * Primitive protobuf writer, optimized to avoid small object allocations.
 * Grows buffer dynamically if initial size is exceeded.
 */
export class ProtobufWriter implements IProtobufWriter {
  private _buffer: Uint8Array;
  // Avoid using TextEncoder type. While the global is there on all supported runtimes, types may differ.
  private readonly _textEncoder: { encode: (str: string) => Uint8Array };
  private _dataView: DataView;

  public pos: number = 0;

  constructor(estimatedSize = 65536) {
    this._buffer = new Uint8Array(estimatedSize);
    this._textEncoder = new TextEncoder();
    this._dataView = new DataView(this._buffer.buffer, this._buffer.byteOffset);
  }

  /**
   * Ensure buffer has capacity for at least size more bytes
   */
  private _ensureCapacity(size: number): void {
    const needed = this.pos + size;
    if (needed <= this._buffer.length) {
      return;
    }

    // It is safe to grow the buffer, but we assume that estimation is correct.
    // Getting to this point indicates incorrect estimation or over-reservation
    // of space in this writer and can lead to poor memory performance.
    diag.debug(GROWING_BUFFER_DEBUG_MESSAGE);

    // Double buffer size until we have enough space
    let newSize = this._buffer.length * 2;
    while (newSize < needed) {
      newSize *= 2;
    }

    const newBuffer = new Uint8Array(newSize);
    newBuffer.set(this._buffer);
    this._buffer = newBuffer;
    // Recreate DataView for the new buffer
    this._dataView = new DataView(this._buffer.buffer, this._buffer.byteOffset);
  }

  /**
   * Get the written bytes as a Uint8Array
   */
  finish(): Uint8Array {
    return this._buffer.subarray(0, this.pos);
  }

  /**
   * Insert placeholder for length. Update later with {@link finishLengthDelimited}
   * Returns the position where to write the length.
   */
  startLengthDelimited(): number {
    const lengthPos = this.pos;
    // Reserve bytes for the length varint (RESERVED_LENGTH_BYTES should be fit to the common case)
    this._ensureCapacity(RESERVED_LENGTH_BYTES);
    this.pos += RESERVED_LENGTH_BYTES;
    return lengthPos;
  }

  /**
   * Write length varint at placeholder position and shift content forward if needed.
   * Most messages are small (< 128 bytes), so we reserve 1 byte and only shift
   * when the length needs more bytes.
   */
  finishLengthDelimited(pos: number, length: number): void {
    // Calculate varint size needed for this length
    const v = length >>> 0;

    // Shift content forward if we need more bytes than reserved
    const varintSize = sizeAsVarint(v);
    if (varintSize > RESERVED_LENGTH_BYTES) {
      const additionalBytes = varintSize - RESERVED_LENGTH_BYTES;
      this._ensureCapacity(additionalBytes);
      this._buffer.copyWithin(
        pos + varintSize,
        pos + RESERVED_LENGTH_BYTES,
        this.pos
      );
      this.pos += additionalBytes;
    }

    // Write the varint at the placeholder position, inlined to avoid unnecessary checks.
    let writePos = pos;
    if (v < 0x80) {
      this._buffer[writePos] = v;
    } else if (v < 0x4000) {
      this._buffer[writePos++] = (v & 0x7f) | 0x80;
      this._buffer[writePos] = v >>> 7;
    } else if (v < 0x200000) {
      this._buffer[writePos++] = (v & 0x7f) | 0x80;
      this._buffer[writePos++] = ((v >>> 7) & 0x7f) | 0x80;
      this._buffer[writePos] = v >>> 14;
    } else if (v < 0x10000000) {
      this._buffer[writePos++] = (v & 0x7f) | 0x80;
      this._buffer[writePos++] = ((v >>> 7) & 0x7f) | 0x80;
      this._buffer[writePos++] = ((v >>> 14) & 0x7f) | 0x80;
      this._buffer[writePos] = v >>> 21;
    } else {
      this._buffer[writePos++] = (v & 0x7f) | 0x80;
      this._buffer[writePos++] = ((v >>> 7) & 0x7f) | 0x80;
      this._buffer[writePos++] = ((v >>> 14) & 0x7f) | 0x80;
      this._buffer[writePos++] = ((v >>> 21) & 0x7f) | 0x80;
      this._buffer[writePos] = v >>> 28;
    }
  }

  /**
   * Write a varint (variable-length integer)
   */
  writeVarint(value: number): void {
    this._ensureCapacity(sizeAsVarint(value));
    // Check if value fits in 32-bit range
    if (value >= 0 && value <= 0xffffffff) {
      // 32-bit or small integer
      let v = value >>> 0; // Convert to unsigned 32-bit
      while (v > 0x7f) {
        this._buffer[this.pos++] = (v & 0x7f) | 0x80;
        v >>>= 7;
      }
      this._buffer[this.pos++] = v;
    } else {
      // Needs 64-bit handling - convert to [low, high]
      let low: number;
      let high: number;

      if (value >= 0) {
        // Positive number
        low = value >>> 0;
        high = (value / 0x100000000) >>> 0;
      } else {
        // Negative number - use two's complement
        const abs = Math.abs(value);
        low = abs >>> 0;
        high = (abs / 0x100000000) >>> 0;

        // Two's complement: invert bits and add 1
        low = ~low >>> 0;
        high = ~high >>> 0;
        low = (low + 1) >>> 0;
        if (low === 0) {
          high = (high + 1) >>> 0;
        }
      }

      // Write as 64-bit varint
      while (high > 0 || low > 0x7f) {
        this._buffer[this.pos++] = (low & 0x7f) | 0x80;
        low = ((low >>> 7) | (high << 25)) >>> 0;
        high >>>= 7;
      }
      this._buffer[this.pos++] = low & 0x7f;
    }
  }

  /**
   * Write a 32-bit fixed integer (little-endian)
   */
  writeFixed32(value: number): void {
    this._ensureCapacity(4);
    const v = value >>> 0;
    this._buffer[this.pos++] = v & 0xff;
    this._buffer[this.pos++] = (v >>> 8) & 0xff;
    this._buffer[this.pos++] = (v >>> 16) & 0xff;
    this._buffer[this.pos++] = (v >>> 24) & 0xff;
  }

  /**
   * Write a 64-bit fixed integer (little-endian)
   * @param low - Low 32 bits
   * @param high - High 32 bits
   */
  writeFixed64(low: number, high: number): void {
    this._ensureCapacity(8);
    const l = low >>> 0;
    const h = high >>> 0;

    // Write low 32 bits
    this._buffer[this.pos++] = l & 0xff;
    this._buffer[this.pos++] = (l >>> 8) & 0xff;
    this._buffer[this.pos++] = (l >>> 16) & 0xff;
    this._buffer[this.pos++] = (l >>> 24) & 0xff;

    // Write high 32 bits
    this._buffer[this.pos++] = h & 0xff;
    this._buffer[this.pos++] = (h >>> 8) & 0xff;
    this._buffer[this.pos++] = (h >>> 16) & 0xff;
    this._buffer[this.pos++] = (h >>> 24) & 0xff;
  }

  /**
   * Write length-delimited data (varint length + bytes)
   */
  writeBytes(bytes: Uint8Array): void {
    this.writeVarint(bytes.length);
    this._ensureCapacity(bytes.length);
    this._buffer.set(bytes, this.pos);
    this.pos += bytes.length;
  }

  /**
   * Write a field key (field number + wire type)
   */
  writeTag(fieldNumber: number, wireType: number): void {
    this.writeVarint((fieldNumber << 3) | wireType);
  }

  /**
   * Write a double (64-bit IEEE 754)
   */
  writeDouble(value: number): void {
    this._ensureCapacity(8);
    this._dataView.setFloat64(this.pos, value, true); // true = little-endian
    this.pos += 8;
  }

  /**
   * Write a string as UTF-8 bytes (length-delimited)
   */
  writeString(str: string): void {
    // Fast path for ASCII strings (most common case)
    let isAscii = true;
    const len = str.length;
    for (let i = 0; i < len; i++) {
      if (str.charCodeAt(i) > 127) {
        isAscii = false;
        break;
      }
    }

    if (isAscii) {
      // Write length varint
      this.writeVarint(len);
      this._ensureCapacity(len);
      // Write ASCII bytes directly
      for (let i = 0; i < len; i++) {
        this._buffer[this.pos++] = str.charCodeAt(i);
      }
    } else {
      // Use TextEncoder for non-ASCII strings
      const bytes = this._textEncoder.encode(str);
      this.writeBytes(bytes);
    }
  }
}
