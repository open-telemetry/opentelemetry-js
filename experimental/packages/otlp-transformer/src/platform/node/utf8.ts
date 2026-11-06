/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export function utf8ByteLength(str: string): number {
  return Buffer.byteLength(str, 'utf8');
}
