/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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

const contextApi = ContextAPI.getInstance();

/**
 * No-op implementations of {@link Tracer}.
 */
export class NoopTracer implements Tracer {
  // startSpan starts a noop span.
  startSpan(
    name: string,
    options?: SpanOptions,
    context = contextApi.active()
  ): Span {
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

    const parentContext = ctx ?? contextApi.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = setSpan(parentContext, span);

    return contextApi.with(contextWithSpanSet, fn, undefined, span);
  }
}

function isSpanContext(spanContext: unknown): spanContext is SpanContext {
  return (
    spanContext !== null &&
    typeof spanContext === 'object' &&
    'spanId' in spanContext &&
    typeof spanContext['spanId'] === 'string' &&
    'traceId' in spanContext &&
    typeof spanContext['traceId'] === 'string' &&
    'traceFlags' in spanContext &&
    typeof spanContext['traceFlags'] === 'number'
  );
}
