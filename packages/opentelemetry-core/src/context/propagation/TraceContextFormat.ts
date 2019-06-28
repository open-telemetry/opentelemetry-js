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

import { SpanContext, Propagator } from '@opentelemetry/types';

export const TRACE_PARENT_HEADER = 'traceparent';
export const TRACE_STATE_HEADER = 'tracestate';
// TODO: https://github.com/open-telemetry/opentelemetry-js/pull/60
// Consider to import const from TraceOptions
export const DEFAULT_OPTIONS = 0x0;
const TRACE_PARENT_REGEX = /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/;
const VERSION = '00';
const traceIdFormat = /^[0-9a-f]{32}$/i;
const spanIdFormat = /^[0-9a-f]{16}$/i;
const invalidIdFormat = /^0+$/i;

// TODO: Conside to move these interfaces in types.
export interface HeaderGetter {
  getHeader(name: string): string | string[] | undefined;
}
export interface HeaderSetter {
  setHeader(name: string, value: string): void;
}

/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 *
 * Based on the Trace Context specification:
 * https://www.w3.org/TR/trace-context/
 */
export class TraceContextFormat implements Propagator {
  inject(spanContext: SpanContext, format: string, carrier: HeaderSetter) {
    const traceParent = `${VERSION}-${spanContext.traceId}-${
      spanContext.spanId
    }-0${(spanContext.traceOptions || DEFAULT_OPTIONS).toString(16)}`;

    carrier.setHeader(TRACE_PARENT_HEADER, traceParent);
    if (spanContext.traceState) {
      // TODO: https://github.com/open-telemetry/opentelemetry-js/pull/57
      //setter.setHeader(TRACE_STATE_HEADER, spanContext.traceState);
    }
  }

  extract(format: string, carrier: HeaderGetter): SpanContext | null {
    const traceParentHeader = carrier.getHeader(TRACE_PARENT_HEADER);
    if (!traceParentHeader) return null;
    const traceParent = Array.isArray(traceParentHeader)
      ? traceParentHeader[0]
      : traceParentHeader;
    const spanContext = parse(traceParent);
    if (!spanContext) return null;

    const traceStateHeader = carrier.getHeader(TRACE_STATE_HEADER);
    if (traceStateHeader) {
      // If more than one `tracestate` header is found, we merge them into a
      // single header.
      // TODO: https://github.com/open-telemetry/opentelemetry-js/pull/57
      spanContext.traceState = Array.isArray(traceStateHeader)
        ? traceStateHeader.join(',')
        : traceStateHeader;
    }
    return spanContext;
  }
}

export function parse(traceParent: string): SpanContext | null {
  const match = traceParent.match(TRACE_PARENT_REGEX);
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
  return traceIdFormat.test(traceId) && !invalidIdFormat.test(traceId);
}

function isValidSpanId(spanId: string): boolean {
  return spanIdFormat.test(spanId) && !invalidIdFormat.test(spanId);
}
