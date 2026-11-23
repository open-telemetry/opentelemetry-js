/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Maps a hex digit's char code to its value. Other characters map to 0.
const HEX_VALUES = new Uint8Array(128);
for (let i = 0; i < 10; i++) {
  HEX_VALUES[48 + i] = i;
}
for (let i = 0; i < 6; i++) {
  HEX_VALUES[65 + i] = 10 + i;
  HEX_VALUES[97 + i] = 10 + i;
}

/**
 * Decodes the first `byteLength` bytes of a hex string into `buf` at
 * `offset`, so a serializer can decode straight into its output buffer.
 */
export function writeHexToBinary(
  hexStr: string,
  byteLength: number,
  buf: Uint8Array,
  offset: number
): void {
  for (let i = 0; i < byteLength; i++) {
    const hi = HEX_VALUES[hexStr.charCodeAt(2 * i) & 0x7f];
    const lo = HEX_VALUES[hexStr.charCodeAt(2 * i + 1) & 0x7f];
    buf[offset + i] = (hi << 4) | lo;
  }
}

export function hexToBinary(hexStr: string): Uint8Array {
  const buf = new Uint8Array(hexStr.length / 2);
  writeHexToBinary(hexStr, buf.length, buf, 0);
  return buf;
}
