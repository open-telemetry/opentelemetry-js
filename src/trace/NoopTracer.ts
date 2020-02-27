/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { HttpTextFormat, Span, SpanOptions, Tracer } from '..';
import { NOOP_HTTP_TEXT_FORMAT } from '../context/propagation/NoopHttpTextFormat';
import { NOOP_SPAN } from './NoopSpan';

/**
 * No-op implementations of {@link Tracer}.
 */
export class NoopTracer implements Tracer {
  getCurrentSpan(): Span {
    return NOOP_SPAN;
  }

  // startSpan starts a noop span.
  startSpan(name: string, options?: SpanOptions): Span {
    return NOOP_SPAN;
  }

  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(
    span: Span,
    fn: T
  ): ReturnType<T> {
    return fn();
  }

  bind<T>(target: T, span?: Span): T {
    return target;
  }

  // By default does nothing
  getHttpTextFormat(): HttpTextFormat {
    return NOOP_HTTP_TEXT_FORMAT;
  }
}

export const NOOP_TRACER = new NoopTracer();
