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

import { context } from '../';
import { Context } from '../context/types';
import { getSpanContext, setSpan } from '../trace/context-utils';
import { NonRecordingSpan } from './NonRecordingSpan';
import { Span } from './span';
import { isSpanContextValid } from './spancontext-utils';
import { SpanOptions } from './SpanOptions';
import { SpanContext } from './span_context';
import { Tracer } from './tracer';

/**
 * No-op implementations of {@link Tracer}.
 */
export class NoopTracer implements Tracer {
  // startSpan starts a noop span.
  startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    const root = Boolean(options?.root);
    if (root) {
      return new NonRecordingSpan();
    }

    const parentFromContext = context && getSpanContext(context);

    if (
      isSpanContext(parentFromContext) &&
      isSpanContextValid(parentFromContext)
    ) {
      return new NonRecordingSpan(parentFromContext);
    } else {
      return new NonRecordingSpan();
    }
  }

  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    arg2: F | SpanOptions,
    arg3?: F | Context,
    arg4?: F
  ): ReturnType<F> | undefined {
    let fn: F | undefined,
      options: SpanOptions | undefined,
      activeContext: Context | undefined;
    if (arguments.length === 2 && typeof arg2 === 'function') {
      fn = arg2;
    } else if (
      arguments.length === 3 &&
      typeof arg2 === 'object' &&
      typeof arg3 === 'function'
    ) {
      options = arg2;
      fn = arg3;
    } else if (
      arguments.length === 4 &&
      typeof arg2 === 'object' &&
      typeof arg3 === 'object' &&
      typeof arg4 === 'function'
    ) {
      options = arg2;
      activeContext = arg3;
      fn = arg4;
    }

    const parentContext = activeContext ?? context.active();
    const span = this.startSpan(name, options, parentContext);
    const contextWithSpanSet = setSpan(parentContext, span);

    if (fn) {
      return context.with(contextWithSpanSet, fn, undefined, span);
    }
    return;
  }
}

function isSpanContext(spanContext: any): spanContext is SpanContext {
  return (
    typeof spanContext === 'object' &&
    typeof spanContext['spanId'] === 'string' &&
    typeof spanContext['traceId'] === 'string' &&
    typeof spanContext['traceFlags'] === 'number'
  );
}

export const NOOP_TRACER = new NoopTracer();
