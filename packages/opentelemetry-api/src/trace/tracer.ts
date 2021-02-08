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

import { Context } from '@opentelemetry/context-base';
import { Span } from './span';
import { SpanOptions } from './SpanOptions';

/**
 * Tracer provides an interface for creating {@link Span}s.
 */
export interface Tracer {
  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   *
   * This method do NOT modify the current Context.
   *
   * @param name The name of the span
   * @param [options] SpanOptions used for span creation
   * @param [context] Context to use to extract parent
   * @returns Span The newly created span
   * @example
   *     const span = tracer.startSpan('op');
   *     span.setAttribute('key', 'value');
   *     span.end();
   */
  startSpan(name: string, options?: SpanOptions, context?: Context): Span;
}
