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
    // 64-bit handling - use explicit size calculation instead of loop
    let low: number;
    let high: number;

    if (value >= 0) {
      low = value >>> 0;
      high = (value / 0x100000000) >>> 0;
    } else {
      const abs = Math.abs(value);
      low = abs >>> 0;
      high = (abs / 0x100000000) >>> 0;
      low = ~low >>> 0;
      high = ~high >>> 0;
      low = (low + 1) >>> 0;
      if (low === 0) {
        high = (high + 1) >>> 0;
      }
    }

    // Calculate size based on the magnitude
    // Each byte can hold 7 bits of data
    if (high === 0) {
      // Only low part has data
      if (low < 0x80) return 1;
      if (low < 0x4000) return 2;
      if (low < 0x200000) return 3;
      if (low < 0x10000000) return 4;
      return 5;
    } else {
      // High part has data - need 6-10 bytes
      if (high < 0x8) return 6; // 35 bits
      if (high < 0x400) return 7; // 42 bits
      if (high < 0x20000) return 8; // 49 bits
      if (high < 0x1000000) return 9; // 56 bits
      return 10; // 57-64 bits
    }
  }
}
