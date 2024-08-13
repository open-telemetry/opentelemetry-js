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

export { WebTracerConfig, WebTracerProvider } from './WebTracerProvider';
export { StackContextManager } from './StackContextManager';
export { PerformanceTimingNames } from './enums/PerformanceTimingNames';
export {
  PerformanceEntries,
  PerformanceLegacy,
  PerformanceResourceTimingInfo,
  PropagateTraceHeaderCorsUrls,
} from './types';
export {
  URLLike,
  addSpanNetworkEvent,
  addSpanNetworkEvents,
  getElementXPath,
  getResource,
  hasKey,
  normalizeUrl,
  parseUrl,
  shouldPropagateTraceHeaders,
  sortResources,
} from './utils';
export {
  AlwaysOffSampler,
  AlwaysOnSampler,
  BasicTracerProvider,
  BatchSpanProcessor,
  BatchSpanProcessorBrowserConfig,
  BufferConfig,
  ConsoleSpanExporter,
  EXPORTER_FACTORY,
  ForceFlushState,
  GeneralLimits,
  IdGenerator,
  InMemorySpanExporter,
  NoopSpanProcessor,
  ParentBasedSampler,
  PROPAGATOR_FACTORY,
  RandomIdGenerator,
  ReadableSpan,
  Sampler,
  SamplingDecision,
  SamplingResult,
  SDKRegistrationConfig,
  SimpleSpanProcessor,
  Span,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
  TimedEvent,
  TraceIdRatioBasedSampler,
  Tracer,
  TracerConfig,
} from '@opentelemetry/sdk-trace-base';
