/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  BaggageEntry,
  Context,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
} from '@opentelemetry/api';
import { propagation } from '@opentelemetry/api';

import { isTracingSuppressed } from '../../trace/suppress-tracing';
import {
  BAGGAGE_HEADER,
  BAGGAGE_MAX_NAME_VALUE_PAIRS,
  BAGGAGE_MAX_PER_NAME_VALUE_PAIRS,
} from '../constants';
import {
  getKeyPairs,
  parseBaggageHeaderString,
  serializeKeyPairs,
} from '../utils';

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
    if (!headerValue) {
      return context;
    }

    const baggage: Record<string, BaggageEntry> = {};
    let count = 0;

    let totalSize = 0;
    if (Array.isArray(headerValue)) {
      for (let i = 0; i < headerValue.length; i++) {
        [count, totalSize] = parseBaggageHeaderString(
          headerValue[i],
          baggage,
          count,
          totalSize
        );
      }
    } else {
      [count] = parseBaggageHeaderString(
        headerValue,
        baggage,
        count,
        totalSize
      );
    }

    if (count === 0) {
      return context;
    }

    return propagation.setBaggage(context, propagation.createBaggage(baggage));
  }

  fields(): string[] {
    return [BAGGAGE_HEADER];
  }
}
