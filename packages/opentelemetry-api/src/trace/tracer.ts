/*!
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

import { Context } from '@opentelemetry/scope-base';
import { Span } from './span';
import { SpanOptions } from './SpanOptions';

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
   * If there is no Span associated with the current context, null is returned.
   *
   * @returns Span The currently active Span
   */
  getCurrentSpan(): Span | undefined;

  /**
   * Starts a new {@link Span}.
   * @param name The name of the span
   * @param [options] SpanOptions used for span creation
   * @param [context] Context to use to extract parent
   * @returns Span The newly created span
   */
  startSpan(name: string, options?: SpanOptions, context?: Context): Span;

  /**
   * Executes the function given by fn within the context provided by Span
   *
   * @param span The span that provides the context
   * @param fn The function to be executed inside the provided context
   * @example
   * tracer.withSpan(span, function() { ... });
   */
  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(
    span: Span,
    fn: T
  ): ReturnType<T>;

  /**
   * Bind a span as the target's scope or propagate the current one.
   *
   * @param target Any object to which a scope need to be set
   * @param [context] Optionally specify the context which you want to bind
   */
  bind<T>(target: T, context?: Span): T;
}
