/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export function utf8ByteLength(str: string): number {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      length++;
    } else if (code < 0x800) {
      length += 2;
    } else if (
      code >= 0xd800 &&
      code <= 0xdbff &&
      str.charCodeAt(i + 1) >= 0xdc00 &&
      str.charCodeAt(i + 1) <= 0xdfff
    ) {
      length += 4;
      i++;
    } else {
      length += 3;
    }
  }
  return length;
}
