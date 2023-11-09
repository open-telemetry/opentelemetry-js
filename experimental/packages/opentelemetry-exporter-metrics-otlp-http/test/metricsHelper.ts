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
  ObservableResult,
  Histogram,
  ValueType,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  HrTime,
} from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import { InstrumentationScope, VERSION } from '@opentelemetry/core';
import {
  ExplicitBucketHistogramAggregation,
  MeterProvider,
  MetricReader,
  View,
} from '@opentelemetry/sdk-metrics';
import {
  encodeAsString,
  IExportMetricsServiceRequest,
  IKeyValue,
  IMetric,
  IResource,
} from '@opentelemetry/otlp-transformer';

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: function (arr: []) {
      return new Uint8Array(arr);
    },
  };
}

class TestMetricReader extends MetricReader {
  protected onForceFlush(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected onShutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export const HISTOGRAM_AGGREGATION_VIEW = new View({
  aggregation: new ExplicitBucketHistogramAggregation([0, 100]),
  instrumentName: 'int-histogram',
});

const defaultResource = Resource.default().merge(
  new Resource({
    service: 'ui',
    version: 1,
    cost: 112.12,
  })
);

let meterProvider = new MeterProvider({ resource: defaultResource });
let reader = new TestMetricReader();
meterProvider.addMetricReader(reader);
let meter = meterProvider.getMeter('default', '0.0.1');

export async function collect() {
  return (await reader.collect())!;
}

export function setUp(views?: View[]) {
  meterProvider = new MeterProvider({ resource: defaultResource, views });
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
  callback: (observableResult: ObservableResult) => void,
  name = 'double-observable-gauge'
): ObservableGauge {
  const observableGauge = meter.createObservableGauge(name, {
    description: 'sample observable gauge description',
    valueType: ValueType.DOUBLE,
  });
  observableGauge.addCallback(callback);

  return observableGauge;
}

export function mockDoubleCounter(): Counter {
  const name = 'double-counter';
  return meter.createCounter(name, {
    description: 'sample counter description',
    valueType: ValueType.DOUBLE,
  });
}

export function mockObservableCounter(
  callback: (observableResult: ObservableResult) => void,
  name = 'double-observable-counter'
): ObservableCounter {
  const observableCounter = meter.createObservableCounter(name, {
    description: 'sample observable counter description',
    valueType: ValueType.DOUBLE,
  });
  observableCounter.addCallback(callback);

  return observableCounter;
}

export function mockObservableUpDownCounter(
  callback: (observableResult: ObservableResult) => void,
  name = 'double-up-down-observable-counter'
): ObservableUpDownCounter {
  const observableUpDownCounter = meter.createObservableUpDownCounter(name, {
    description: 'sample observable up down counter description',
    valueType: ValueType.DOUBLE,
  });
  observableUpDownCounter.addCallback(callback);

  return observableUpDownCounter;
}

export function mockHistogram(): Histogram {
  return meter.createHistogram('int-histogram', {
    description: 'sample histogram description',
    valueType: ValueType.INT,
  });
}

export const mockedResources: Resource[] = [
  new Resource({ name: 'resource 1' }),
  new Resource({ name: 'resource 2' }),
];

export const mockedInstrumentationLibraries: InstrumentationScope[] = [
  {
    name: 'lib1',
    version: '0.0.1',
  },
  {
    name: 'lib2',
    version: '0.0.2',
  },
];

export function ensureAttributesAreCorrect(attributes: IKeyValue[]) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        key: 'component',
        value: {
          stringValue: 'document-load',
        },
      },
    ],
    'attributes are incorrect'
  );
}

export function ensureWebResourceIsCorrect(resource: IResource) {
  assert.strictEqual(resource.attributes.length, 7);
  assert.strictEqual(resource.attributes[0].key, 'service.name');
  assert.strictEqual(
    resource.attributes[0].value.stringValue,
    'unknown_service'
  );
  assert.strictEqual(resource.attributes[1].key, 'telemetry.sdk.language');
  assert.strictEqual(resource.attributes[1].value.stringValue, 'webjs');
  assert.strictEqual(resource.attributes[2].key, 'telemetry.sdk.name');
  assert.strictEqual(resource.attributes[2].value.stringValue, 'opentelemetry');
  assert.strictEqual(resource.attributes[3].key, 'telemetry.sdk.version');
  assert.strictEqual(resource.attributes[3].value.stringValue, VERSION);
  assert.strictEqual(resource.attributes[4].key, 'service');
  assert.strictEqual(resource.attributes[4].value.stringValue, 'ui');
  assert.strictEqual(resource.attributes[5].key, 'version');
  assert.strictEqual(resource.attributes[5].value.intValue, 1);
  assert.strictEqual(resource.attributes[6].key, 'cost');
  assert.strictEqual(resource.attributes[6].value.doubleValue, 112.12);
  assert.strictEqual(resource.droppedAttributesCount, 0);
}

