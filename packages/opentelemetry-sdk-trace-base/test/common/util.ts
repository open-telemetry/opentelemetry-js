/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricReader } from '@opentelemetry/sdk-metrics';
import type { Tracer as ApiTracer } from '@opentelemetry/api';
import type { Resource } from '@opentelemetry/resources';
import type { SpanLimits, SpanProcessor } from '@opentelemetry/sdk-trace';
import { BasicTracerProvider } from '../../src/BasicTracerProvider-shim';

export const validAttributes = {
  string: 'string',
  number: 0,
  bool: true,
  'array<string>': ['str1', 'str2'],
  'array<number>': [1, 2],
  'array<bool>': [true, false],
};

export const invalidAttributes = {
  // invalid attribute type object
  object: { foo: 'bar' },
  // invalid attribute inhomogenous array
  'non-homogeneous-array': [0, ''],
  // This empty length attribute should not be set
  '': 'empty-key',
};

export function assertAssignable<T>(val: T): asserts val is T {}

export class TestMetricReader extends MetricReader {
  protected override onShutdown(): Promise<void> {
    return Promise.resolve();
  }
  protected override onForceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * Many tests are written inspecting internal details of SDK implementation
 * classes. These `cheat*` functions attempt to abstract away the cheating part.
 */
export function cheatSpanProcessorsFromTracerProvider(tracerProvider: BasicTracerProvider): SpanProcessor[] {
  return (tracerProvider as any)._activeSpanProcessor._spanProcessors;
}
export function cheatResourceFromTracerProvider(tracerProvider: BasicTracerProvider): Resource {
  return (tracerProvider as any)._resource;
}
export function cheatSpanLimitsFromTracer(tracer: ApiTracer): SpanLimits {
  return (tracer as any)._spanLimits;
}
