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
import { SpanContext } from './span_context';

/**
 * @todo: Move into module with commonly used types
 */
export type Func<T> = (...args: any[]) => T;

/**
 * Options needed for span creation
 *
 * @todo: Move into module of its own
 */
export type SpanOptions = {
  attributes: Attributes[],
};

export interface Tracer {

  /**
   * Returns the current Span from the current context if available.
   *
   * If there is no Span associated with the current context, a default Span
   * with invalid SpanContext is returned.
   *
   * @returns Span
   */
  getCurrentSpan(): Span;

  /**
   *
   * @param name
   * @param options
   */
  start(name: string, options: SpanOptions): Span;

  /**
   * Executes the function given by fn within the context provided by Span
   * <pre>{@code
   * 	tracer.withSpan(span, "myOperation", () => {
	 *	  console.log(bar("HelloWorld"));
	 *  });
   * }</pre>
   * @param span The span that provides the context
   * @param operation The name of the function
   * @param fn The function to be eexcuted inside the provided context
   */
  withSpan<T extends (...args: unknown[]) => unknown>(span: Span, operation: string, fn: T): ReturnType<T>;

  /**
   * Send a pre-populated span object to the exporter.
   * Sampling and recording decisions as well as other collection optimizations
   * are the responsibility of a caller.
   *
   * @param span
   */
  recordSpanData(span: Span): any;

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
  getHttpTextFormat: any;
};
