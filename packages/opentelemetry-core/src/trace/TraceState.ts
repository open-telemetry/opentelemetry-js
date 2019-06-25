/**
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';

// TODO validate maximum number of items
// const MAX_TRACE_STATE_ITEMS = 32;

const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';

interface InternalTraceState {
  [key: string]: string;
}

export class TraceState implements types.TraceState {
  private internalState: InternalTraceState = {};

  constructor(s?: string) {
    if (s) this.parse(s);
  }

  set(name: string, value: string): void {
    // TODO: Consider to use `list` or `Map` to preserve ordering.
    // Benchmark the different approaches and use the faster one.
    this.internalState = {
      // ensure that the new key ends up in the beginning of the list
      [name]: value,
      ...this.internalState,
      // ensure that updates work
      [name]: value,
    };
  }

  serialize(): string {
    return this.keys()
      .reduce((agg: string[], key) => {
        agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
        return agg;
      }, [])
      .join(LIST_MEMBERS_SEPARATOR);
  }

  parse(s: string) {
    if (s.length > MAX_TRACE_STATE_LEN) return;

    // TODO validate maximum number of items
    this.internalState = s
      .split(LIST_MEMBERS_SEPARATOR)
      .reduce((agg: InternalTraceState, part: string) => {
        const i = part.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
        if (i !== -1) {
          // TODO validate key/value constraints defined in the spec
          agg[part.slice(0, i)] = part.slice(i + 1, part.length);
        }
        return agg;
      }, {});
  }

  // TEST_ONLY
  keys(): string[] {
    return Object.keys(this.internalState);
  }

  // TEST_ONLY
  get(name: string): string | undefined {
    return this.internalState[name];
  }
}
