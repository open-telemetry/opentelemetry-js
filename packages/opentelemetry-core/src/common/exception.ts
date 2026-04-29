/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export function buildExceptionCauseChain(cause: unknown): string {
  const visited = new Set<unknown>();
  let result = '';
  let current = cause;
  while (current && typeof current === 'object' && !visited.has(current)) {
    visited.add(current);
    const c = current as { stack?: string; cause?: unknown };
    if (c.stack) {
      result += `\nCaused by: ${c.stack}`;
    }
    current = c.cause;
  }
  return result;
}
