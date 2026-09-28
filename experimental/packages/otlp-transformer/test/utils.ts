/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { hexToBinary } from '../src/common/hex-to-binary';

/**
 * utility function to convert a string representing a hex value to a base64 string
 * that represents the bytes of that hex value.
 * @param hexStr
 */
export function toBase64(hexStr: string) {
  const decoder = new TextDecoder('utf8');
  return btoa(decoder.decode(hexToBinary(hexStr)));
}

/**
 * Cross-platform utility function to convert a Uint8Array to a base64 string.
 * This works in both Node.js and browsers so that we can avoid using Buffer in tests.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
