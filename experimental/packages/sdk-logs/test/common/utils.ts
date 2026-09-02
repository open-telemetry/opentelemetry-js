/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricReader } from '@opentelemetry/sdk-metrics';

export const validAttributes = {
  string: 'string',
  number: 0,
  bool: true,
  'array<string>': ['str1', 'str2'],
  'array<number>': [1, 2],
  'array<bool>': [true, false],
  object: { bar: 'foo' },
  'empty-object': {},
  'non-homogeneous-array': [0, ''],
};

export const invalidAttributes = {
  // This empty length attribute should not be set
  '': 'empty-key',
};

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
