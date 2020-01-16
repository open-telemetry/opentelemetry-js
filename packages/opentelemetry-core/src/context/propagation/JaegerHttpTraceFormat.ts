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

import { SpanContext, HttpTextFormat, TraceFlags } from '@opentelemetry/types';

export const UBER_TRACE_ID_HEADER = 'uber-trace-id';

/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 * {trace-id}:{span-id}:{parent-span-id}:{flags}
 * {trace-id}
 * 64-bit or 128-bit random number in base16 format
 * Can be variable length, shorter values are 0-padded on the left
 * Value of 0 is invalid
 * {span-id}
 * 64-bit random number in base16 format
 * {parent-span-id} set to 0 because this field is deprecated
 * {flags}
 * One byte bitmap, as two hex digits
 * Inspired by jaeger-client-node project
 */
export class JaegerHttpTraceFormat implements HttpTextFormat {
  inject(
    spanContext: SpanContext,
    format: string,
    carrier: { [key: string]: unknown }
  ) {
    const traceFlags = `0${(
      spanContext.traceFlags || TraceFlags.UNSAMPLED
    ).toString(16)}`;

    carrier[
      UBER_TRACE_ID_HEADER
    ] = `${spanContext.traceId}:${spanContext.spanId}:0:${traceFlags}`;
  }

  extract(
    format: string,
    carrier: { [key: string]: unknown }
  ): SpanContext | null {
    const uberTraceIdHeader = carrier[UBER_TRACE_ID_HEADER];
    if (!uberTraceIdHeader) return null;
    const uberTraceId = Array.isArray(uberTraceIdHeader)
      ? uberTraceIdHeader[0]
      : uberTraceIdHeader;

    return deserializeSpanContext(uberTraceId);
  }
}

/**
 * @param {string} serializedString - a serialized span context.
 * @return {SpanContext} - returns a span context represented by the serializedString.
 **/
function deserializeSpanContext(serializedString: string): SpanContext | null {
  let headers = serializedString.split(':');
  if (headers.length !== 4) {
    return null;
  }
  const [traceId, spanId, , flags] = headers;

  const traceFlags = flags.match(/^[0-9a-f]{2}$/i) ? parseInt(flags) & 1 : 1;

  return { traceId, spanId, isRemote: true, traceFlags };
}
