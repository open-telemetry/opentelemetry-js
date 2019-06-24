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
// const maximumTraceStateItems = 32;

const maximumTraceStateLength = 512;
export interface InternalTraceState {
  [key: string]: string;
}

export class TraceState implements types.TraceState {
  private internalState: InternalTraceState = {};

  constructor(internalState?: InternalTraceState) {
    if (internalState) this.internalState = internalState;
  }

  get(name: string): string | undefined {
    return this.internalState[name];
  }

  keys(): string[] {
    return Object.keys(this.internalState);
  }

  set(name: string, value: string): void {
    this.internalState = {
      // ensure that the new key ends up in the beginning of the list
      [name]: value,
      ...this.internalState,
      // ensure that updates work
      [name]: value,
    };
  }
}

export function serialize(state: TraceState): string {
  return state
    .keys()
    .reduce((agg: string[], key) => {
      agg.push(`${key}=${state.get(key)}`);
      return agg;
    }, [])
    .join(',');
}

export function parse(s: string | null): TraceState | null {
  if (s == null || s.length > maximumTraceStateLength) return null;

  // TODO validate maximum number of items
  const states = s
    .split(',')
    .reduce((agg: InternalTraceState, part: string) => {
      const i = part.indexOf('=');
      if (i !== -1) {
        // TODO validate key/value constraints defined in the spec
        agg[part.slice(0, i)] = part.slice(i + 1, part.length);
      }
      return agg;
    }, {});

  return new TraceState(states);
}
