/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Context,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
} from '@opentelemetry/api';
import { isTracingSuppressed } from '@opentelemetry/core';
import { B3MultiPropagator } from './B3MultiPropagator';
import { B3SinglePropagator } from './B3SinglePropagator';
import { B3_CONTEXT_HEADER } from './constants';
import { B3InjectEncoding, B3PropagatorConfig } from './types';

/**
 * Propagator that extracts B3 context in both single and multi-header variants,
 * with configurable injection format defaulting to B3 single-header. Due to
 * the asymmetry in injection and extraction formats this is not suitable to
 * be implemented as a composite propagator.
 * Based on: https://github.com/openzipkin/b3-propagation
 */
export class B3Propagator implements TextMapPropagator {
  private readonly _b3MultiPropagator: B3MultiPropagator =
    new B3MultiPropagator();
  private readonly _b3SinglePropagator: B3SinglePropagator =
    new B3SinglePropagator();
  private readonly _inject: (
    context: Context,
    carrier: unknown,
    setter: TextMapSetter
  ) => void;
  public readonly _fields: string[];

  constructor(config: B3PropagatorConfig = {}) {
    if (config.injectEncoding === B3InjectEncoding.MULTI_HEADER) {
      this._inject = this._b3MultiPropagator.inject;
      this._fields = this._b3MultiPropagator.fields();
    } else {
      this._inject = this._b3SinglePropagator.inject;
      this._fields = this._b3SinglePropagator.fields();
    }
  }

  inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
    if (isTracingSuppressed(context)) {
      return;
    }
    this._inject(context, carrier, setter);
  }

  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const header = getter.get(carrier, B3_CONTEXT_HEADER);
    const b3Context = Array.isArray(header) ? header[0] : header;

    if (b3Context) {
      return this._b3SinglePropagator.extract(context, carrier, getter);
    } else {
      return this._b3MultiPropagator.extract(context, carrier, getter);
    }
  }

  fields(): string[] {
    return this._fields;
  }
}
