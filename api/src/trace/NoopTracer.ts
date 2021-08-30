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

import { ContextAPI } from '../api/context';
import { Context } from '../context/types';
import { getSpanContext, setSpan } from '../trace/context-utils';
import { NonRecordingSpan } from './NonRecordingSpan';
import { Span } from './span';
import { isSpanContextValid } from './spancontext-utils';
import { SpanOptions } from './SpanOptions';
import { SpanContext } from './span_context';
import { Tracer } from './tracer';

const context = ContextAPI.getInstance();

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
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    opts: SpanOptions | undefined,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    opts: SpanOptions | undefined,
    ctx: Context | undefined,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    arg2?: F | SpanOptions,
    arg3?: F | Context,
    arg4?: F
  ): ReturnType<F> | undefined {
    let opts: SpanOptions | undefined;
    let ctx: Context | undefined;
    let fn: F;

    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn = arg2 as F;
    } else if (arguments.length === 3) {
      opts = arg2 as SpanOptions | undefined;
      fn = arg3 as F;
    } else {
      opts = arg2 as SpanOptions | undefined;
      ctx = arg3 as Context | undefined;
      fn = arg4 as F;
    }

    const parentContext = ctx ?? context.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = setSpan(parentContext, span);

    return context.with(contextWithSpanSet, fn, undefined, span);
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
