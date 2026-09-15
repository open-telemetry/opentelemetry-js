/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TraceState } from '../trace_state';
import { validateKey, validateValue } from './tracestate-validators';

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
 *
 * @deprecated Use TraceState from "@opentelemetry/core". This will be removed in the next major version.
 */
export class TraceStateImpl implements TraceState {
  private _internalState: Map<string, string> = new Map();

  constructor(rawTraceState?: string) {
    if (rawTraceState) this._parse(rawTraceState);
  }

  set(key: string, value: string): TraceStateImpl {
    // TODO: Benchmark the different approaches(map vs list) and
    // use the faster one.
    const currValue = this._internalState.get(key);

    // Get the length the serialized list would have after the mutation
    // - for existing keys only the length of the value changes
    // - for new keys it is the key & value length plus
    //   - +1 for the key/value splitter
    //   - +1 for the separator if there are other keys
    let newLength = this.serialize().length;
    if (typeof currValue === 'string') {
      newLength += value.length - currValue.length;
    } else {
      // A list can hold at most 32 list-members, so a new key is only
      // accepted while there is room for it. Updating an existing key does
      // not change the count and is always allowed.
      if (this._internalState.size >= MAX_TRACE_STATE_ITEMS) {
        return this;
      }
      newLength +=
        key.length + value.length + (this._internalState.size > 0 ? 2 : 1);
    }
    if (newLength > MAX_TRACE_STATE_LEN) {
      return this;
    }

    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }

  unset(key: string): TraceStateImpl {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }

  get(key: string): string | undefined {
    return this._internalState.get(key);
  }

  serialize(): string {
    return (
      Array.from(this._internalState.keys())
        // Use reduceRight() because keys are stored in reverse insertion order.
        .reduceRight((agg: string[], key) => {
          agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
          return agg;
        }, [])
        .join(LIST_MEMBERS_SEPARATOR)
    );
  }

  private _parse(rawTraceState: string) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN) return;
    this._internalState = rawTraceState
      .split(LIST_MEMBERS_SEPARATOR)
      // Use reduceRight() so new keys (.set(...)) will be placed at the beginning
      .reduceRight((agg: Map<string, string>, part: string) => {
        const listMember = part.trim(); // Optional Whitespace (OWS) handling
        const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
        if (i !== -1) {
          const key = listMember.slice(0, i);
          const value = listMember.slice(i + 1, part.length);
          if (validateKey(key) && validateValue(value)) {
            agg.set(key, value);
          } else {
            // TODO: Consider to add warning log
          }
        }
        return agg;
      }, new Map());

    // Because of the reverse() requirement, trunc must be done after map is created
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
      this._internalState = new Map(
        Array.from(this._internalState.entries())
          .reverse() // Use reverse same as original tracestate parse chain
          .slice(0, MAX_TRACE_STATE_ITEMS)
      );
    }
  }

  // @ts-expect-error TS6133 Accessed in tests only.
  private _keys(): string[] {
    return Array.from(this._internalState.keys()).reverse();
  }

  private _clone(): TraceStateImpl {
    const traceState = new TraceStateImpl();
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
}
