/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IProtobufWriter } from './i-protobuf-writer';
import { estimateVarintSize } from './utils';

/**
 * Calculate UTF-8 byte length without encoding
 * @param str valid UTF-16 string
 */
function utf8ByteLength(str: string): number {
  // No quick path for ASCII, since we need to loop though all chars anyway.
  const len = str.length;
  let byteLen = 0;
  for (let i = 0; i < len; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      byteLen += 1;
    } else if (code < 0x800) {
      byteLen += 2;
    } else if (code < 0xd800 || code >= 0xe000) {
      byteLen += 3;
    } else {
      // Surrogate pair
      i++; // Skip the next character
      byteLen += 4;
    }
  }
  return byteLen;
}

/**
 * Size estimator for protobuf messages.
 * Implements the same interface as ProtobufWriter but only counts bytes without allocating a buffer.
 * @internal
 */
export class ProtobufSizeEstimator implements IProtobufWriter {
  public pos: number = 0;

  startLengthDelimited(): number {
    return this.pos;
  }

  finishLengthDelimited(_: number, length: number): void {
    this.pos += estimateVarintSize(length);
  }

  writeVarint(value: number): void {
    this.pos += estimateVarintSize(value);
  }

  writeSint32(value: number): void {
    // Zigzag encode: (n << 1) ^ (n >> 31)
    this.pos += estimateVarintSize(((value << 1) ^ (value >> 31)) >>> 0);
  }

  writeSfixed64(_value: number): void {
    this.pos += 8;
  }

  writeFixed32(_value: number): void {
    this.pos += 4;
  }

  writeFixed64(_low: number, _high: number): void {
    this.pos += 8;
  }

  writeBytes(bytes: Uint8Array): void {
    this.pos += estimateVarintSize(bytes.length);
    this.pos += bytes.length;
  }

  writeTag(fieldNumber: number, wireType: number): void {
    this.writeVarint((fieldNumber << 3) | wireType);
  }

  writeDouble(_value: number): void {
    this.pos += 8;
  }

  writeString(str: string): void {
    const byteLen = utf8ByteLength(str);
    this.pos += estimateVarintSize(byteLen);
    this.pos += byteLen;
  }
}
