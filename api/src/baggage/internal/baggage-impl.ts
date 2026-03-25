/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Baggage, BaggageEntry } from '../types';

export class BaggageImpl implements Baggage {
  private _entries: Map<string, BaggageEntry>;

  constructor(entries?: Map<string, BaggageEntry>) {
    this._entries = entries ? new Map(entries) : new Map();
  }

  getEntry(key: string): BaggageEntry | undefined {
    const entry = this._entries.get(key);
    if (!entry) {
      return undefined;
    }

    return Object.assign({}, entry);
  }

  getAllEntries(): [string, BaggageEntry][] {
    return Array.from(this._entries.entries());
  }

  setEntry(key: string, entry: BaggageEntry): BaggageImpl {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.set(key, entry);
    return newBaggage;
  }

  removeEntry(key: string): BaggageImpl {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.delete(key);
    return newBaggage;
  }

  removeEntries(...keys: string[]): BaggageImpl {
    const newBaggage = new BaggageImpl(this._entries);
    for (const key of keys) {
      newBaggage._entries.delete(key);
    }
    return newBaggage;
  }

  clear(): BaggageImpl {
    return new BaggageImpl();
  }
}
