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

import { Context, createContextKey } from '@opentelemetry/context-base';
import { Baggage, NoopSpan, Span, SpanContext } from '../';

/**
 * Active span key
 */
const ACTIVE_SPAN_KEY = createContextKey(
  'OpenTelemetry Context Key ACTIVE_SPAN'
);

/**
 * Shared key for indicating if instrumentation should be suppressed beyond
 * this current scope.
 */
const SUPPRESS_INSTRUMENTATION_KEY = createContextKey(
  'OpenTelemetry Context Key SUPPRESS_INSTRUMENTATION'
);

/**
 * Baggage key
 */
const BAGGAGE_KEY = createContextKey('OpenTelemetry Baggage Key');

/**
 * Return the active span if one exists
 *
 * @param context context to get span from
 */
export function getActiveSpan(context: Context): Span | undefined {
  return (context.getValue(ACTIVE_SPAN_KEY) as Span) || undefined;
}

/**
 * Set the active span on a context
 *
 * @param context context to use as parent
 * @param span span to set active
 */
export function setActiveSpan(context: Context, span: Span): Context {
  return context.setValue(ACTIVE_SPAN_KEY, span);
}

/**
 * Wrap extracted span context in a NoopSpan and set as active span in a new
 * context
 *
 * @param context context to set active span on
 * @param spanContext span context to be wrapped
 */
export function setExtractedSpanContext(
  context: Context,
  spanContext: SpanContext
): Context {
  return setActiveSpan(context, new NoopSpan(spanContext));
}

/**
 * Get the span context of the parent span if it exists,
 * or the extracted span context if there is no active
 * span.
 *
 * @param context context to get values from
 */
export function getParentSpanContext(
  context: Context
): SpanContext | undefined {
  return getActiveSpan(context)?.context();
}

/**
 * Sets value on context to indicate that instrumentation should
 * be suppressed beyond this current scope.
 *
 * @param context context to set the suppress instrumentation value on.
 */
export function suppressInstrumentation(context: Context): Context {
  return context.setValue(SUPPRESS_INSTRUMENTATION_KEY, true);
}

/**
 * Sets value on context to indicate that instrumentation should
 * no-longer be suppressed beyond this current scope.
 *
 * @param context context to set the suppress instrumentation value on.
 */
export function unsuppressInstrumentation(context: Context): Context {
  return context.setValue(SUPPRESS_INSTRUMENTATION_KEY, false);
}

/**
 * Return current suppress instrumentation value for the given context,
 * if it exists.
 *
 * @param context context check for the suppress instrumentation value.
 */
export function isInstrumentationSuppressed(context: Context): boolean {
  return Boolean(context.getValue(SUPPRESS_INSTRUMENTATION_KEY));
}

/**
 * @param {Context} Context that manage all context values
 * @returns {Baggage} Extracted baggage from the context
 */
export function getBaggage(context: Context): Baggage | undefined {
  return (context.getValue(BAGGAGE_KEY) as Baggage) || undefined;
}

/**
 * @param {Context} Context that manage all context values
 * @param {Baggage} baggage that will be set in the actual context
 */
export function setBaggage(context: Context, baggage: Baggage): Context {
  return context.setValue(BAGGAGE_KEY, baggage);
}
