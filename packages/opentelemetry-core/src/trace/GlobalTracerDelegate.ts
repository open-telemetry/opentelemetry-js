/**
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';
import { NoopTracer } from './NoopTracer';

// Acts a bridge to the global tracer that can be safely called before the
// global tracer is initialized. The purpose of the delegation is to avoid the
// sometimes nearly intractible initialization order problems that can arise in
// applications with a complex set of dependencies. Also allows for the tracer
// to be changed/disabled during runtime without needing to change reference
// to the global tracer
export class GlobalTracerDelegate implements types.Tracer {
  private _tracer: types.Tracer | null;
  private readonly _fallbackTracer: types.Tracer;

  // Wrap a tracer with a GlobalTracerDelegate. Provided tracer becomes the default
  // fallback tracer for when a global tracer has not been initialized
  constructor(fallbackTracer?: types.Tracer) {
    this._tracer = null;
    this._fallbackTracer = fallbackTracer || new NoopTracer();
  }

  set tracer(tracer: types.Tracer | null) {
    this._tracer = tracer;
  }

  getCurrentSpan(): types.Span {
    const tracer = this._tracer || this._fallbackTracer;
    // tslint:disable-next-line:no-any
    return tracer.getCurrentSpan.apply(tracer, arguments as any);
  }

  startSpan(name: string, options?: types.SpanOptions | undefined): types.Span {
    const tracer = this._tracer || this._fallbackTracer;
    // tslint:disable-next-line:no-any
    return tracer.startSpan.apply(tracer, arguments as any);
  }

  withSpan<T extends (...args: unknown[]) => unknown>(
    span: types.Span,
    fn: T
  ): ReturnType<T> {
    const tracer = this._tracer || this._fallbackTracer;
    // tslint:disable-next-line:no-any
    return tracer.withSpan.apply(tracer, arguments as any) as ReturnType<T>;
  }

  recordSpanData(span: types.Span): void {
    const tracer = this._tracer || this._fallbackTracer;
    // tslint:disable-next-line:no-any
    return tracer.recordSpanData.apply(tracer, arguments as any);
  }

  getBinaryFormat(): types.BinaryFormat {
    const tracer = this._tracer || this._fallbackTracer;
    // tslint:disable-next-line:no-any
    return tracer.getBinaryFormat.apply(tracer, arguments as any);
  }

  getHttpTextFormat(): types.HttpTextFormat {
    const tracer = this._tracer || this._fallbackTracer;
    // tslint:disable-next-line:no-any
    return tracer.getHttpTextFormat.apply(tracer, arguments as any);
  }
}
