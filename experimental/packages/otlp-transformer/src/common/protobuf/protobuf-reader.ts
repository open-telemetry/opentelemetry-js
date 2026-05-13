/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Minimal binary protobuf reader.
 * Only implements the wire-types that we currently need; this is not intended
 * to be a general-purpose protobuf reader.
 *
 * Since the values we parse are generally small and not very nested, it's public
 * interface does not enforce the same low-allocation philosophy that ProtobufWriter does.
 * If this is needed in the future, we should refactor this to fit the use-case.
 */
export class ProtobufReader {
  pos: number = 0;
  private readonly _buf: Uint8Array;
  private readonly _textDecoder: {
    decode: (input?: Uint8Array | null) => string;
  };

  constructor(buf: Uint8Array) {
    this._buf = buf;
    this._textDecoder = new TextDecoder();
  }

  isAtEnd(): boolean {
    return this.pos >= this._buf.length;
  }

  /** Read a varint and decode it as a tag, returning field number and wire type. */
  readTag(): { fieldNumber: number; wireType: number } {
    const raw = this.readVarint();
    return { fieldNumber: raw >>> 3, wireType: raw & 0x7 };
  }

  /**
   * Read a base-128 varint.
   * Returns a JS `number`; precision above 2^53 is silently lost.
   * Throws if the buffer is truncated mid-varint.
   */
  readVarint(): number {
    let result = 0;
    let shift = 0;
    let terminated = false;
    while (this.pos < this._buf.length) {
      const b = this._buf[this.pos++];
      result += (b & 0x7f) * Math.pow(2, shift);
      shift += 7;
      if ((b & 0x80) === 0) {
        terminated = true;
        break;
      }
    }
    if (!terminated) {
      throw new Error(
        'Truncated buffer: unexpected end of data while reading varint'
      );
    }
    return result;
  }

  /** Read a length-delimited byte sequence (bytes field or embedded message). */
  readBytes(): Uint8Array {
    const len = this.readVarint();
    if (this.pos + len > this._buf.length) {
      throw new Error(
        `Truncated buffer: expected ${len} bytes at position ${this.pos}, but only ${this._buf.length - this.pos} available`
      );
    }
    const slice = this._buf.subarray(this.pos, this.pos + len);
    this.pos += len;
    return slice;
  }

  /** Read a length-delimited UTF-8 string. */
  readString(): string {
    return this._textDecoder.decode(this.readBytes());
  }

  /**
   * Skip an unknown field.
   * Handles wire types 0 (varint), 1 (64-bit), 2 (length-delimited),
   * 3 (start-group), 4 (end-group), and 5 (32-bit).
   */
  skip(wireType: number): void {
    switch (wireType) {
      case 0: // varint
        this.readVarint();
        break;
      case 1: // 64-bit fixed
        this.pos += 8;
        break;
      case 2: // length-delimited
        this.readBytes();
        break;
      case 3: // start group (deprecated)
        // We should never encounter this, but let's handle it gracefully in case we do:
        // Read nested tags until matching end-group (wire type 4) is found.
        // Groups can be nested, so continue until the end-group for this
        // start-group is encountered.
        while (!this.isAtEnd()) {
          const { wireType: nestedWireType } = this.readTag();
          if (nestedWireType === 4) {
            // matched end-group for this start-group
            break;
          }
          // recursive skip also handles nested groups
          this.skip(nestedWireType);
        }
        break;
      case 4: // end group
        // End-group should be handled by the start-group logic above.
        // When encountered directly in skip, treat it as a no-op (it signals
        // termination of the enclosing group).
        break;
      case 5: // 32-bit fixed
        this.pos += 4;
        break;
      default:
        throw new Error(`Unknown wire type ${wireType}, cannot safely skip`);
    }
  }
}
