/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TraceState as TraceStateApi } from '@opentelemetry/api';
import {
  isValidOtelKey,
  isValidOtelValue,
  validateKey,
  validateValue,
} from '../internal/validators';

const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const MAX_MEMBER_LEN = 256;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';

const OT_LIST_MEMBERS_SEPARATOR = ';';
const OT_LIST_MEMBER_KEY_VALUE_SPLITTER = ':';

/**
 * TraceState must be a class and not a simple object type because of the spec
 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field). It also
 * limits the scope of modifications to the subkeys within the OpenTelemetry
 * vendor key (`ot`)
 *
 * Here is the list of allowed mutations:
 * - New key-value pair should be added into the beginning of the list.
 * - The value of any key can be updated. Modified keys MUST be moved to the
 * beginning of the list.
 * - The intire `ot` entry MUST NOT exceed 256 characters.
 */
export class TraceState implements TraceStateApi {
  private _raw: string;

  private _vendorEntries: Map<string, string> | undefined;
  private _otelEntries: Map<string, string> | undefined;

  constructor(rawTraceState?: string) {
    this._raw = typeof rawTraceState === 'string' ? rawTraceState : '';
  }

  set(key: string, value: string): TraceState {
    if (!isValidOtelKey(key) || !isValidOtelValue(value)) {
      return this;
    }

    if (!this._vendorEntries) {
      this._parse();
    }

    // Shallow copy the maps to manipulate and serialize
    const vendorEntries = new Map(this._vendorEntries);
    const otelEntries = new Map(this._otelEntries);

    otelEntries.set(key, value);
    const otValue = this._serializeMap(
      otelEntries,
      OT_LIST_MEMBERS_SEPARATOR,
      OT_LIST_MEMBER_KEY_VALUE_SPLITTER
    );

    vendorEntries.delete('ot');
    vendorEntries.set('ot', otValue);
    // Checks on max length and items
    // - max num of vendor keys
    // - max length of the tracestate string
    // - max length of the "ot" entry
    if (vendorEntries.size > MAX_TRACE_STATE_ITEMS) {
      // TODO: move up
      return this;
    }

    if (otValue.length + 3 > MAX_MEMBER_LEN) {
      return this;
    }
    const tracestate = this._serializeMap(
      vendorEntries,
      LIST_MEMBERS_SEPARATOR,
      LIST_MEMBER_KEY_VALUE_SPLITTER
    );
    if (tracestate.length > MAX_TRACE_STATE_LEN) {
      return this;
    }

    return new TraceState(tracestate);
  }

  unset(key: string): TraceState {
    if (!isValidOtelKey(key)) {
      return this;
    }

    if (!this._vendorEntries) {
      this._parse();
    }

    if (!this._otelEntries) {
      return this;
    }

    const value = this._otelEntries.get(key);
    if (!value) {
      return this;
    }

    // Shallow copy the maps to manipulate and serialize
    const vendorEntries = new Map(this._vendorEntries);
    const otelEntries = new Map(this._otelEntries);

    otelEntries.delete(key);
    vendorEntries.delete('ot');
    if (otelEntries.size > 0) {
      vendorEntries.set(
        'ot',
        this._serializeMap(
          otelEntries,
          OT_LIST_MEMBERS_SEPARATOR,
          OT_LIST_MEMBER_KEY_VALUE_SPLITTER
        )
      );
    }

    return new TraceState(
      this._serializeMap(
        vendorEntries,
        LIST_MEMBERS_SEPARATOR,
        LIST_MEMBER_KEY_VALUE_SPLITTER
      )
    );
  }

  get(key: string): string | undefined {
    if (!this._vendorEntries) {
      this._parse();
    }

    return this._otelEntries?.get(key);
  }

  serialize(): string {
    if (this._vendorEntries) {
      return this._serializeMap(
        this._vendorEntries,
        LIST_MEMBERS_SEPARATOR,
        LIST_MEMBER_KEY_VALUE_SPLITTER
      );
    }
    return this._raw;
  }

  private _parse() {
    const vendorMembers = this._raw.split(LIST_MEMBERS_SEPARATOR);

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
      const futureLength = currentLength + member.length + (vendorEntries.size > 0 ? 1 : 0);
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

    // Now parse the `ot` sub-keys and its values
    const otelEntryValue = vendorEntries.get('ot');
    if (otelEntryValue) {
      const otelMembers = otelEntryValue.split(OT_LIST_MEMBERS_SEPARATOR);
      this._otelEntries = new Map();
      for (const otelMember of otelMembers) {
        const idx = otelMember.indexOf(OT_LIST_MEMBER_KEY_VALUE_SPLITTER);
        if (idx === -1) {
          continue;
        }
        const key = otelMember.slice(0, idx);
        const value = otelMember.slice(idx + 1);

        if (!isValidOtelKey(key) || !isValidOtelValue(value)) {
          continue;
        }

        // TODO: truncate to the max lenght of antry value (256)?
        this._otelEntries.set(key, value);
      }
    }

    // Now we set the Map in the right order
    this._vendorEntries = new Map(
      Array.from(vendorEntries.entries()).reverse()
    );
  }

  private _serializeMap(
    entries: Map<string, string>,
    memberSeparator: string,
    keyvalSplitter: string
  ): string {
    // We iterate normaly but instead of appending we prepend to get
    // the reversed order
    let serialized = '';
    let index = 0;
    for (const e of entries) {
      if (index > 0) {
        serialized = memberSeparator + serialized;
      }
      serialized = `${e[0]}${keyvalSplitter}${e[1]}` + serialized;
      index++;
    }
    return serialized;
  }
}
