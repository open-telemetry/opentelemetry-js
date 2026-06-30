/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';

/**
 * Typed, null-safe accessor over a parsed declarative config block.
 *
 * Each getter returns the typed value, or `undefined` when the key is missing or
 * has the wrong type. A wrong type logs a `diag.warn`; a missing key is silent.
 * Getters never throw.
 */
export interface DeclarativeConfigProperties {
  getBoolean(key: string): boolean | undefined;
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getStringArray(key: string): string[] | undefined;
  /** Returns a nested accessor for an object-valued key. */
  getStructured(key: string): DeclarativeConfigProperties | undefined;
  /**
   * Warn about keys at this level that no getter has read. Call after reading a
   * block to surface keys a reader does not recognize, such as typos or
   * unsupported options. Checks only this accessor's level; a nested accessor
   * from {@link getStructured} tracks its own keys.
   */
  warnUnreadKeys(): void;
}

class DeclarativeConfigPropertiesImpl implements DeclarativeConfigProperties {
  private readonly _block: Record<string, unknown>;
  private readonly _read = new Set<string>();

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
    return block === undefined
      ? undefined
      : new DeclarativeConfigPropertiesImpl(block as Record<string, unknown>);
  }

  warnUnreadKeys(): void {
    const unread = Object.keys(this._block).filter(k => !this._read.has(k));
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
 * gives an empty accessor, so a reader never has to null-check before reading.
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
