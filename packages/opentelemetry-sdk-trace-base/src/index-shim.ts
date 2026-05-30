/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export { BasicTracerProvider } from './BasicTracerProvider-shim';
export type {
  GeneralLimits,
  TracerConfig,
  SDKRegistrationConfig,
} from './types-shim';
export { BatchSpanProcessor } from './BatchSpanProcessor-shim';

export {
  ConsoleSpanExporter,
  RandomIdGenerator,
  InMemorySpanExporter,
  SimpleSpanProcessor,
  NoopSpanProcessor,
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  SamplingDecision
} from '@opentelemetry/sdk-trace';
export type {
  ReadableSpan,
  SpanExporter,
  Sampler,
  SamplingResult,
  Span,
  SpanProcessor,
  TimedEvent,
  BatchSpanProcessorBrowserConfig,
  BufferConfig,
  SpanLimits,
  IdGenerator,
} from '@opentelemetry/sdk-trace';
