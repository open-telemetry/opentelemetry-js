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

import { Tracer, SpanOptions, Span, Propagator } from '@opentelemetry/types';
import { NOOP_HTTP_TEXT_FORMAT } from '../context/propagation/NoopHttpTextFormat';
import { NOOP_BINARY_FORMAT } from '../context/propagation/NoopBinaryFormat';
import { NoopSpan } from './NoopSpan';

export const NOOP_SPAN = new NoopSpan({ traceId: '', spanId: '' });

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

  // @todo
  withSpan<T extends (...args: unknown[]) => unknown>(
    span: Span,
    fn: T
  ): ReturnType<T> {
    throw new Error('Method not implemented.');
  }

  // By default does nothing
  recordSpanData(span: Span): void {}

  getBinaryFormat(): unknown {
    return NOOP_BINARY_FORMAT;
  }

  getHttpTextFormat(): Propagator {
    return NOOP_HTTP_TEXT_FORMAT;
  }
}
