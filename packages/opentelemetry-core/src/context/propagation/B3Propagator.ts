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
const VALID_TRACEID_REGEX = /^([0-9a-f]{16}){1,2}$/i;
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
export class B3Propagator implements HttpTextPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;
    if (
      isValidTraceId(spanContext.traceId) &&
      isValidSpanId(spanContext.spanId)
    ) {
      const parentSpanExists = !!spanContext.parentSpanId;
      if (parentSpanExists) {
        if (isValidTraceId(spanContext.parentSpanId || ''))
          setter(carrier, X_B3_PARENT_SPAN_ID, spanContext.parentSpanId);
        else return;
      }
      setter(carrier, X_B3_TRACE_ID, spanContext.traceId);
      setter(carrier, X_B3_SPAN_ID, spanContext.spanId);
      // According to the B3 spec, if the debug flag is set,
      // the sampled flag shouldn't be propagated as well.
      if (spanContext.debug) {
        setter(carrier, X_B3_FLAGS, '1');
      }
      // We set the header only if there is an existing sampling decision.
      // Otherwise we will omit it => Absent.
      else if (spanContext.traceFlags !== undefined) {
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

    const traceIdHeaderValue = Array.isArray(traceIdHeader)
      ? traceIdHeader[0]
      : traceIdHeader;
    const spanId = Array.isArray(spanIdHeader) ? spanIdHeader[0] : spanIdHeader;
    const parentSpanId = Array.isArray(parentSpanIdHeader)
      ? parentSpanIdHeader[0]
      : parentSpanIdHeader;

    const options = Array.isArray(sampledHeader)
      ? sampledHeader[0]
      : sampledHeader;

    const debugHeaderValue = Array.isArray(flagsHeader)
      ? flagsHeader[0]
      : flagsHeader;
    const debug = isNaN(Number(debugHeaderValue))
      ? false
      : debugHeaderValue === '1';
    const traceFlagsOrDebug = Number(debug) || Number(options);

    if (
      typeof traceIdHeaderValue !== 'string' ||
      typeof spanId !== 'string' ||
      (typeof parentSpanIdHeader === 'string' && !isValidSpanId(parentSpanId))
    ) {
      return context;
    }

    const traceId = traceIdHeaderValue.padStart(32, '0');

    if (isValidTraceId(traceId) && isValidSpanId(spanId)) {
      return setExtractedSpanContext(context, {
        traceId,
        spanId,
        isRemote: true,
        // Set traceFlags as 1 if debug is 1
        traceFlags: traceFlagsOrDebug || TraceFlags.NONE,
        debug,
        parentSpanId,
      });
    }
    return context;
  }
}
