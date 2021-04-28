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
import { NonRecordingSpan } from './NonRecordingSpan';
import { Span } from './span';
import { SpanContext } from './span_context';
import { TraceFlags } from './trace_flags';

const VALID_TRACEID_REGEX = /^([0-9a-f]{32})$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
export const INVALID_SPANID = '0000000000000000';
export const INVALID_TRACEID = '00000000000000000000000000000000';
export const INVALID_SPAN_CONTEXT: SpanContext = {
  traceId: INVALID_TRACEID,
  spanId: INVALID_SPANID,
  traceFlags: TraceFlags.NONE,
};

export function isValidTraceId(traceId: string): boolean {
  return VALID_TRACEID_REGEX.test(traceId) && traceId !== INVALID_TRACEID;
}

export function isValidSpanId(spanId: string): boolean {
  return VALID_SPANID_REGEX.test(spanId) && spanId !== INVALID_SPANID;
}

/**
 * Returns true if this {@link SpanContext} is valid.
 * @return true if this {@link SpanContext} is valid.
 */
export function isSpanContextValid(spanContext: SpanContext): boolean {
  return (
    isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId)
  );
}

/**
 * Wrap the given {@link SpanContext} in a new non-recording {@link Span}
 *
 * @param spanContext span context to be wrapped
 * @returns a new non-recording {@link Span} with the provided context
 */
export function wrapSpanContext(spanContext: SpanContext): Span {
  return new NonRecordingSpan(spanContext);
}
