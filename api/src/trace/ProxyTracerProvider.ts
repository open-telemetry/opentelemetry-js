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
