/*!
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
// sometimes nearly intractable initialization order problems that can arise in
// applications with a complex set of dependencies. Also allows for the tracer
// to be changed/disabled during runtime without needing to change reference
// to the global tracer
export class TracerDelegate implements types.Tracer {
  private _currentTracer: types.Tracer;

  // Wrap a tracer with a TracerDelegate. Provided tracer becomes the default
  // fallback tracer for when a global tracer has not been initialized
  constructor(
    private readonly tracer: types.Tracer | null = null,
    private readonly fallbackTracer: types.Tracer = new NoopTracer()
  ) {
    this._currentTracer = tracer || fallbackTracer; // equivalent to this.start()
  }

  // Begin using the user provided tracer. Stop always falling back to fallback tracer
  start(): void {
    this._currentTracer = this.tracer || this.fallbackTracer;
  }

  // Stop the delegate from using the provided tracer. Begin to use the fallback tracer
  stop(): void {
    this._currentTracer = this.fallbackTracer;
  }

  // -- Tracer interface implementation below -- //

  getCurrentSpan(): types.Span | null {
    return this._currentTracer.getCurrentSpan.apply(
      this._currentTracer,
      // tslint:disable-next-line:no-any
      arguments as any
    );
  }

  bind<T>(target: T, span?: types.Span): T {
    return (this._currentTracer.bind.apply(
      this._currentTracer,
      // tslint:disable-next-line:no-any
      arguments as any
    ) as unknown) as T;
  }

  startSpan(name: string, options?: types.SpanOptions): types.Span {
    return this._currentTracer.startSpan.apply(
      this._currentTracer,
      // tslint:disable-next-line:no-any
      arguments as any
    );
  }

  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(
    span: types.Span,
    fn: T
  ): ReturnType<T> {
    return this._currentTracer.withSpan.apply(
      this._currentTracer,
      // tslint:disable-next-line:no-any
      arguments as any
    );
  }

  recordSpanData(span: types.Span): void {
    return this._currentTracer.recordSpanData.apply(
      this._currentTracer,
      // tslint:disable-next-line:no-any
      arguments as any
    );
  }

  getBinaryFormat(): types.BinaryFormat {
    return this._currentTracer.getBinaryFormat.apply(
      this._currentTracer,
      // tslint:disable-next-line:no-any
      arguments as any
    );
  }

  getHttpTextFormat(): types.HttpTextFormat {
    return this._currentTracer.getHttpTextFormat.apply(
      this._currentTracer,
      // tslint:disable-next-line:no-any
      arguments as any
    );
  }
}
