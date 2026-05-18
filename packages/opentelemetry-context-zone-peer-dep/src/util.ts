/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * check if an object has `addEventListener` and `removeEventListener` functions.
 * Generally only called with a `TargetWithEvents` but may be called with an `unknown` value.
 * @param obj - The object to check.
 */
export function isListenerObject(obj: unknown): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'addEventListener' in obj &&
    typeof obj.addEventListener === 'function' &&
    'removeEventListener' in obj &&
    typeof obj.removeEventListener === 'function'
  );
}
