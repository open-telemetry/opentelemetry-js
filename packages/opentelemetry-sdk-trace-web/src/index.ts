/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
