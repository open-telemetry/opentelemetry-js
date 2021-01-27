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

import type { Baggage } from '../Baggage';
import type { BaggageEntry } from '../Entry';

export class BaggageImpl implements Baggage {
  constructor(private _entries: BaggageEntry[]) {}

  getEntry(key: string): BaggageEntry | undefined {
    const entry = this._entries.find(e => e.key === key);
    if (!entry) {
      return undefined;
    }

    return Object.assign(Object.create(null), entry);
  }

  getAllEntries(): BaggageEntry[] {
    return this._entries.map(e => Object.assign(Object.create(null), e));
  }

  setEntry(key: string, value: string, metadata?: string): BaggageImpl {
    const newBaggage = this.removeEntry(key);
    newBaggage._entries.push(
      Object.assign(Object.create(null), { key, value, metadata })
    );
    return newBaggage;
  }

  removeEntry(key: string): BaggageImpl {
    return new BaggageImpl(this._entries.filter(e => e.key !== key));
  }
}
