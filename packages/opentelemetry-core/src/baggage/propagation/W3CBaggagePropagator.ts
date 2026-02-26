/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaggageEntry,
  Context,
  propagation,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
} from '@opentelemetry/api';

import { isTracingSuppressed } from '../../trace/suppress-tracing';
import {
  BAGGAGE_HEADER,
  BAGGAGE_ITEMS_SEPARATOR,
  BAGGAGE_MAX_NAME_VALUE_PAIRS,
  BAGGAGE_MAX_PER_NAME_VALUE_PAIRS,
} from '../constants';
import { getKeyPairs, parsePairKeyValue, serializeKeyPairs } from '../utils';

/**
 * Propagates {@link Baggage} through Context format propagation.
 *
 * Based on the Baggage specification:
 * https://w3c.github.io/baggage/
 */
export class W3CBaggagePropagator implements TextMapPropagator {
  inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
    const baggage = propagation.getBaggage(context);
    if (!baggage || isTracingSuppressed(context)) return;
    const keyPairs = getKeyPairs(baggage)
      .filter((pair: string) => {
        return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
      })
      .slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
    const headerValue = serializeKeyPairs(keyPairs);
    if (headerValue.length > 0) {
      setter.set(carrier, BAGGAGE_HEADER, headerValue);
    }
  }

  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headerValue = getter.get(carrier, BAGGAGE_HEADER);
    const baggageString = Array.isArray(headerValue)
      ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR)
      : headerValue;
    if (!baggageString) return context;
    const baggage: Record<string, BaggageEntry> = {};
    if (baggageString.length === 0) {
      return context;
    }
    const pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR);
    pairs.forEach(entry => {
      const keyPair = parsePairKeyValue(entry);
      if (keyPair) {
        const baggageEntry: BaggageEntry = { value: keyPair.value };
        if (keyPair.metadata) {
          baggageEntry.metadata = keyPair.metadata;
        }
        baggage[keyPair.key] = baggageEntry;
      }
    });
    if (Object.entries(baggage).length === 0) {
      return context;
    }
    return propagation.setBaggage(context, propagation.createBaggage(baggage));
  }

  fields(): string[] {
    return [BAGGAGE_HEADER];
  }
}
