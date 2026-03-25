/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
  private _rawTraceState: string;
  private _internalState: Map<string, string> | undefined;

  constructor(rawTraceState?: string) {
    this._rawTraceState =
      typeof rawTraceState === 'string' ? rawTraceState : '';
  }

  set(key: string, value: string): TraceState {
    if (!validateKey(key) || !validateValue(value)) {
      return this;
    }

    const newState = new Map((this._internalState ??= this._parse()));
    newState.delete(key);
    newState.set(key, value);
    return this._fromState(newState);
  }

  unset(key: string): TraceState {
    const newState = new Map((this._internalState ??= this._parse()));
    newState.delete(key);
    return this._fromState(newState);
  }

  get(key: string): string | undefined {
    this._internalState ??= this._parse();
    return this._internalState.get(key);
  }

  serialize(): string {
    if (this._internalState) {
      // We iterate normaly but instead of appending we prepend to get
      // the reversed order
      let serialized = '';
      let index = 0;
      for (const entry of this._internalState) {
        if (index > 0) {
          serialized = LIST_MEMBERS_SEPARATOR + serialized;
        }
        serialized =
          `${entry[0]}${LIST_MEMBER_KEY_VALUE_SPLITTER}${entry[1]}` +
          serialized;
        index++;
      }
      return serialized;
    }
    return this._rawTraceState;
  }

  private _parse(): Map<string, string> {
    const vendorMembers = this._rawTraceState.split(LIST_MEMBERS_SEPARATOR);

    // This Map will have the order reversed
    const vendorEntries = new Map();
    let currentLength = 0;

    for (const member of vendorMembers) {
      const m = member.trim();
      const idx = m.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (idx === -1) {
        continue;
      }

      const key = m.slice(0, idx);
      const value = m.slice(idx + 1);
      if (!validateKey(key) || !validateValue(value)) {
        continue;
      }

      // Skip if adding the new member exceeds the length
      const futureLength =
        currentLength + member.length + (vendorEntries.size > 0 ? 1 : 0);
      if (futureLength > MAX_TRACE_STATE_LEN) {
        continue;
      }

      // All good, add it
      vendorEntries.set(key, value);
      currentLength = futureLength;

      // Check if we reached the max items
      if (vendorEntries.size >= MAX_TRACE_STATE_ITEMS) {
        break;
      }
    }

    // Now we set the Map in the right order
    return new Map(Array.from(vendorEntries.entries()).reverse());
  }

  private _fromState(state: Map<string, string>): TraceState {
    const traceState = Object.create(TraceState.prototype) as TraceState;
    traceState._internalState = state;
    return traceState;
  }
}
