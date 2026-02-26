/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as oc from '@opencensus/core';

import {
  context,
  propagation,
  trace,
  TextMapGetter,
  TextMapSetter,
} from '@opentelemetry/api';
import { mapSpanContext, reverseMapSpanContext } from './trace-transform';

class Getter implements TextMapGetter<void> {
  private ocGetter: oc.HeaderGetter;

  constructor(ocGetter: oc.HeaderGetter) {
    this.ocGetter = ocGetter;
  }
  keys(): string[] {
    return [];
  }
  get(carrier: void, key: string) {
    return this.ocGetter.getHeader(key);
  }
}

class Setter implements TextMapSetter<void> {
  private ocSetter: oc.HeaderSetter;

  constructor(ocSetter: oc.HeaderSetter) {
    this.ocSetter = ocSetter;
  }

  set(carrier: void, key: string, value: string): void {
    this.ocSetter.setHeader(key, value);
  }
}

/**
 * Bridges OpenTelemetry propagation API into OpenCensus. The global OTel propagator is called
 * to implement the OpenCensus propagation API.
 */
export const shimPropagation: oc.Propagation = {
  extract(getter: oc.HeaderGetter): oc.SpanContext | null {
    const extracted = propagation.extract(
      context.active(),
      null,
      new Getter(getter)
    );

    const otelSc = trace.getSpanContext(extracted);
    return otelSc ? reverseMapSpanContext(otelSc) : null;
  },

  inject(setter: oc.HeaderSetter, spanContext: oc.SpanContext): void {
    const ctx = trace.setSpanContext(
      context.active(),
      mapSpanContext(spanContext)
    );
    propagation.inject(ctx, null, new Setter(setter));
  },

  generate(): oc.SpanContext {
    // Reading OpenCensus code, it looks like this should generate a new random span context.
    // However, it doesn't appear to be used based on my testing. Options for implementing:
    //
    //   - Return the invalid span context
    //   - Use the OTel ID generator, however this package should be an API-only bridge
    //   - Copy implementation from OpenCensus noop-propagation.ts
    throw new Error('shimPropagation.generate() is not yet implemented');
  },
};
