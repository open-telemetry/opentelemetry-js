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
  bytes: new Uint8Array([68, 69]),
  obj: {foo: 'bar'},
  nested: {anObj: {}, anArray: [1,2,3]},
};

export const invalidAttributes = {
  // This empty length attribute should not be set
  '': 'empty-key',
  // Non-Object objects, for example:
  date: new Date(),
  regexp: /^f./,
  err: new Error('boom'),
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
