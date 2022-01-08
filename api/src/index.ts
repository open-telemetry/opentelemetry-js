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

export * from './baggage/types';
export { baggageEntryMetadataFromString } from './baggage/utils';
export * from './common/Exception';
export * from './common/Time';
export * from './common/Attributes';
export * from './diag';
export * from './propagation/TextMapPropagator';
export * from './trace/attributes';
export * from './trace/link';
export * from './trace/ProxyTracer';
export * from './trace/ProxyTracerProvider';
export * from './trace/Sampler';
export * from './trace/SamplingResult';
export * from './trace/span_context';
export * from './trace/span_kind';
export * from './trace/span';
export * from './trace/SpanOptions';
export * from './trace/status';
export * from './trace/trace_flags';
export * from './trace/trace_state';
export * from './trace/tracer_provider';
export * from './trace/tracer';

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

export * from './context/context';
export * from './context/types';

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

import { DiagAPI } from './api/diag';
export type { DiagAPI } from './api/diag';

/**
 * Entrypoint for Diag API.
 * Defines Diagnostic handler used for internal diagnostic logging operations.
 * The default provides a Noop DiagLogger implementation which may be changed via the
 * diag.setLogger(logger: DiagLogger) function.
 */
export const diag = DiagAPI.instance();

export default {
  trace,
  context,
  propagation,
  diag,
};
