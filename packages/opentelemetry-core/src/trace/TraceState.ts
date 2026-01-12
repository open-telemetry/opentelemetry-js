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

import * as api from '@opentelemetry/api';
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
export class TraceState implements api.TraceState {
  private _internalState: Map<string, string> = new Map();

  constructor(rawTraceState?: string) {
    if (rawTraceState) this._parse(rawTraceState);
  }

  set(key: string, value: string): TraceState {
    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }

  unset(key: string): TraceState {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }

  get(key: string): string | undefined {
    return this._internalState.get(key);
  }

  serialize(): string {
    const size = this._internalState.size;
    if (size === 0) {
      return '';
    }

    const keys = Array.from(this._internalState.keys());
    // Pre-allocate array and fill in reverse order to avoid creating
    // an intermediate reversed array
    const parts = new Array<string>(size);
    for (let i = size - 1, j = 0; i >= 0; i--, j++) {
      const key = keys[i];
      parts[j] =
        key + LIST_MEMBER_KEY_VALUE_SPLITTER + this._internalState.get(key);
    }
    return parts.join(LIST_MEMBERS_SEPARATOR);
  }

  private _parse(rawTraceState: string) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN) {
      return;
    }

    const parts = rawTraceState.split(LIST_MEMBERS_SEPARATOR);
    const n = parts.length;
    if (n === 0) {
      return;
    }

    // Iterate in reverse order so Map insertion order is reversed
    // This ensures serialize() outputs entries in the original order
    const map = new Map<string, string>();
    for (let i = n - 1; i >= 0; i--) {
      const listMember = parts[i].trim(); // Optional Whitespace (OWS) handling
      const eqIdx = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (eqIdx !== -1) {
        const key = listMember.slice(0, eqIdx);
        const value = listMember.slice(eqIdx + 1);
        if (validateKey(key) && validateValue(value)) {
          map.set(key, value);
        }
      }
    }

    // Truncate if needed - keep first MAX_TRACE_STATE_ITEMS from original order
    // Since we iterated in reverse, those are the last items in Map order
    if (map.size > MAX_TRACE_STATE_ITEMS) {
      const entries = Array.from(map.entries());
      map.clear();
      for (
        let i = entries.length - MAX_TRACE_STATE_ITEMS;
        i < entries.length;
        i++
      ) {
        map.set(entries[i][0], entries[i][1]);
      }
    }
    this._internalState = map;
  }

  private _clone(): TraceState {
    const traceState = Object.create(TraceState.prototype) as TraceState;
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
}
