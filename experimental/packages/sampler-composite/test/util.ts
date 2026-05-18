/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Use a fixed seed simple but reasonable random number generator for consistent tests.
// Unlike many languages, there isn't a way to set the seed of the built-in random.

function splitmix32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

export function traceIdGenerator(): () => string {
  const seed = 0xdeadbeef;
  const random = splitmix32(seed);
  // Pre-mix the state.
  for (let i = 0; i < 15; i++) {
    random();
  }
  return () => {
    const parts: string[] = [];
    // 32-bit randoms, concatenate 4 of them
    for (let i = 0; i < 4; i++) {
      const val = Math.round(random() * 0xffffffff);
      parts.push(val.toString(16).padStart(8, '0'));
    }
    return parts.join('');
  };
}
