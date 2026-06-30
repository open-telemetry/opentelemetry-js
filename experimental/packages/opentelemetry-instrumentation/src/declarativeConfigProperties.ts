/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';

/**
 * Typed, null-safe accessor over a parsed declarative config block.
 *
 * Each getter returns the typed value, or `undefined` when the key is missing or
 * has the wrong type. A type mismatch is logged via `diag.warn`; a missing key
 * is silent. Getters never throw.
 */
export interface DeclarativeConfigProperties {
  getBoolean(key: string): boolean | undefined;
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getStringArray(key: string): string[] | undefined;
  /**
   * Returns a nested accessor for an object-valued key. Repeated calls for the
   * same key return the same accessor, so reads and unread-key tracking
   * accumulate across calls.
   */
  getStructured(key: string): DeclarativeConfigProperties | undefined;
  /**
   * Returns keys that no getter has read, such as typos or unsupported options.
   * Recurses into structured children that were read via {@link getStructured},
   * reporting their unread keys with a dotted path (e.g. `http.client.foo`). A
   * key whose nested block was never read is reported on its own.
   */
  unreadKeys(): string[];
  /**
   * Warn about the keys returned by {@link unreadKeys}. Convenience for callers
   * that want the default warning rather than their own message.
   */
  warnUnreadKeys(): void;
}

class DeclarativeConfigPropertiesImpl implements DeclarativeConfigProperties {
  private readonly _block: Record<string, unknown>;
  private readonly _read = new Set<string>();
  private readonly _children = new Map<
    string,
    DeclarativeConfigPropertiesImpl
  >();

  constructor(block: Record<string, unknown>) {
    this._block = block;
  }

  getBoolean(key: string): boolean | undefined {
    return this._typed(key, 'boolean', v => typeof v === 'boolean');
  }

  getString(key: string): string | undefined {
    return this._typed(key, 'string', v => typeof v === 'string');
  }

  getNumber(key: string): number | undefined {
    return this._typed(
      key,
      'number',
      v => typeof v === 'number' && !Number.isNaN(v)
    );
  }

  getStringArray(key: string): string[] | undefined {
    return this._typed(
      key,
      'string array',
      v => Array.isArray(v) && v.every(e => typeof e === 'string')
    );
  }

  getStructured(key: string): DeclarativeConfigProperties | undefined {
    const block = this._typed(
      key,
      'object',
      v => typeof v === 'object' && v !== null && !Array.isArray(v)
    );
    if (block === undefined) {
      return undefined;
    }
    let child = this._children.get(key);
    if (child === undefined) {
      child = new DeclarativeConfigPropertiesImpl(
        block as Record<string, unknown>
      );
      this._children.set(key, child);
    }
    return child;
  }

  unreadKeys(): string[] {
    const unread = Object.keys(this._block).filter(k => !this._read.has(k));
    // A child read via getStructured is itself "read", so recurse into it and
    // report its unread keys with a dotted path.
    for (const [key, child] of this._children) {
      for (const nested of child.unreadKeys()) {
        unread.push(`${key}.${nested}`);
      }
    }
    return unread;
  }

  warnUnreadKeys(): void {
    const unread = this.unreadKeys();
    if (unread.length > 0) {
      diag.warn(
        `ignoring unrecognized declarative config keys: ${unread.join(', ')}`
      );
    }
  }

  // Returns the value when the predicate accepts it. A missing key gives
  // undefined and no warning; a present value of the wrong type gives undefined
  // and a warning. Records the key as read either way.
  private _typed<T>(
    key: string,
    expected: string,
    predicate: (v: unknown) => boolean
  ): T | undefined {
    this._read.add(key);
    const value = this._block[key];
    if (value === undefined || value === null) {
      return undefined;
    }
    if (!predicate(value)) {
      diag.warn(
        `declarative config key "${key}": expected ${expected}, got ${typeof value}; ignoring`
      );
      return undefined;
    }
    return value as T;
  }
}

const EMPTY_BLOCK: Record<string, unknown> = {};

/**
 * Wrap a parsed config block in a typed accessor. A nullish or non-object block
 * yields an empty accessor, so a reader never has to null-check before reading.
 */
export function declarativeConfigProperties(
  block: unknown
): DeclarativeConfigProperties {
  const isObject =
    typeof block === 'object' && block !== null && !Array.isArray(block);
  return new DeclarativeConfigPropertiesImpl(
    isObject ? (block as Record<string, unknown>) : EMPTY_BLOCK
  );
}
