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

import * as api from '@opentelemetry/api';
import {
  BatchObservableCallback,
  MetricAttributes,
  ObservableCallback,
  ValueType,
} from '@opentelemetry/api-metrics';
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import { InstrumentDescriptor, InstrumentType } from '../src/InstrumentDescriptor';
import {
  MetricData,
  DataPoint,
  DataPointType,
  ScopeMetrics
} from '../src/export/MetricData';
import { isNotNullish } from '../src/utils';
import { HrTime } from '@opentelemetry/api';
import { Histogram } from '../src/aggregator/types';
import { AggregationTemporality } from '../src/export/AggregationTemporality';

export type Measurement = {
  value: number;
  // TODO: use common attributes
  attributes: MetricAttributes
  context?: api.Context;
};

export const defaultResource = new Resource({
  resourceKey: 'my-resource',
});

export const defaultInstrumentDescriptor: InstrumentDescriptor = {
  name: 'default_metric',
  description: 'a simple instrument',
  type: InstrumentType.COUNTER,
  unit: '1',
  valueType: ValueType.DOUBLE,
};

export const defaultInstrumentationScope: InstrumentationScope = {
  name: 'default',
  version: '1.0.0',
  schemaUrl: 'https://opentelemetry.io/schemas/1.7.0'
};

export const commonValues: number[] = [1, -1, 1.0, Infinity, -Infinity, NaN];
export const commonAttributes: MetricAttributes[] = [{}, { 1: '1' }, { a: '2' }, new (class Foo {
  a = '1';
})];

export const sleep = (time: number) =>
  new Promise<void>(resolve => {
    return setTimeout(resolve, time);
  });

export function assertScopeMetrics(
  actual: unknown,
  instrumentationScope: Partial<InstrumentationScope>
): asserts actual is ScopeMetrics {
  const it = actual as ScopeMetrics;
  assertPartialDeepStrictEqual(it.scope, instrumentationScope);
  assert(Array.isArray(it.metrics));
}

export function assertMetricData(
  actual: unknown,
  dataPointType?: DataPointType,
  instrumentDescriptor: Partial<InstrumentDescriptor> | null = defaultInstrumentDescriptor,
  aggregationTemporality?: AggregationTemporality,
): asserts actual is MetricData {
  const it = actual as MetricData;
  if (instrumentDescriptor != null) {
    assertPartialDeepStrictEqual(it.descriptor, instrumentDescriptor);
  }
  if (isNotNullish(dataPointType)) {
    assert.strictEqual(it.dataPointType, dataPointType);
  } else {
    assert(isNotNullish(DataPointType[it.dataPointType]));
  }
  if (aggregationTemporality != null) {
    assert.strictEqual(aggregationTemporality, it.aggregationTemporality);
  }
  assert(Array.isArray(it.dataPoints));
}

export function assertDataPoint(
  actual: unknown,
  attributes: MetricAttributes,
  point: Histogram | number,
  startTime?: HrTime,
  endTime?: HrTime,
): asserts actual is DataPoint<unknown> {
  const it = actual as DataPoint<unknown>;
  assert.deepStrictEqual(it.attributes, attributes);
  assert.deepStrictEqual(it.value, point);
  if (startTime) {
    assert.deepStrictEqual(it.startTime, startTime, 'startTime should be equal');
  } else {
    assert(Array.isArray(it.startTime));
    assert.strictEqual(it.startTime.length, 2, 'startTime should be equal');
  }
  if (endTime) {
    assert.deepStrictEqual(it.endTime, endTime, 'endTime should be equal');
  } else {
    assert(Array.isArray(it.endTime));
    assert.strictEqual(it.endTime.length, 2, 'endTime should be equal');
  }
}

export function assertMeasurementEqual(actual: unknown, expected: Measurement): asserts actual is Measurement {
  // NOTE: Node.js v8 assert.strictEquals treat two NaN as different values.
  if (Number.isNaN(expected.value)) {
    assert(Number.isNaN((actual as Measurement).value));
  } else {
    assert.strictEqual((actual as Measurement).value, expected.value);
  }
  assert.deepStrictEqual((actual as Measurement).attributes, expected.attributes);
  assert.deepStrictEqual((actual as Measurement).context, expected.context);
}

export function assertPartialDeepStrictEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T {
  assert.strictEqual(typeof actual, typeof expected, message);
  if (typeof expected !== 'object' && typeof expected !== 'function') {
    return;
  }
  const ownNames = Object.getOwnPropertyNames(expected);
  for (const ownName of ownNames) {
    assert.deepStrictEqual((actual as any)[ownName], (expected as any)[ownName], `${ownName} not equals: ${message ?? '<no-message>'}`);
  }
}

export class ObservableCallbackDelegate {
  private _delegate?: ObservableCallback;
  setDelegate(delegate: ObservableCallback) {
    this._delegate = delegate;
  }

  getCallback(): ObservableCallback {
    return observableResult => {
      return this._delegate?.(observableResult);
    };
  }
}

export class BatchObservableCallbackDelegate {
  private _delegate?: BatchObservableCallback;
  setDelegate(delegate: BatchObservableCallback) {
    this._delegate = delegate;
  }

  getCallback(): BatchObservableCallback {
    return observableResult => {
      return this._delegate?.(observableResult);
    };
  }
}
