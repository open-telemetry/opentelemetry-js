/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SessionIdGenerator } from './types/SessionIdGenerator';

export class DefaultIdGenerator implements SessionIdGenerator {
  generateSessionId = getIdGenerator(16);
}

const SHARED_CHAR_CODES_ARRAY = Array(32);
function getIdGenerator(bytes: number): () => string {
  return function generateId() {
    for (let i = 0; i < bytes * 2; i++) {
      SHARED_CHAR_CODES_ARRAY[i] = Math.floor(Math.random() * 16) + 48;
      // valid hex characters in the range 48-57 and 97-102
      if (SHARED_CHAR_CODES_ARRAY[i] >= 58) {
        SHARED_CHAR_CODES_ARRAY[i] += 39;
      }
    }
    return String.fromCharCode.apply(
      null,
      SHARED_CHAR_CODES_ARRAY.slice(0, bytes * 2)
    );
  };
}
