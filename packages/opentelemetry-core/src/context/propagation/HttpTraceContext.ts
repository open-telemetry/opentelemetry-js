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

import { HttpTextFormat, SpanContext, TraceFlags } from '@opentelemetry/api';
import { TraceState } from '../../trace/TraceState';

export const TRACE_PARENT_HEADER = 'traceparent';
export const TRACE_STATE_HEADER = 'tracestate';
const VALID_TRACE_PARENT_REGEX = /^00-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/;
const VERSION = '00';

/**
 * Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
 * @param traceParent - A meta property that comes from server.
 *     It should be dynamically generated server side to have the server's request trace Id,
 *     a parent span Id that was set on the server's request span,
 *     and the trace flags to indicate the server's sampling decision
 *     (01 = sampled, 00 = not sampled).
 *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
 *     For more information see {@link https://www.w3.org/TR/trace-context/}
 */
export function parseTraceParent(traceParent: string): SpanContext | null {
  const match = traceParent.match(VALID_TRACE_PARENT_REGEX);
  if (
    !match ||
    match[1] === '00000000000000000000000000000000' ||
    match[2] === '0000000000000000'
  ) {
    return null;
  }

  return {
    traceId: match[1],
    spanId: match[2],
    traceFlags: parseInt(match[3], 16),
  };
}

/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 *
 * Based on the Trace Context specification:
 * https://www.w3.org/TR/trace-context/
 */
export class HttpTraceContext implements HttpTextFormat {
  inject(
    spanContext: SpanContext,
    format: string,
    carrier: { [key: string]: unknown }
  ) {
    const traceParent = `${VERSION}-${spanContext.traceId}-${
      spanContext.spanId
    }-0${Number(spanContext.traceFlags || TraceFlags.UNSAMPLED).toString(16)}`;

    carrier[TRACE_PARENT_HEADER] = traceParent;
    if (spanContext.traceState) {
      carrier[TRACE_STATE_HEADER] = spanContext.traceState.serialize();
    }
  }

  extract(
    format: string,
    carrier: { [key: string]: unknown }
  ): SpanContext | null {
    const traceParentHeader = carrier[TRACE_PARENT_HEADER];
    if (!traceParentHeader) return null;
    const traceParent = Array.isArray(traceParentHeader)
      ? traceParentHeader[0]
      : traceParentHeader;
    const spanContext = parseTraceParent(traceParent);
    if (!spanContext) return null;

    spanContext.isRemote = true;

    const traceStateHeader = carrier[TRACE_STATE_HEADER];
    if (traceStateHeader) {
      // If more than one `tracestate` header is found, we merge them into a
      // single header.
      const state = Array.isArray(traceStateHeader)
        ? traceStateHeader.join(',')
        : traceStateHeader;
      spanContext.traceState = new TraceState(state as string);
    }
    return spanContext;
  }
}