export function ensureCounterIsCorrect(
  metric: IMetric,
  time: HrTime,
  startTime: HrTime
) {
  assert.strictEqual(metric.name, 'int-counter');
  assert.strictEqual(metric.description, 'sample counter description');
  assert.strictEqual(metric.unit, '');
  assert.strictEqual(metric.sum?.dataPoints.length, 1);
  assert.strictEqual(metric.sum?.isMonotonic, true);
  assert.strictEqual(metric.sum?.aggregationTemporality, 2);

  const [dp] = metric.sum.dataPoints;

  assert.deepStrictEqual(dp.attributes, []);
  assert.strictEqual(dp.asInt, 1);
  assert.deepStrictEqual(dp.startTimeUnixNano, encodeAsString(startTime));
  assert.deepStrictEqual(dp.timeUnixNano, encodeAsString(time));
}

export function ensureDoubleCounterIsCorrect(
  metric: IMetric,
  time: number,
  endTime: number
) {
  assert.deepStrictEqual(metric, {
    name: 'double-counter',
    description: 'sample counter description',
    unit: '',
    doubleSum: {
      dataPoints: [
        {
          labels: [],
          value: 8,
          startTimeUnixNano: endTime,
          timeUnixNano: time,
        },
      ],
      isMonotonic: true,
      aggregationTemporality: 2,
    },
  });
}

export function ensureObservableGaugeIsCorrect(
  metric: IMetric,
  time: HrTime,
  startTime: HrTime,
  value: number,
  name = 'double-observable-gauge'
) {
  assert.strictEqual(metric.name, name);
  assert.strictEqual(metric.description, 'sample observable gauge description');
  assert.strictEqual(metric.unit, '');
  assert.strictEqual(metric.gauge?.dataPoints.length, 1);

  const [dp] = metric.gauge.dataPoints;

  assert.deepStrictEqual(dp.attributes, []);
  assert.strictEqual(dp.asDouble, value);

  assert.deepStrictEqual(dp.startTimeUnixNano, encodeAsString(startTime));
  assert.deepStrictEqual(dp.timeUnixNano, encodeAsString(time));
}

export function ensureHistogramIsCorrect(
  metric: IMetric,
  time: HrTime,
  startTime: HrTime,
  explicitBounds: (number | null)[] = [Infinity],
  bucketCounts: number[] = [2, 0]
) {
  assert.strictEqual(metric.name, 'int-histogram');
  assert.strictEqual(metric.description, 'sample histogram description');
  assert.strictEqual(metric.unit, '');
  assert.strictEqual(metric.histogram?.dataPoints.length, 1);
  assert.strictEqual(metric.histogram?.aggregationTemporality, 2);

  const [dp] = metric.histogram.dataPoints;

  assert.deepStrictEqual(dp.attributes, []);
  assert.strictEqual(dp.sum, 21);
  assert.strictEqual(dp.count, 2);
  assert.strictEqual(dp.min, 7);
  assert.strictEqual(dp.max, 14);
  assert.deepStrictEqual(dp.bucketCounts, bucketCounts);
  assert.deepStrictEqual(dp.explicitBounds, explicitBounds);

  assert.deepStrictEqual(dp.startTimeUnixNano, encodeAsString(startTime));
  assert.deepStrictEqual(dp.timeUnixNano, encodeAsString(time));
}

export function ensureExportMetricsServiceRequestIsSet(
  json: IExportMetricsServiceRequest
) {
  const resourceMetrics = json.resourceMetrics;
  assert.strictEqual(
    resourceMetrics.length,
    1,
    'resourceMetrics has incorrect length'
  );

  const resource = resourceMetrics[0].resource;
  assert.ok(resource, 'resource is missing');

  const scopeMetrics = resourceMetrics[0].scopeMetrics;
  assert.strictEqual(scopeMetrics?.length, 1, 'scopeMetrics is missing');

  const scope = scopeMetrics[0].scope;
  assert.ok(scope, 'scope is missing');

  const metrics = resourceMetrics[0].scopeMetrics[0].metrics;
  assert.strictEqual(metrics.length, 3, 'Metrics are missing');
}

export function ensureHeadersContain(
  actual: { [key: string]: string },
  expected: { [key: string]: string }
) {
  Object.entries(expected).forEach(([k, v]) => {
    assert.strictEqual(
      v,
      actual[k],
      `Expected ${actual} to contain ${k}: ${v}`
    );
  });
}
