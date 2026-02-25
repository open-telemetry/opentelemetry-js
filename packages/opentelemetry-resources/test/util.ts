/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Suite } from 'mocha';

export function describeBrowser(title: string, fn: (this: Suite) => void) {
  title = `Browser: ${title}`;
  if (typeof process === 'object' && process.release?.name === 'node') {
    return describe.skip(title, fn);
  }
  return describe(title, fn);
}

export function describeNode(title: string, fn: (this: Suite) => void) {
  title = `Node.js: ${title}`;
  if (typeof process !== 'object' || process.release?.name !== 'node') {
    return describe.skip(title, fn);
  }
  return describe(title, fn);
}
