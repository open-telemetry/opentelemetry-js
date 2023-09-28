/*
 * Copyright 2009 The Closure Library Authors
 * Copyright 2020 Daniel Wirtz / The long.js Authors.
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

// Original version by long.js: https://github.com/dcodeIO/long.js/

const TWO_PWR_32 = (1 << 16) * (1 << 16);

export class UnsignedLong {
  low: number;
  high: number;

  constructor(low: number, high: number) {
    this.low = low;
    this.high = high;
  }

  static fromU32(value: number): UnsignedLong {
    return new UnsignedLong(value % TWO_PWR_32 | 0, 0);
  }

  multiply(value: UnsignedLong): UnsignedLong {
    const a48 = this.high >>> 16;
    const a32 = this.high & 0xffff;
    const a16 = this.low >>> 16;
    const a00 = this.low & 0xffff;

    const b48 = value.high >>> 16;
    const b32 = value.high & 0xffff;
    const b16 = value.low >>> 16;
    const b00 = value.low & 0xffff;

    let c48 = 0;
    let c32 = 0;
    let c16 = 0;
    let c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xffff;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xffff;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xffff;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xffff;

    return new UnsignedLong((c16 << 16) | c00, (c48 << 16) | c32);
  }

  add(value: UnsignedLong): UnsignedLong {
    const a48 = this.high >>> 16;
    const a32 = this.high & 0xffff;
    const a16 = this.low >>> 16;
    const a00 = this.low & 0xffff;

    const b48 = value.high >>> 16;
    const b32 = value.high & 0xffff;
    const b16 = value.low >>> 16;
    const b00 = value.low & 0xffff;

    let c48 = 0;
    let c32 = 0;
    let c16 = 0;
    let c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xffff;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xffff;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c48 += a48 + b48;
    c48 &= 0xffff;

    return new UnsignedLong((c16 << 16) | c00, (c48 << 16) | c32);
  }

  static fromString(str: string): UnsignedLong {
    let result = UnsignedLong.fromU32(0);

    for (let i = 0; i < str.length; i += 8) {
      const size = Math.min(8, str.length - i);
      const value = parseInt(str.substring(i, i + size));
      if (size < 8) {
        const power = UnsignedLong.fromU32(Math.pow(10, size));
        result = result.multiply(power).add(UnsignedLong.fromU32(value));
      } else {
        result = result.multiply(UnsignedLong.fromU32(100_000_000));
        result = result.add(UnsignedLong.fromU32(value));
      }
    }

    return result;
  }
}
