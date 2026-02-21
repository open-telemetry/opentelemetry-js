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

import type { IProtobufWriter } from './i-protobuf-writer';
import { sizeAsVarint } from './utils';

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
    this.pos += sizeAsVarint(length);
  }

  writeVarint(value: number): void {
    this.pos += sizeAsVarint(value);
  }

  writeFixed32(_value: number): void {
    this.pos += 4;
  }

  writeFixed64(_low: number, _high: number): void {
    this.pos += 8;
  }

  writeBytes(bytes: Uint8Array): void {
    this.pos += sizeAsVarint(bytes.length);
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
    this.pos += sizeAsVarint(byteLen);
    this.pos += byteLen;
  }
}
