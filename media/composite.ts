/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Context,
  TextMapGetter,
  TextMapPropagator,
  diag,
  TextMapSetter,
} from '@opentelemetry/api';

/** Configuration object for composite propagator */
export interface CompositePropagatorConfig {
  /**
   * List of propagators to run. Propagators run in the
   * list order. If a propagator later in the list writes the same context
   * key as a propagator earlier in the list, the later on will "win".
   */
  propagators?: TextMapPropagator[];
}

/** Combines multiple propagators into a single propagator. */
export class CompositePropagator implements TextMapPropagator {
  private readonly _propagators: TextMapPropagator[];
  private readonly _fields: string[];

  /**
   * Construct a composite propagator from a list of propagators.
   *
   * @param [config] Configuration object for composite propagator
   */
  constructor(config: CompositePropagatorConfig = {}) {
    this._propagators = config.propagators ?? [];

    this._fields = Array.from(
      new Set(
        this._propagators
          // older propagators may not have fields function, null check to be sure
          .map(p => (typeof p.fields === 'function' ? p.fields() : []))
          .reduce((x, y) => x.concat(y), [])
      )
    );
  }

  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same carrier key, the propagator later in the list
   * will "win".
   *
   * @param context Context to inject
   * @param carrier Carrier into which context will be injected
   */
  inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
    for (const propagator of this._propagators) {
      try {
        propagator.inject(context, carrier, setter);
      } catch (err) {
        diag.warn(
          `Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`
        );
      }
    }
  }

  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same context key, the propagator later in the list
   * will "win".
   *
   * @param context Context to add values to
   * @param carrier Carrier from which to extract context
   */
  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    return this._propagators.reduce((ctx, propagator) => {
      try {
        return propagator.extract(ctx, carrier, getter);
      } catch (err) {
        diag.warn(
          `Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`
        );
      }
      return ctx;
    }, context);
  }

  fields(): string[] {
    // return a new array so our fields cannot be modified
    return this._fields.slice();
  }
}
