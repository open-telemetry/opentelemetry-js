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
export class TracerDelegate implements types.Tracer {
  private readonly _tracer: types.Tracer;

  // Wrap a tracer with a TracerDelegate. Provided tracer becomes the default
  // fallback tracer for when a global tracer has not been initialized
  constructor(tracer?: types.Tracer | null, fallbackTracer?: types.Tracer) {
    this._tracer = tracer || fallbackTracer || new NoopTracer();
  }

  getCurrentSpan(): types.Span {
    // tslint:disable-next-line:no-any
    return this._tracer.getCurrentSpan.apply(this._tracer, arguments as any);
  }

  startSpan(name: string, options?: types.SpanOptions | undefined): types.Span {
    // tslint:disable-next-line:no-any
    return this._tracer.startSpan.apply(this._tracer, arguments as any);
  }

  withSpan<T extends (...args: unknown[]) => unknown>(
    span: types.Span,
    fn: T
  ): ReturnType<T> {
    // tslint:disable-next-line:no-any
    return this._tracer.withSpan.apply(
      this._tracer,
      arguments as any
    ) as ReturnType<T>;
  }

  recordSpanData(span: types.Span): void {
    // tslint:disable-next-line:no-any
    return this._tracer.recordSpanData.apply(this._tracer, arguments as any);
  }

  getBinaryFormat(): types.BinaryFormat {
    // tslint:disable-next-line:no-any
    return this._tracer.getBinaryFormat.apply(this._tracer, arguments as any);
  }

  getHttpTextFormat(): types.HttpTextFormat {
    // tslint:disable-next-line:no-any
    return this._tracer.getHttpTextFormat.apply(this._tracer, arguments as any);
  }
}
