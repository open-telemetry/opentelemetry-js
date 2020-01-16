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

export const UBER_TRACE_ID_HEADER = 'uber-trace-id';

/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 * {trace-id}:{span-id}:{parent-span-id}:{flags}
 * {trace-id}
 * 64-bit or 128-bit random number in base16 format
 * Can be variable length, shorter values are 0-padded on the left
 * Clients in some languages support 128-bit, migration pending
 * Value of 0 is invalid
 * {span-id}
 * 64-bit random number in base16 format
 * {parent-span-id}
 * 64-bit value in base16 format representing parent span id
 * Deprecated, most Jaeger clients ignore on the receiving side, but still include it on the sending side
 * 0 value is valid and means “root span” (when not ignored)
 * {flags}
 * One byte bitmap, as two hex digits
 * Bit 1 (right-most, least significant) is “sampled” flag
 * 1 means the trace is sampled and all downstream services are advised to respect that
 * 0 means the trace is not sampled and all downstream services are advised to respect that
 * We’re considering a new feature that allows downstream services to upsample if they find their tracing level is too low
 * Bit 2 is “debug” flag
 * Debug flag should only be set when the sampled flag is set
 * Instructs the backend to try really hard not to drop this trace
 * Other bits are unused.
 * Inspired by jaeger-client-node project
 */
export class JaegerHttpTraceFormat implements HttpTextFormat {
  inject(
    spanContext: SpanContext,
    format: string,
    carrier: { [key: string]: unknown }
  ) {
    const hexTraceId = removeLeadingZeros(spanContext.traceId);
    const hexSpanId = removeLeadingZeros(spanContext.spanId);
    const parentSpanId = '0';
    const flags = TraceFlags.SAMPLED;

    carrier[UBER_TRACE_ID_HEADER] = `${hexTraceId}:${hexSpanId}:${parentSpanId}:${flags}`;
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
 * @param {string} input - the input for which leading zeros should be removed.
 * @return {string} - returns the input string without leading zeros.
 **/
function removeLeadingZeros(input: string): string {
  let counter = 0;
  let length = input.length - 1;
  for (let i = 0; i < length; i++) {
    if (input.charAt(i) === '0') {
      counter++;
    } else {
      break;
    }
  }

  return input.substring(counter);
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

  const traceFlags = Number(
    '0x' +
    (isNaN(Number(flags))
      ? 1
      : Number(flags))
  ) & 1;

  const isRemote = true;

  return { traceId, spanId, isRemote, traceFlags };
}

