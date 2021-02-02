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

import { Baggage } from './Baggage';
import { BaggageEntry, BaggageEntryMetadata } from './Entry';
import { BaggageImpl } from './internal/baggage';
import { baggageEntryMetadataSymbol } from './internal/symbol';

export * from './Baggage';
export * from './Entry';

/**
 * Create a new Baggage with optional entries
 *
 * @param entries An array of baggage entries the new baggage should contain
 */
export function createBaggage(
  entries: Record<string, BaggageEntry> = {}
): Baggage {
  return new BaggageImpl(new Map(Object.entries(entries)));
}

/**
 * Create a serializable BaggageEntryMetadata object from a string.
 *
 * @param str string metadata. Format is currently not defined by the spec and has no special meaning.
 *
 */
export function baggageEntryMetadataFromString(
  str: string
): BaggageEntryMetadata {
  if (typeof str !== 'string') {
    // @TODO log diagnostic
    str = '';
  }

  return {
    __TYPE__: baggageEntryMetadataSymbol,
    toString() {
      return str;
    },
  };
}
