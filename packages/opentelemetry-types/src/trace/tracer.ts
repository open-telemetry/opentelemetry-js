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

import { HttpTextFormat } from '../context/propagation/HttpTextFormat';
import { Span } from './span';
import { SpanOptions } from './SpanOptions';
import { BinaryFormat } from '../context/propagation/BinaryFormat';

/**
 * Tracer provides an interface for creating {@link Span}s and propagating
 * context in-process.
 *
 * Users may choose to use manual or automatic Context propagation. Because of
 * that this class offers APIs to facilitate both usages.
 */
export interface Tracer {
  /**
   * Returns the current Span from the current context if available.
   *
   * If there is no Span associated with the current context, a default Span
   * with invalid SpanContext is returned.
   *
   * @returns Span The currently active Span
   */
  getCurrentSpan(): Span;

  /**
   * Starts a new {@link Span}.
   * @param name The name of the span
   * @param [options] SpanOptions used for span creation
   * @returns Span The newly created span
   */
  startSpan(name: string, options?: SpanOptions): Span;

  /**
   * Executes the function given by fn within the context provided by Span
   *
   * @param span The span that provides the context
   * @param fn The function to be eexcuted inside the provided context
   */
  withSpan<T extends (...args: unknown[]) => unknown>(
    span: Span,
    fn: T
  ): ReturnType<T>;

  /**
   * Send a pre-populated span object to the exporter.
   * Sampling and recording decisions as well as other collection optimizations
   * are the responsibility of a caller.
   *
   * @todo: Pending API discussion. Revisit if Span or SpanData should be passed
   *        in here once this is sorted out.
   * @param span Span Data to be reported to all exporters.
   */
  recordSpanData(span: Span): void;

  /**
   * Returns the {@link BinaryFormat} interface which can serialize/deserialize
   * Spans.
   *
   * If no tracer implementation is provided, this defaults to the W3C Trace
   * Context binary format ({@link BinaryFormat}). For more details see
   * <a href="https://w3c.github.io/trace-context-binary/">W3C Trace Context
   * binary protocol</a>.
   */
  getBinaryFormat(): BinaryFormat;

  /**
   * Returns the {@link HttpTextFormat} interface which can inject/extract
   * Spans.
   *
   * If no tracer implementation is provided, this defaults to the W3C Trace
   * Context HTTP text format ({@link HttpTraceContext}). For more details see
   * <a href="https://w3c.github.io/trace-context/">W3C Trace Context</a>.
   */
  getHttpTextFormat(): HttpTextFormat;
}
