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
  startSpan(name: string, options: SpanOptions): Span;

  /**
   * Wraps a function with the scope provided by span and returns the wrapped
   * function.
   *
   * @param span The span in which context the function will be executed
   * @param operation The name of the function to be executed
   * @param fn The function that represents that operation
   */
  withSpan<T>(span: Span, operation: string, fn: Func<T>): Func<T>;

  /**
   * Send a pre-populated span object to the exporter.
   * Sampling and recording decisions as well as other collection optimizations
   * are the responsibility of a caller.
   *
   * @param span
   */
  recordSpanData(span: Span): any;

  /**
   *
   */
  getBinaryFormat(): any;

  /**
   *
   */
  getHttpTextFormat: any;
};
