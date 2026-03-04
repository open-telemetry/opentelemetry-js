/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TraceState as TraceStateApi } from '@opentelemetry/api';
import { validateKey, validateValue } from '../internal/validators';

const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const MAX_OTEL_ENTRY_LEN = 256;
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
  private _raw: string;
  private _entries: Array<{ key: string; value: string }> | undefined;

  constructor(rawTraceState?: string) {
    this._raw = typeof rawTraceState === 'string' ? rawTraceState : '';
  }

  set(key: string, value: string): TraceState {
    // Invalid entries results in skipping
    if (!validateKey(key) || !validateValue(value)) {
      return this;
    }

    // Validate the `ot` entry as per spec
    const newEntryLength = key.length + value.length + 1;
    if (key === 'ot' && newEntryLength > MAX_OTEL_ENTRY_LEN) {
      return this;
    }

    // Get a new entries so keep this TraceState inmutable
    this._entries = this._entries || this._parse(this._raw);
    const entries = this._entries.map(e => e);
    const index = entries.findIndex(entry => entry.key === key);

    if (index === -1) {
      // New entry. Invalid if the resulting TraceState is
      // - exceeds the length limit
      // - exceeds the items limit
      if (
        this._raw.length + newEntryLength > MAX_TRACE_STATE_LEN ||
        this._entries.length + 1 > MAX_TRACE_STATE_ITEMS
      ) {
        return this;
      }
    } else {
      // Update entry. Invalid if the resulting TraceState is too long
      const currentEntry = entries[index];
      const currentEntryLength =
        currentEntry.key.length + currentEntry.value.length + 1;
      if (
        this._raw.length - currentEntryLength + newEntryLength >
        MAX_TRACE_STATE_LEN
      ) {
        return this;
      }
      entries.splice(index, 1);
    }
    entries.unshift({ key, value });

    return new TraceState(this._serializeEntries(entries));
  }

  unset(key: string): TraceState {
    this._entries = this._entries || this._parse(this._raw);
    const index = this._entries.findIndex(entry => entry.key === key);

    if (index === -1) {
      return this;
    }
    return new TraceState(
      this._serializeEntries(this._entries.filter((_, idx) => idx !== index))
    );
  }

  get(key: string): string | undefined {
    this._entries = this._entries || this._parse(this._raw);
    const entry = this._entries.find(e => e.key === key);

    return entry && entry.value;
  }

  serialize(): string {
    if (this._entries) {
      return this._serializeEntries(this._entries);
    }
    return this._raw;
  }

  private _parse(raw: string) {
    const members = raw.split(LIST_MEMBERS_SEPARATOR);
    const entries = [];

    for (const member of members) {
      const m = member.trim();
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
