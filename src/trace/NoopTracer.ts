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

import { Span, SpanOptions, Tracer, SpanContext } from '..';
import { Context } from '@opentelemetry/context-base';
import { NoopSpan, NOOP_SPAN } from './NoopSpan';
import { isSpanContextValid } from './spancontext-utils';
import { getActiveSpan } from '../context/context';

/**
 * No-op implementations of {@link Tracer}.
 */
export class NoopTracer implements Tracer {
  getCurrentSpan(): Span {
    return NOOP_SPAN;
  }

  // startSpan starts a noop span.
  startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    const parent = options?.parent;
    const parentFromContext = context && getActiveSpan(context)?.context();
    if (isSpanContext(parent) && isSpanContextValid(parent)) {
      return new NoopSpan(parent);
    } else if (
      isSpanContext(parentFromContext) &&
      isSpanContextValid(parentFromContext)
    ) {
      return new NoopSpan(parentFromContext);
    } else {
      return NOOP_SPAN;
    }
  }

  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(
    span: Span,
    fn: T
  ): ReturnType<T> {
    return fn();
  }

  bind<T>(target: T, _span?: Span): T {
    return target;
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
