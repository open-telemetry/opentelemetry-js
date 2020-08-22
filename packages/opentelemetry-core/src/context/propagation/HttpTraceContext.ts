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

import {
  Context,
  GetterFunction,
  TextMapPropagator,
  SetterFunction,
  SpanContext,
  TraceFlags,
} from '@opentelemetry/api';
import { TraceState } from '../../trace/TraceState';
import { getParentSpanContext, setExtractedSpanContext } from '../context';

export const TRACE_PARENT_HEADER = 'traceparent';
export const TRACE_STATE_HEADER = 'tracestate';

const VERSION = '00';
const VERSION_PART_COUNT = 4; // Version 00 only allows the specific 4 fields.

const VERSION_REGEX = /^(?!ff)[\da-f]{2}$/;
const TRACE_ID_REGEX = /^(?![0]{32})[\da-f]{32}$/;
const PARENT_ID_REGEX = /^(?![0]{16})[\da-f]{16}$/;
const FLAGS_REGEX = /^[\da-f]{2}$/;

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
  const trimmed = traceParent.trim();
  const traceParentParts = trimmed.split('-');

  // Current version must be structured correctly.
  // For future versions, we can grab just the parts we do support.
  if (
    traceParentParts[0] === VERSION &&
    traceParentParts.length !== VERSION_PART_COUNT
  ) {
    return null;
  }

  const [version, traceId, parentId, flags] = traceParentParts;
  const isValidParent =
    VERSION_REGEX.test(version) &&
    TRACE_ID_REGEX.test(traceId) &&
    PARENT_ID_REGEX.test(parentId) &&
    FLAGS_REGEX.test(flags);

  if (!isValidParent) {
    return null;
  }

  return {
    traceId: traceId,
    spanId: parentId,
    traceFlags: parseInt(flags, 16),
  };
}

/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 *
 * Based on the Trace Context specification:
 * https://www.w3.org/TR/trace-context/
 */
export class HttpTraceContext implements TextMapPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;

    const traceParent = `${VERSION}-${spanContext.traceId}-${
      spanContext.spanId
    }-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;

    setter(carrier, TRACE_PARENT_HEADER, traceParent);
    if (spanContext.traceState) {
      setter(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
    }
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    const traceParentHeader = getter(carrier, TRACE_PARENT_HEADER);
    if (!traceParentHeader) return context;
    const traceParent = Array.isArray(traceParentHeader)
      ? traceParentHeader[0]
      : traceParentHeader;
    if (typeof traceParent !== 'string') return context;
    const spanContext = parseTraceParent(traceParent);
    if (!spanContext) return context;

    spanContext.isRemote = true;

    const traceStateHeader = getter(carrier, TRACE_STATE_HEADER);
    if (traceStateHeader) {
      // If more than one `tracestate` header is found, we merge them into a
      // single header.
      const state = Array.isArray(traceStateHeader)
        ? traceStateHeader.join(',')
        : traceStateHeader;
      spanContext.traceState = new TraceState(
        typeof state === 'string' ? state : undefined
      );
    }
    return setExtractedSpanContext(context, spanContext);
  }
}
