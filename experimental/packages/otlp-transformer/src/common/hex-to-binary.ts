/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

function intValue(charCode: number): number {
  // 0-9
  if (charCode >= 48 && charCode <= 57) {
    return charCode - 48;
  }

  // a-f
  if (charCode >= 97 && charCode <= 102) {
    return charCode - 87;
  }

  // A-F
  return charCode - 55;
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
    const hi = intValue(hexStr.charCodeAt(2 * i));
    const lo = intValue(hexStr.charCodeAt(2 * i + 1));
    buf[offset + i] = (hi << 4) | lo;
  }
}

export function hexToBinary(hexStr: string): Uint8Array {
  const buf = new Uint8Array(hexStr.length / 2);
  writeHexToBinary(hexStr, buf.length, buf, 0);
  return buf;
}
