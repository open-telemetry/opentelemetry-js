/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export function encodeBase64(bytes: Uint8Array): string {
  // Not spread into btoa: a large array would overflow the stack.
  const chars = new Array<string>(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    chars[i] = String.fromCharCode(bytes[i]);
  }
  return btoa(chars.join(''));
}
