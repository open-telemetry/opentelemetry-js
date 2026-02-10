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

/**
 * Calculate size of a number encoded as varint
 * @param value
 */
export function sizeAsVarint(value: number): number {
  if (value >= 0 && value <= 0xffffffff) {
    const v = value >>> 0;
    if (v < 0x80) return 1;
    if (v < 0x4000) return 2;
    if (v < 0x200000) return 3;
    if (v < 0x10000000) return 4;
    return 5;
  } else {
    // 64-bit handling
    let high: number;

    if (value >= 0) {
      high = (value / 0x100000000) >>> 0;
    } else {
      const abs = Math.abs(value);
      let low = abs >>> 0;
      high = (abs / 0x100000000) >>> 0;
      low = ~low >>> 0;
      high = ~high >>> 0;
      low = (low + 1) >>> 0;
      if (low === 0) {
        high = (high + 1) >>> 0;
      }
    }

    // high will always be > 0 in this branch, otherwise we would not need 64-bit handling;
    // encoding will always be 5-10 bytes
    if (high <= 0x7) return 5; // up to 35 bits (2^35-1: high=7, low=0xFFFFFFFF)
    if (high <= 0x3ff) return 6; // up to 42 bits (2^42-1: high=1023, low=0xFFFFFFFF)
    if (high <= 0x1ffff) return 7; // up to 49 bits
    if (high <= 0xffffff) return 8; // up to 56 bits
    if (high <= 0x7fffffff) return 9; // up to 63 bits
    return 10; // 64 bits
  }
}
