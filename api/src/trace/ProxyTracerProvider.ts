/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tracer } from './tracer';
import { TracerProvider } from './tracer_provider';
import { ProxyTracer } from './ProxyTracer';
import { NoopTracerProvider } from './NoopTracerProvider';
import { TracerOptions } from './tracer_options';

const NOOP_TRACER_PROVIDER = new NoopTracerProvider();

/**
 * Tracer provider which provides {@link ProxyTracer}s.
 *
 * Before a delegate is set, tracers provided are NoOp.
 *   When a delegate is set, traces are provided from the delegate.
 *   When a delegate is set after tracers have already been provided,
 *   all tracers already provided will use the provided delegate implementation.
 *
 * @deprecated This will be removed in the next major version.
 * @since 1.0.0
 */
export class ProxyTracerProvider implements TracerProvider {
  private _delegate?: TracerProvider;

  /**
   * Get a {@link ProxyTracer}
   */
  getTracer(name: string, version?: string, options?: TracerOptions): Tracer {
    return (
      this.getDelegateTracer(name, version, options) ??
      new ProxyTracer(this, name, version, options)
    );
  }

  getDelegate(): TracerProvider {
    return this._delegate ?? NOOP_TRACER_PROVIDER;
  }

  /**
   * Set the delegate tracer provider
   */
  setDelegate(delegate: TracerProvider) {
    this._delegate = delegate;
  }

  getDelegateTracer(
    name: string,
    version?: string,
    options?: TracerOptions
  ): Tracer | undefined {
    return this._delegate?.getTracer(name, version, options);
  }
}
