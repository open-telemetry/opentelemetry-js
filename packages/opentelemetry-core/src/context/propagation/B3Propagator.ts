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
const VALID_SAMPLED_VALUES = [true, 'true', '1', 1];
const VALID_UNSAMPLED_VALUES = [0, '0', 'false', false];

function isValidTraceId(traceId: string): boolean {
  return VALID_TRACEID_REGEX.test(traceId) && !INVALID_ID_REGEX.test(traceId);
}

function isValidSpanId(spanId: string): boolean {
  return VALID_SPANID_REGEX.test(spanId) && !INVALID_ID_REGEX.test(spanId);
}

function isValidParentSpanID(spanId: string | undefined): boolean {
  return spanId === undefined || isValidSpanId(spanId);
}

function isValidSampledValue(sampled: number | undefined): boolean {
  return (
    sampled === undefined ||
    VALID_SAMPLED_VALUES.includes(sampled) ||
    VALID_UNSAMPLED_VALUES.includes(sampled)
  );
}

function parseHeader(header: unknown) {
  return Array.isArray(header) ? header[0] : header;
}

/**
 * Propagator for the B3 HTTP header format.
 * Based on: https://github.com/openzipkin/b3-propagation
 */
export class B3Propagator implements HttpTextPropagator {
  _getHeaderValue(carrier: unknown, getter: GetterFunction, key: string) {
    const header = getter(carrier, key);
    return parseHeader(header);
  }

  _getTraceId(carrier: unknown, getter: GetterFunction): string {
    const traceId = this._getHeaderValue(carrier, getter, X_B3_TRACE_ID);
    if (typeof traceId === 'string') {
      return traceId.padStart(32, '0');
    }
    return '';
  }

  _getSpanId(carrier: unknown, getter: GetterFunction): string {
    const spanId = this._getHeaderValue(carrier, getter, X_B3_SPAN_ID);
    if (typeof spanId === 'string') {
      return spanId;
    }
    return '';
  }

  _getParentSpanId(
    carrier: unknown,
    getter: GetterFunction
  ): string | undefined {
    const spanId = this._getHeaderValue(carrier, getter, X_B3_PARENT_SPAN_ID);
    if (typeof spanId === 'string') {
      return spanId;
    }
    return;
  }

  _getDebug(carrier: unknown, getter: GetterFunction): string | undefined {
    const debug = this._getHeaderValue(carrier, getter, X_B3_FLAGS);
    return debug === '1' ? '1' : undefined;
  }

  _getTraceFlags(carrier: unknown, getter: GetterFunction): number | undefined {
    const traceFlags = this._getHeaderValue(carrier, getter, X_B3_SAMPLED);
    const debug = this._getDebug(carrier, getter);
    if (debug === '1') {
      return TraceFlags.SAMPLED;
    } else if (traceFlags !== undefined) {
      if (VALID_SAMPLED_VALUES.includes(traceFlags)) {
        return TraceFlags.SAMPLED;
      } else if (VALID_UNSAMPLED_VALUES.includes(traceFlags)) {
        return TraceFlags.NONE;
      } else {
        // Invalid traceflag
        return 2;
      }
    }
    return;
  }

  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;
    const parentSpanId = context.getValue(PARENT_SPAN_ID_KEY) as
      | undefined
      | string;
    if (
      isValidTraceId(spanContext.traceId) &&
      isValidSpanId(spanContext.spanId) &&
      isValidParentSpanID(parentSpanId)
    ) {
      const debug = context.getValue(DEBUG_FLAG_KEY);
      setter(carrier, X_B3_TRACE_ID, spanContext.traceId);
      setter(carrier, X_B3_SPAN_ID, spanContext.spanId);
      if (parentSpanId) {
        setter(carrier, X_B3_PARENT_SPAN_ID, parentSpanId);
      }
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
    const traceId = this._getTraceId(carrier, getter);
    const spanId = this._getSpanId(carrier, getter);
    const parentSpanId = this._getParentSpanId(carrier, getter);
    const traceFlags = this._getTraceFlags(carrier, getter);
    const debug = this._getDebug(carrier, getter);

    if (
      isValidTraceId(traceId) &&
      isValidSpanId(spanId) &&
      isValidParentSpanID(parentSpanId) &&
      isValidSampledValue(traceFlags)
    ) {
      context = context.setValue(PARENT_SPAN_ID_KEY, parentSpanId);
      context = context.setValue(DEBUG_FLAG_KEY, debug);
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
