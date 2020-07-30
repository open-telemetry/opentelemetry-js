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
  HttpTextPropagator,
  SetterFunction,
  TraceFlags,
} from '@opentelemetry/api';
import { getParentSpanContext, setExtractedSpanContext } from '../context';

export const X_B3_TRACE_ID = 'x-b3-traceid';
export const X_B3_SPAN_ID = 'x-b3-spanid';
export const X_B3_SAMPLED = 'x-b3-sampled';
export const X_B3_PARENT_SPAN_ID = 'x-b3-parentspanid';
export const X_B3_FLAGS = 'x-b3-flags';
export const PARENT_SPAN_ID_KEY = Context.createKey(
  'OpenTelemetry Context Key B3 Parent Span Id'
);
export const DEBUG_FLAG_KEY = Context.createKey(
  'OpenTelemetry Context Key B3 Debug Flag'
);
const VALID_TRACEID_REGEX = /^([0-9a-f]{16}){1,2}$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
const INVALID_ID_REGEX = /^0+$/i;
const VALID_SAMPLED_VALUES = [true, 'true', '1'];

function isValidTraceId(traceId: string): boolean {
  return VALID_TRACEID_REGEX.test(traceId) && !INVALID_ID_REGEX.test(traceId);
}

function isValidSpanId(spanId: string): boolean {
  return VALID_SPANID_REGEX.test(spanId) && !INVALID_ID_REGEX.test(spanId);
}

function parseHeader(header: unknown) {
  return Array.isArray(header) ? header[0] : header;
}

/**
 * Propagator for the B3 HTTP header format.
 * Based on: https://github.com/openzipkin/b3-propagation
 */
export class B3Propagator implements HttpTextPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;
    const parentSpanId = context.getValue(PARENT_SPAN_ID_KEY);
    if (
      isValidTraceId(spanContext.traceId) &&
      isValidSpanId(spanContext.spanId)
    ) {
      if (parentSpanId) {
        if (isValidSpanId(parentSpanId as string)) {
          setter(carrier, X_B3_PARENT_SPAN_ID, parentSpanId);
        } else {
          return;
        }
      }
      const debug = context.getValue(DEBUG_FLAG_KEY);
      setter(carrier, X_B3_TRACE_ID, spanContext.traceId);
      setter(carrier, X_B3_SPAN_ID, spanContext.spanId);
      // According to the B3 spec, if the debug flag is set,
      // the sampled flag shouldn't be propagated as well.
      if (debug === '1') {
        setter(carrier, X_B3_FLAGS, debug);
      } else if (spanContext.traceFlags !== undefined) {
        // We set the header only if there is an existing sampling decision.
        // Otherwise we will omit it => Absent.
        setter(
          carrier,
          X_B3_SAMPLED,
          (TraceFlags.SAMPLED & spanContext.traceFlags) === TraceFlags.SAMPLED
            ? '1'
            : '0'
        );
      }
    }
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    const traceIdHeader = getter(carrier, X_B3_TRACE_ID);
    const spanIdHeader = getter(carrier, X_B3_SPAN_ID);
    const parentSpanIdHeader = getter(carrier, X_B3_PARENT_SPAN_ID);
    const sampledHeader = getter(carrier, X_B3_SAMPLED);
    const flagsHeader = getter(carrier, X_B3_FLAGS);

    const traceIdHeaderValue = parseHeader(traceIdHeader);
    const spanId = parseHeader(spanIdHeader);
    const parentSpanId = parseHeader(parentSpanIdHeader);
    const options = parseHeader(sampledHeader);
    const debugHeaderValue = parseHeader(flagsHeader);
    const debug = debugHeaderValue === '1';
    const isSampled = VALID_SAMPLED_VALUES.includes(options);
    const traceFlags =
      debug || isSampled ? TraceFlags.SAMPLED : TraceFlags.NONE;

    if (
      typeof traceIdHeaderValue !== 'string' ||
      typeof spanId !== 'string' ||
      (typeof parentSpanIdHeader === 'string' && !isValidSpanId(parentSpanId))
    ) {
      return context;
    }

    context = context.setValue(PARENT_SPAN_ID_KEY, parentSpanId);
    context = context.setValue(DEBUG_FLAG_KEY, debug ? '1' : undefined);

    const traceId = traceIdHeaderValue.padStart(32, '0');

    if (isValidTraceId(traceId) && isValidSpanId(spanId)) {
      return setExtractedSpanContext(context, {
        traceId,
        spanId,
        isRemote: true,
        traceFlags,
      });
    }
    return context;
  }
}
