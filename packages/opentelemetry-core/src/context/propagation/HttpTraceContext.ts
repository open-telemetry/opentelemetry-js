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

import {
  SpanContext,
  HttpTextFormat,
  TraceOptions,
} from '@opentelemetry/types';
import { TraceState } from '../../trace/TraceState';

export const TRACE_PARENT_HEADER = 'traceparent';
export const TRACE_STATE_HEADER = 'tracestate';
const VALID_TRACE_PARENT_REGEX = /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/;
const VALID_TRACEID_REGEX = /^[0-9a-f]{32}$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
const INVALID_ID_REGEX = /^0+$/i;
const VERSION = '00';

function parse(traceParent: string): SpanContext | null {
  const match = traceParent.match(VALID_TRACE_PARENT_REGEX);
  if (!match) return null;
  const parts = traceParent.split('-');
  const [version, traceId, spanId, option] = parts;
  // tslint:disable-next-line:ban Needed to parse hexadecimal.
  const traceOptions = parseInt(option, 16);

  if (
    !isValidVersion(version) ||
    !isValidTraceId(traceId) ||
    !isValidSpanId(spanId)
  ) {
    return null;
  }

  return { traceId, spanId, traceOptions };
}

function isValidVersion(version: string): boolean {
  return version === VERSION;
}

function isValidTraceId(traceId: string): boolean {
  return VALID_TRACEID_REGEX.test(traceId) && !INVALID_ID_REGEX.test(traceId);
}

function isValidSpanId(spanId: string): boolean {
  return VALID_SPANID_REGEX.test(spanId) && !INVALID_ID_REGEX.test(spanId);
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
    }-0${Number(spanContext.traceOptions || TraceOptions.UNSAMPLED).toString(
      16
    )}`;

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
    const spanContext = parse(traceParent);
    if (!spanContext) return null;

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
