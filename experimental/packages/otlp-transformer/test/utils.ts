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
