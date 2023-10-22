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

import {
  Counter,
  Histogram,
  HrTime,
  ObservableGauge,
  ObservableResult,
  ValueType,
} from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as grpc from '@grpc/grpc-js';
import { VERSION } from '@opentelemetry/core';
import {
  ExplicitBucketHistogramAggregation,
  MeterProvider,
  MetricReader,
  View,
} from '@opentelemetry/sdk-metrics';
import {
  encodeAsString,
  IKeyValue,
  IMetric,
  IResource,
} from '@opentelemetry/otlp-transformer';

class TestMetricReader extends MetricReader {
  protected onForceFlush(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected onShutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

const testResource = new Resource({
  service: 'ui',
  version: 1,
  cost: 112.12,
});

let meterProvider = new MeterProvider({ resource: testResource });

let reader = new TestMetricReader();
meterProvider.addMetricReader(reader);

let meter = meterProvider.getMeter('default', '0.0.1');

export async function collect() {
  return (await reader.collect())!;
}

export function setUp() {
  meterProvider = new MeterProvider({
    resource: testResource,
    views: [
      new View({
        aggregation: new ExplicitBucketHistogramAggregation([0, 100]),
        instrumentName: 'int-histogram',
      }),
    ],
  });
  reader = new TestMetricReader();
  meterProvider.addMetricReader(reader);
  meter = meterProvider.getMeter('default', '0.0.1');
}

export async function shutdown() {
  await meterProvider.shutdown();
}

export function mockCounter(): Counter {
  const name = 'int-counter';
  return meter.createCounter(name, {
    description: 'sample counter description',
    valueType: ValueType.INT,
  });
}

export function mockObservableGauge(
  callback: (observableResult: ObservableResult) => void
): ObservableGauge {
  const name = 'double-observable-gauge';
  const observableGauge = meter.createObservableGauge(name, {
    description: 'sample observable gauge description',
    valueType: ValueType.DOUBLE,
  });
  observableGauge.addCallback(callback);

  return observableGauge;
}

export function mockHistogram(): Histogram {
  return meter.createHistogram('int-histogram', {
    description: 'sample histogram description',
    valueType: ValueType.INT,
  });
}

export function ensureExportedAttributesAreCorrect(attributes: IKeyValue[]) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        key: 'component',
        value: {
          stringValue: 'document-load',
          value: 'stringValue',
        },
      },
    ],
    'exported attributes are incorrect'
  );
}

export function ensureExportedCounterIsCorrect(
  metric: IMetric,
  time: HrTime,
  startTime: HrTime
) {
  assert.strictEqual(metric.name, 'int-counter');
  assert.strictEqual(metric.description, 'sample counter description');
  assert.strictEqual(metric.unit, '');
  assert.strictEqual(metric.sum?.dataPoints.length, 1);
  assert.strictEqual(
    metric.sum?.aggregationTemporality,
    'AGGREGATION_TEMPORALITY_CUMULATIVE'
  );
  assert.strictEqual(metric.sum?.isMonotonic, true);

  const [dp] = metric.sum.dataPoints;

  assert.deepStrictEqual(dp.attributes, []);
  assert.deepStrictEqual(dp.exemplars, []);
  assert.strictEqual(dp.asInt, '1');
  assert.strictEqual(dp.flags, 0);

  assert.deepStrictEqual(dp.startTimeUnixNano, encodeAsString(startTime));
  assert.deepStrictEqual(dp.timeUnixNano as string, encodeAsString(time));
}

export function ensureExportedObservableGaugeIsCorrect(
  metric: IMetric,
  time: HrTime,
  startTime: HrTime
) {
  assert.strictEqual(metric.name, 'double-observable-gauge');
  assert.strictEqual(metric.description, 'sample observable gauge description');
  assert.strictEqual(metric.unit, '');
  assert.strictEqual(metric.gauge?.dataPoints.length, 1);

  const [dp] = metric.gauge.dataPoints;

  assert.deepStrictEqual(dp.attributes, []);
  assert.deepStrictEqual(dp.exemplars, []);
  assert.strictEqual(dp.asDouble, 6);
  assert.strictEqual(dp.flags, 0);

  assert.deepStrictEqual(dp.startTimeUnixNano, encodeAsString(startTime));
  assert.deepStrictEqual(dp.timeUnixNano, encodeAsString(time));
}

export function ensureExportedHistogramIsCorrect(
  metric: IMetric,
  time: HrTime,
  startTime: HrTime,
  explicitBounds: number[] = [Infinity],
  bucketCounts: string[] = ['2', '0']
) {
  assert.strictEqual(metric.name, 'int-histogram');
  assert.strictEqual(metric.description, 'sample histogram description');
  assert.strictEqual(metric.unit, '');
  assert.strictEqual(metric.histogram?.dataPoints.length, 1);
  assert.strictEqual(
    metric.histogram?.aggregationTemporality,
    'AGGREGATION_TEMPORALITY_CUMULATIVE'
  );

  const [dp] = metric.histogram.dataPoints;

  assert.deepStrictEqual(dp.attributes, []);
  assert.deepStrictEqual(dp.exemplars, []);
  assert.strictEqual(dp.flags, 0);
  assert.strictEqual(dp.sum, 21);
  assert.strictEqual(dp.count, '2');
  assert.strictEqual(dp.min, 7);
  assert.strictEqual(dp.max, 14);

  assert.deepStrictEqual(dp.startTimeUnixNano, encodeAsString(startTime));
  assert.deepStrictEqual(dp.timeUnixNano, encodeAsString(time));
  assert.deepStrictEqual(dp.bucketCounts, bucketCounts);
  assert.deepStrictEqual(dp.explicitBounds, explicitBounds);
}

export function ensureResourceIsCorrect(resource: IResource) {
  assert.deepStrictEqual(resource, {
    attributes: [
      {
        key: 'service.name',
        value: {
          stringValue: `unknown_service:${process.argv0}`,
          value: 'stringValue',
        },
      },
      {
        key: 'telemetry.sdk.language',
        value: {
          stringValue: 'nodejs',
          value: 'stringValue',
        },
      },
      {
        key: 'telemetry.sdk.name',
        value: {
          stringValue: 'opentelemetry',
          value: 'stringValue',
        },
      },
      {
        key: 'telemetry.sdk.version',
        value: {
          stringValue: VERSION,
          value: 'stringValue',
        },
      },
      {
        key: 'service',
        value: {
          stringValue: 'ui',
          value: 'stringValue',
        },
      },
      {
        key: 'version',
        value: {
          intValue: '1',
          value: 'intValue',
        },
      },
      {
        key: 'cost',
        value: {
          doubleValue: 112.12,
          value: 'doubleValue',
        },
      },
    ],
    droppedAttributesCount: 0,
  });
}

export function ensureMetadataIsCorrect(
  actual?: grpc.Metadata,
  expected?: grpc.Metadata
) {
  //ignore user agent
  expected?.remove('user-agent');
  actual?.remove('user-agent');
  assert.deepStrictEqual(actual?.getMap(), expected?.getMap() ?? {});
}
