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
  ObservableGauge,
  HrTime,
} from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
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
} from '@opentelemetry/otlp-transformer';
import { Stream } from 'stream';

export class TestMetricReader extends MetricReader {
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
  const name = 'int-histogram';

  return meter.createHistogram(name, {
    description: 'sample histogram description',
    valueType: ValueType.INT,
  });
}

export function ensureProtoAttributesAreCorrect(attributes: IKeyValue[]) {
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

export function ensureExportedCounterIsCorrect(
  metric: IMetric,
  time: HrTime,
  startTime: HrTime
) {
  assert.strictEqual(metric.name, 'int-counter');
  assert.strictEqual(metric.description, 'sample counter description');
  assert.strictEqual(metric.unit, '');
  assert.strictEqual(metric.sum?.dataPoints.length, 1);
  assert.strictEqual(metric.sum?.isMonotonic, true);
  assert.strictEqual(
    metric.sum?.aggregationTemporality,
    'AGGREGATION_TEMPORALITY_CUMULATIVE'
  );

  const [dp] = metric.sum.dataPoints;
  assert.strictEqual(dp.asInt, '1');
  assert.deepStrictEqual(dp.startTimeUnixNano, encodeAsString(startTime));
  assert.deepStrictEqual(dp.timeUnixNano, encodeAsString(time));
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
  assert.strictEqual(dp.asDouble, 6);
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
    metric.histogram.aggregationTemporality,
    'AGGREGATION_TEMPORALITY_CUMULATIVE'
  );

  const [dp] = metric.histogram.dataPoints;

  assert.strictEqual(dp.sum, 21);
  assert.strictEqual(dp.count, '2');
  assert.strictEqual(dp.min, 7);
  assert.strictEqual(dp.max, 14);
  assert.deepStrictEqual(dp.explicitBounds, explicitBounds);
  assert.deepStrictEqual(dp.bucketCounts, bucketCounts);
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

export class MockedResponse extends Stream {
  constructor(
    private _code: number,
    private _msg?: string
  ) {
    super();
  }

  send(data: string) {
    this.emit('data', data);
    this.emit('end');
  }

  get statusCode() {
    return this._code;
  }

  get statusMessage() {
    return this._msg;
  }
}
