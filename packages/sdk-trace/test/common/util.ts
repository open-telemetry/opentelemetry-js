/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricReader } from '@opentelemetry/sdk-metrics';
import type { Tracer as ApiTracer } from '@opentelemetry/api';
import type { Resource } from '@opentelemetry/resources';
import type { SpanLimits, SpanProcessor } from '../../src';
import type { TracerProvider } from '../../src';

export const validAttributes = {
  string: 'string',
  number: 0,
  bool: true,
  'array<string>': ['str1', 'str2'],
  'array<number>': [1, 2],
  'array<bool>': [true, false],
  object: { foo: 'bar' },
  'non-homogeneous-array': [0, ''],
};

export const invalidAttributes = {
  '': 'empty-key',
  func: () => {},
  uint32Array: new Uint32Array([1, 2, 3]),
  bigInt: 1152921504606846976n,
  bigInt64Array: new BigInt64Array([1n, 2n, 3n]),
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

interface Resolvers<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
}

// Use Promise.withResolvers when we can
export function withResolvers<T>(): Resolvers<T> {
  let resolve: (value: T) => void;
  let reject: (reason: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

/**
 * Many tests are written inspecting internal details of SDK implementation
 * classes. These `cheat*` functions attempt to abstract away the cheating part.
 */
export function cheatSpanProcessorsFromTracerProvider(
  tracerProvider: TracerProvider
): SpanProcessor[] {
  return (tracerProvider as any)._activeSpanProcessor._spanProcessors;
}
export function cheatResourceFromTracerProvider(
  tracerProvider: TracerProvider
): Resource {
  return (tracerProvider as any)._resource;
}
export function cheatSpanLimitsFromTracer(
  tracer: ApiTracer
): Required<SpanLimits> {
  return (tracer as any)._spanLimits;
}
