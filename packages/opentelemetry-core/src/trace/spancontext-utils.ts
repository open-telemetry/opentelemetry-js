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

import { SpanContext, TraceFlags } from '@opentelemetry/api';
import { idsEquals } from '../platform';

export const INVALID_SPANID = new Uint8Array(8);
export const INVALID_TRACEID = new Uint8Array(16);
export const INVALID_SPAN_CONTEXT: SpanContext = {
  traceId: INVALID_TRACEID,
  spanId: INVALID_SPANID,
  traceFlags: TraceFlags.UNSAMPLED,
};

/**
 * Returns true if traceId is valid.
 * @return true if traceId is valid.
 */
export function traceIdIsValid(traceId: Uint8Array): boolean {
  return traceId.byteLength === 16 && !idsEquals(traceId, INVALID_TRACEID);
}

/**
 * Returns true if spanId is valid.
 * @return true if spanId is valid.
 */
export function spanIdIsValid(spanId: Uint8Array): boolean {
  return spanId.byteLength === 8 && !idsEquals(spanId, INVALID_SPANID);
}

/**
 * Returns true if this {@link SpanContext} is valid.
 * @return true if this {@link SpanContext} is valid.
 */
export function isValid(spanContext: SpanContext): boolean {
  return spanIdIsValid(spanContext.spanId) && traceIdIsValid(spanContext.traceId);
}
