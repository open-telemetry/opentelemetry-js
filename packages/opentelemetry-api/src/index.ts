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

export * from './common/Exception';
export * from './common/Logger';
export * from './common/Time';
export * from './context/context';
export * from './context/propagation/TextMapPropagator';
export * from './context/propagation/NoopTextMapPropagator';
export * from './baggage/Baggage';
export * from './baggage/EntryValue';
export * from './trace/attributes';
export * from './trace/Event';
export * from './trace/link_context';
export * from './trace/link';
export * from './trace/NoopLogger';
export * from './trace/NoopSpan';
export * from './trace/NoopTracer';
export * from './trace/NoopTracerProvider';
export * from './trace/ProxyTracer';
export * from './trace/ProxyTracerProvider';
export * from './trace/Sampler';
export * from './trace/SamplingResult';
export * from './trace/span_context';
export * from './trace/span_kind';
export * from './trace/span';
export * from './trace/SpanOptions';
export * from './trace/status';
export * from './trace/TimedEvent';
export * from './trace/trace_flags';
export * from './trace/trace_state';
export * from './trace/tracer_provider';
export * from './trace/tracer';

export {
  INVALID_SPANID,
  INVALID_TRACEID,
  INVALID_SPAN_CONTEXT,
  isSpanContextValid,
  isValidTraceId,
  isValidSpanId,
} from './trace/spancontext-utils';

export {
  Context,
  ROOT_CONTEXT,
  createContextKey,
  ContextManager,
} from '@opentelemetry/context-base';

import { ContextAPI } from './api/context';
export type { ContextAPI } from './api/context';
/** Entrypoint for context API */
export const context = ContextAPI.getInstance();

import { TraceAPI } from './api/trace';
export type { TraceAPI } from './api/trace';
/** Entrypoint for trace API */
export const trace = TraceAPI.getInstance();

import { PropagationAPI } from './api/propagation';
export type { PropagationAPI } from './api/propagation';
/** Entrypoint for propagation API */
export const propagation = PropagationAPI.getInstance();

export default {
  trace,
  context,
  propagation,
};
