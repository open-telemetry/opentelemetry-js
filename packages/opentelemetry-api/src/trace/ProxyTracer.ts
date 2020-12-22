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

import { Span, SpanOptions, Tracer } from '..';
import { NOOP_TRACER } from './NoopTracer';
import { ProxyTracerProvider } from './ProxyTracerProvider';

/**
 * Proxy tracer provided by the proxy tracer provider
 */
export class ProxyTracer implements Tracer {
  // When a real implementation is provided, this will be it
  private _delegate?: Tracer;

  constructor(
    private _provider: ProxyTracerProvider,
    public readonly name: string,
    public readonly version?: string
  ) {}

  startSpan(name: string, options?: SpanOptions): Span {
    return this._getTracer().startSpan(name, options);
  }

  /**
   * Try to get a tracer from the proxy tracer provider.
   * If the proxy tracer provider has no delegate, return a noop tracer.
   */
  private _getTracer() {
    if (this._delegate) {
      return this._delegate;
    }

    const tracer = this._provider.getDelegateTracer(this.name, this.version);

    if (!tracer) {
      return NOOP_TRACER;
    }

    this._delegate = tracer;
    return this._delegate;
  }
}
