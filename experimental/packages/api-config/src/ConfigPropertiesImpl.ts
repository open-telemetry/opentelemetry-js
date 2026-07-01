/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import type { ConfigProperties } from './types/ConfigProperties';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

class ConfigPropertiesImpl implements ConfigProperties {
  private readonly _block: Record<string, unknown>;
  private readonly _read = new Set<string>();
  private readonly _children = new Map<string, ConfigPropertiesImpl>();

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

  getStructured(key: string): ConfigProperties | undefined {
    const block = this._typed<Record<string, unknown>>(key, 'object', isObject);
    if (block === undefined) {
      return undefined;
    }
    let child = this._children.get(key);
    if (child === undefined) {
      child = new ConfigPropertiesImpl(block);
      this._children.set(key, child);
    }
    return child;
  }

  getStructuredList(key: string): ConfigProperties[] | undefined {
    const list = this._typed<unknown[]>(
      key,
      'sequence of mappings',
      v => Array.isArray(v) && v.every(isObject)
    );
    if (list === undefined) {
      return undefined;
    }
    return list.map(
      entry => new ConfigPropertiesImpl(entry as Record<string, unknown>)
    );
  }

  getPropertyKeys(): string[] {
    return Object.keys(this._block);
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

  // Returns the value when the predicate accepts it. A missing or null key
  // returns undefined and no warning; a present value of the wrong type returns
  // undefined and a warning. Records the key as read either way.
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
export function createConfigProperties(block: unknown): ConfigProperties {
  return new ConfigPropertiesImpl(isObject(block) ? block : EMPTY_BLOCK);
}
