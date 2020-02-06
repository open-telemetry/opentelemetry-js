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

import { Span, SpanContext } from '@opentelemetry/api';
import { Context as ContextBase } from '@opentelemetry/scope-base';

/**
 * Context class with static helper functions for accessing values
 * of cross-cutting concerns.
 */
export class Context extends ContextBase {
  /**
   * Return the active span if one exists
   *
   * @param context context to get span from
   */
  static getActiveSpan(context: Context): Span | undefined {
    return (context.getValue('ACTIVE_SPAN') as Span) || undefined;
  }

  /**
   * Set the active span on a context
   *
   * @param context context to use as parent
   * @param span span to set active
   */
  static setActiveSpan(context: Context, span: Span): Context {
    return context.setValue('ACTIVE_SPAN', span);
  }

  /**
   * Get the extracted span context from a context
   *
   * @param context context to get span context from
   */
  static getExtractedSpanContext(context: Context): SpanContext | undefined {
    return (
      (context.getValue('EXTRACTED_SPAN_CONTEXT') as SpanContext) || undefined
    );
  }

  /**
   * Set the extracted span context on a context
   *
   * @param context context to set span context on
   * @param spanContext span context to set
   */
  static setExtractedSpanContext(
    context: Context,
    spanContext: SpanContext
  ): Context {
    return context.setValue('EXTRACTED_SPAN_CONTEXT', spanContext);
  }

  /**
   * Get the span context of the parent span if it exists,
   * or the extracted span context if there is no active
   * span.
   *
   * @param context context to get values from
   */
  static getParentSpanContext(context: Context) {
    return (
      Context.getActiveSpan(context)?.context() ||
      Context.getExtractedSpanContext(context)
    );
  }
}
