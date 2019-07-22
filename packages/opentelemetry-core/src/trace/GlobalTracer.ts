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

const noopTracer = new NoopTracer();
let _globalTracer: types.Tracer | null = null;

/* tslint:disable:no-any */
export class GlobalTracerDelegate implements types.Tracer {
  getCurrentSpan(): types.Span {
    const tracer = _globalTracer || noopTracer;
    // tslint:disable-next-line:no-any
    return tracer.getCurrentSpan.apply(tracer, arguments as any);
  }

  startSpan(name: string, options?: types.SpanOptions | undefined): types.Span {
    const tracer = _globalTracer || noopTracer;
    // tslint:disable-next-line:no-any
    return tracer.startSpan.apply(tracer, arguments as any);
  }

  withSpan<T extends (...args: unknown[]) => unknown>(
    span: types.Span,
    fn: T
  ): ReturnType<T> {
    const tracer = _globalTracer || noopTracer;
    // tslint:disable-next-line:no-any
    return tracer.withSpan.apply(tracer, arguments as any) as ReturnType<T>;
  }

  recordSpanData(span: types.Span): void {
    const tracer = _globalTracer || noopTracer;
    // tslint:disable-next-line:no-any
    return tracer.recordSpanData.apply(tracer, arguments as any);
  }

  getBinaryFormat(): unknown {
    const tracer = _globalTracer || noopTracer;
    // tslint:disable-next-line:no-any
    return tracer.getBinaryFormat.apply(tracer, arguments as any);
  }

  getHttpTextFormat(): unknown {
    const tracer = _globalTracer || noopTracer;
    // tslint:disable-next-line:no-any
    return tracer.getHttpTextFormat.apply(tracer, arguments as any);
  }
}

const globalTracerDelegate = new GlobalTracerDelegate();

/**
 * Set the current global tracer
 */
export function initGlobalTracer(tracer: types.Tracer): types.Tracer {
  return (_globalTracer = tracer);
}

/**
 * Returns the global tracer
 */
export function getTracer(): types.Tracer {
  // Return the global tracer delegate
  return globalTracerDelegate;
}
