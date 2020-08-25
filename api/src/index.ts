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
export * from './context/propagation/getter';
export * from './context/propagation/TextMapPropagator';
export * from './context/propagation/NoopTextMapPropagator';
export * from './context/propagation/setter';
export * from './correlation_context/CorrelationContext';
export * from './correlation_context/EntryValue';
export * from './metrics/BatchObserverResult';
export * from './metrics/BoundInstrument';
export * from './metrics/Meter';
export * from './metrics/MeterProvider';
export * from './metrics/Metric';
export * from './metrics/NoopMeter';
export * from './metrics/NoopMeterProvider';
export * from './metrics/Observation';
export * from './metrics/ObserverResult';
export * from './trace/attributes';
export * from './trace/Event';
export * from './trace/instrumentation/Plugin';
export * from './trace/link_context';
export * from './trace/link';
export * from './trace/NoopSpan';
export * from './trace/NoopTracer';
export * from './trace/NoopTracerProvider';
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

export { Context } from '@opentelemetry/context-base';

import { ContextAPI } from './api/context';
/** Entrypoint for context API */
export const context = ContextAPI.getInstance();

import { TraceAPI } from './api/trace';
/** Entrypoint for trace API */
export const trace = TraceAPI.getInstance();

import { MetricsAPI } from './api/metrics';
/** Entrypoint for metrics API */
export const metrics = MetricsAPI.getInstance();

import { PropagationAPI } from './api/propagation';
/** Entrypoint for propagation API */
export const propagation = PropagationAPI.getInstance();

export default {
  trace,
  metrics,
  context,
  propagation,
};
