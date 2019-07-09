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

import { Span } from './span';
import { Attributes } from './attributes';
import { SpanKind } from './span_kind';
import { SpanContext } from './span_context';

/**
 * Options needed for span creation
 *
 * @todo: Move into module of its own
 */
export interface SpanOptions {
  /**
   * The SpanKind of a span
   */
  kind?: SpanKind;

  /**
   * A spans attributes
   */
  attributes?: Attributes;

  /**
   * Indicates that events are being recorded for a span
   */
  isRecordingEvents?: boolean;

  /**
   * The parent span
   */
  parent?: Span | SpanContext;

  /**
   * The start timestamp of a span
   */
  startTime?: number;
}

/**
 * Tracer provides an interface for creating spans and propagating context in-process.
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
   *
   * @param name The name of the span
   * @param [options] SpanOptions used for span creation
   * @returns Span The newly created span
   */
  start(name: string, options?: SpanOptions): Span;

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
   * @param span
   */
  recordSpanData(span: Span): void;

  /**
   * Returns the binary format interface which can serialize/deserialize Spans.
   * @todo: Change return type once BinaryFormat is available
   */
  getBinaryFormat(): unknown;

  /**
   * Returns the HTTP text format interface which can inject/extract Spans.
   *
   * @todo: Change return type once HttpTextFormat is available
   */
  getHttpTextFormat: unknown;
}
