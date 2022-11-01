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

export { SpanAttributes, SpanAttributeValue } from './trace/attributes';
export { Link } from './trace/link';
export { ProxyTracer, TracerDelegator } from './trace/ProxyTracer';
export { ProxyTracerProvider } from './trace/ProxyTracerProvider';
export { Sampler } from './trace/Sampler';
export { SamplingDecision, SamplingResult } from './trace/SamplingResult';
export { SpanContext } from './trace/span_context';
export { SpanKind } from './trace/span_kind';
export { Span } from './trace/span';
export { SpanOptions } from './trace/SpanOptions';
export { SpanStatus, SpanStatusCode } from './trace/status';
export { TraceFlags } from './trace/trace_flags';
export { TraceState } from './trace/trace_state';
export { createTraceState } from './trace/internal/utils';
export { TracerProvider } from './trace/tracer_provider';
export { Tracer } from './trace/tracer';
export { TracerOptions } from './trace/tracer_options';

export {
  isSpanContextValid,
  isValidTraceId,
  isValidSpanId,
} from './trace/spancontext-utils';

export {
  INVALID_SPANID,
  INVALID_TRACEID,
  INVALID_SPAN_CONTEXT,
} from './trace/invalid-span-constants';

import { TraceAPI } from './api/trace';
export type { TraceAPI } from './api/trace';
/** Entrypoint for trace API */
export const trace = TraceAPI.getInstance();
