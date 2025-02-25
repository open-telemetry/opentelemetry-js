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

import type { TraceState as TraceStateApi } from '@opentelemetry/api';
import { validateKey, validateValue } from '../internal/validators';

const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';

/**
 * TraceState must be a class and not a simple object type because of the spec
 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
 *
 * Here is the list of allowed mutations:
 * - New key-value pair should be added into the beginning of the list
 * - The value of any key can be updated. Modified keys MUST be moved to the
 * beginning of the list.
 */
export class TraceState implements TraceStateApi {
  private _state: string;

  constructor(rawTraceState?: string) {
    this._state = rawTraceState || '';
  }

  set(key: string, value: string): TraceState {
    if (!validateKey(key) || !validateValue(value)) {
      // TODO: warn of invalid key or value???
      return this;
    }

    const entries = this._getEntries();
    const index = entries.findIndex(entry => entry.key === key);

    if (index !== -1) {
      entries.splice(index, 1);
    }
    entries.unshift({ key, value });

    const state = this._serializeEntries(entries);
    return new TraceState(state.length > MAX_TRACE_STATE_LEN ? '' : state);
  }

  unset(key: string): TraceState {
    const entries = this._getEntries();
    const index = entries.findIndex(entry => entry.key === key);

    if (index !== -1) {
      entries.splice(index, 1);
    }

    return new TraceState(this._serializeEntries(entries));
  }

  get(key: string): string | undefined {
    const entries = this._getEntries();
    const entry = entries.find(e => e.key === key);

    return entry && entry.value;
  }

  serialize(): string {
    return this._state;
  }

  private _getEntries(): Array<{ key: string; value: string }> {
    // Do not parse/validate if state already surpass max length
    if (this._state.length > MAX_TRACE_STATE_LEN) {
      return [];
    }
    const entries = [];
    const members = this._state
      .split(LIST_MEMBERS_SEPARATOR)
      .map(m => m.trim());
    for (const m of members) {
      const idx = m.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (idx === -1) {
        continue;
      }
      const key = m.slice(0, idx);
      const value = m.slice(idx + 1);
      const isValid = validateKey(key) && validateValue(value);
      const hasSpace = entries.length < MAX_TRACE_STATE_ITEMS;
      if (isValid && hasSpace) {
        entries.push({ key, value });
      }
    }
    return entries;
  }

  private _serializeEntries(
    entries: Array<{ key: string; value: string }>
  ): string {
    return entries
      .map(e => `${e.key}${LIST_MEMBER_KEY_VALUE_SPLITTER}${e.value}`)
      .join(LIST_MEMBERS_SEPARATOR);
  }
}
