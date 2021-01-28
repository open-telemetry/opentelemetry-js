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

import {
  Baggage,
  Context,
  BaggageEntry,
  getBaggage,
  setBaggage,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
  createBaggage,
  baggageEntryMetadataFromString,
} from '@opentelemetry/api';

const KEY_PAIR_SEPARATOR = '=';
const PROPERTIES_SEPARATOR = ';';
const ITEMS_SEPARATOR = ',';

// Name of the http header used to propagate the baggage
export const BAGGAGE_HEADER = 'baggage';
// Maximum number of name-value pairs allowed by w3c spec
export const MAX_NAME_VALUE_PAIRS = 180;
// Maximum number of bytes per a single name-value pair allowed by w3c spec
export const MAX_PER_NAME_VALUE_PAIRS = 4096;
// Maximum total length of all name-value pairs allowed by w3c spec
export const MAX_TOTAL_LENGTH = 8192;

/**
 * Propagates {@link Baggage} through Context format propagation.
 *
 * Based on the Baggage specification:
 * https://w3c.github.io/baggage/
 */
export class HttpBaggage implements TextMapPropagator {
  inject(context: Context, carrier: unknown, setter: TextMapSetter) {
    const baggage = getBaggage(context);
    if (!baggage) return;
    const keyPairs = this._getKeyPairs(baggage)
      .filter((pair: string) => {
        return pair.length <= MAX_PER_NAME_VALUE_PAIRS;
      })
      .slice(0, MAX_NAME_VALUE_PAIRS);
    const headerValue = this._serializeKeyPairs(keyPairs);
    if (headerValue.length > 0) {
      setter.set(carrier, BAGGAGE_HEADER, headerValue);
    }
  }

  private _serializeKeyPairs(keyPairs: string[]) {
    return keyPairs.reduce((hValue: string, current: string) => {
      const value = `${hValue}${hValue != '' ? ITEMS_SEPARATOR : ''}${current}`;
      return value.length > MAX_TOTAL_LENGTH ? hValue : value;
    }, '');
  }

  private _getKeyPairs(baggage: Baggage): string[] {
    return baggage
      .getAllEntries()
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`
      );
  }

  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headerValue: string = getter.get(carrier, BAGGAGE_HEADER) as string;
    if (!headerValue) return context;
    const baggage: Record<string, BaggageEntry> = {};
    if (headerValue.length == 0) {
      return context;
    }
    const pairs = headerValue.split(ITEMS_SEPARATOR);
    pairs.forEach(entry => {
      const keyPair = this._parsePairKeyValue(entry);
      if (keyPair) {
        const entry: BaggageEntry = { value: keyPair.value };
        if (keyPair.metadata) {
          entry.metadata = keyPair.metadata;
        }
        baggage[keyPair.key] = entry;
      }
    });
    if (Object.entries(baggage).length === 0) {
      return context;
    }
    return setBaggage(context, createBaggage(baggage));
  }

  private _parsePairKeyValue(entry: string) {
    const valueProps = entry.split(PROPERTIES_SEPARATOR);
    if (valueProps.length <= 0) return;
    const keyPairPart = valueProps.shift();
    if (!keyPairPart) return;
    const keyPair = keyPairPart.split(KEY_PAIR_SEPARATOR);
    if (keyPair.length != 2) return;
    const key = decodeURIComponent(keyPair[0].trim());
    const value = decodeURIComponent(keyPair[1].trim());
    let metadata;
    if (valueProps.length > 0) {
      metadata = baggageEntryMetadataFromString(
        valueProps.join(PROPERTIES_SEPARATOR)
      );
    }
    return { key, value, metadata };
  }

  fields(): string[] {
    return [BAGGAGE_HEADER];
  }
}
