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

import { SpanContext, HttpTextFormat, TraceFlags } from '@opentelemetry/types';

export const X_B3_TRACE_ID = 'x-b3-traceid';
export const X_B3_SPAN_ID = 'x-b3-spanid';
export const X_B3_SAMPLED = 'x-b3-sampled';
const VALID_TRACEID_REGEX = /^[0-9a-f]{32}$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
const INVALID_ID_REGEX = /^0+$/i;

function isValidTraceId(traceId: string): boolean {
  return VALID_TRACEID_REGEX.test(traceId) && !INVALID_ID_REGEX.test(traceId);
}

function isValidSpanId(spanId: string): boolean {
  return VALID_SPANID_REGEX.test(spanId) && !INVALID_ID_REGEX.test(spanId);
}

/**
 * Propagator for the B3 HTTP header format.
 * Based on: https://github.com/openzipkin/b3-propagation
 */
export class B3Format implements HttpTextFormat {
  inject(
    spanContext: SpanContext,
    format: string,
    carrier: { [key: string]: unknown }
  ): void {
    if (
      isValidTraceId(spanContext.traceId) &&
      isValidSpanId(spanContext.spanId)
    ) {
      carrier[X_B3_TRACE_ID] = spanContext.traceId;
      carrier[X_B3_SPAN_ID] = spanContext.spanId;

      // We set the header only if there is an existing sampling decision.
      // Otherwise we will omit it => Absent.
      if (spanContext.traceFlags !== undefined) {
        carrier[X_B3_SAMPLED] = Number(spanContext.traceFlags);
      }
    }
  }

  extract(
    format: string,
    carrier: { [key: string]: unknown }
  ): SpanContext | null {
    const traceIdHeader = carrier[X_B3_TRACE_ID];
    const spanIdHeader = carrier[X_B3_SPAN_ID];
    const sampledHeader = carrier[X_B3_SAMPLED];
    if (!traceIdHeader || !spanIdHeader) return null;
    const traceId = Array.isArray(traceIdHeader)
      ? traceIdHeader[0]
      : traceIdHeader;
    const spanId = Array.isArray(spanIdHeader) ? spanIdHeader[0] : spanIdHeader;
    const options = Array.isArray(sampledHeader)
      ? sampledHeader[0]
      : sampledHeader;

    if (isValidTraceId(traceId) && isValidSpanId(spanId)) {
      return {
        traceId,
        spanId,
        isRemote: true,
        traceFlags: isNaN(Number(options))
          ? TraceFlags.UNSAMPLED
          : Number(options),
      };
    }
    return null;
  }
}
