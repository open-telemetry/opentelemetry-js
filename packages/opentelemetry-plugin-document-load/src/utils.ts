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

import * as types from '@opentelemetry/types';
import { TraceFlags } from '@opentelemetry/types';

/**
 * Helper function to be able to use enum as typed key in type and in interface when using forEach
 * @param obj
 * @param key
 */
export function hasKey<O>(obj: O, key: keyof any): key is keyof O {
  return key in obj;
}

// '{version}-{traceId}-{spanId}-{TraceFlags}';
const TRACE_PARENT_REGEX = /^[\da-f]{2}-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/;

/**
 * Extracts information from [traceParent] window property and converts it into {@link types.SpanContext}
 * @param traceParent - A window property that comes from server.
 *     It should be dynamically generated server side to have the server's request trace Id,
 *     a parent span Id that was set on the server's request span,
 *     and the trace flags to indicate the server's sampling decision
 *     (01 = sampled, 00 = not sampled).
 *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
 *     For more information see {@link https://www.w3.org/TR/trace-context/}
 */
export function extractServerContext(
  traceParent: string = ''
): types.SpanContext | undefined {
  const match =
    typeof traceParent === 'string' && traceParent.match(TRACE_PARENT_REGEX);
  if (!match) {
    return;
  }
  const traceId = match[1];
  const spanId = match[2];
  let traceFlags;

  if (match[3] === '00') {
    traceFlags = TraceFlags.UNSAMPLED;
  } else if (match[3] === '01') {
    traceFlags = TraceFlags.SAMPLED;
  }

  let spanContext: types.SpanContext | undefined;
  if (traceId && spanId && typeof traceFlags !== 'undefined') {
    spanContext = { traceId, spanId, traceFlags };
  }

  return spanContext;
}
