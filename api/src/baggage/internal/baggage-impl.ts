/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    return Array.from(this._entries.entries()).map(([k, v]) => [k, v]);
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
