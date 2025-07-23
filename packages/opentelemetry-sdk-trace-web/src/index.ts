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

export { WebTracerProvider } from './WebTracerProvider';
export type { WebTracerConfig } from './WebTracerProvider';
export { StackContextManager } from './StackContextManager';
export { PerformanceTimingNames } from './enums/PerformanceTimingNames';
export type {
  PerformanceEntries,
  PerformanceLegacy,
  PerformanceResourceTimingInfo,
  PropagateTraceHeaderCorsUrls,
} from './types';
export {
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
export type { URLLike } from './utils';
export {
  AlwaysOffSampler,
  AlwaysOnSampler,
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  InMemorySpanExporter,
  NoopSpanProcessor,
  ParentBasedSampler,
  RandomIdGenerator,
  SamplingDecision,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
export type {
  BatchSpanProcessorBrowserConfig,
  BufferConfig,
  GeneralLimits,
  IdGenerator,
  ReadableSpan,
  Sampler,
  SamplingResult,
  SDKRegistrationConfig,
  Span,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
  TimedEvent,
  TracerConfig,
} from '@opentelemetry/sdk-trace-base';
