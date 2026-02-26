/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type Func<T> = (...args: unknown[]) => T;

/**
 * Minimum requirements that the object needs to have so that it can bind to the events instead of function
 * this is "addEventListener" and "removeEventListener" - see {@link isListenerObject}
 */
export interface TargetWithEvents {
  addEventListener?(
    event: string,
    listener: (...args: unknown[]) => void,
    opts?: { once: boolean }
  ): unknown;
  removeEventListener?(
    event: string,
    listener: (...args: unknown[]) => void,
    opts?: { once: boolean }
  ): unknown;
  __ot_listeners?: { [name: string]: WeakMap<Func<void>, Func<void>> };
}
