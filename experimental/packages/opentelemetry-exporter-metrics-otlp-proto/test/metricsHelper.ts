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
} from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import {
  AggregationTemporality,
  ExplicitBucketHistogramAggregation,
  MeterProvider,
  MetricReader
} from '@opentelemetry/sdk-metrics-base';
import { IExportMetricsServiceRequest, IKeyValue, IMetric } from '@opentelemetry/otlp-transformer';
import { Stream } from 'stream';

export class TestMetricReader extends MetricReader {
  selectAggregationTemporality() {
    return AggregationTemporality.CUMULATIVE;
  }

  protected onForceFlush(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected onShutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

const testResource = Resource.default().merge(new Resource({
  service: 'ui',
  version: 1,
  cost: 112.12,
}));

let meterProvider = new MeterProvider({ resource: testResource });

let reader = new TestMetricReader();
meterProvider.addMetricReader(reader);

let meter = meterProvider.getMeter('default', '0.0.1');

export async function collect() {
  return (await reader.collect())!;
}

export function setUp() {
  meterProvider = new MeterProvider({ resource: testResource });
  reader = new TestMetricReader();
  meterProvider.addMetricReader(
    reader
  );
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
  const observableGauge = meter.createObservableGauge(
    name,
    {
      description: 'sample observable gauge description',
      valueType: ValueType.DOUBLE,
    },
  );
  observableGauge.addCallback(callback);

  return observableGauge;
}

export function mockHistogram(): Histogram {
  const name = 'int-histogram';
  meterProvider.addView({ aggregation: new ExplicitBucketHistogramAggregation([0, 100]) });

  return meter.createHistogram(name, {
    description: 'sample histogram description',
    valueType: ValueType.INT,
  });
}

export function ensureProtoAttributesAreCorrect(
  attributes: IKeyValue[]
) {
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
  time?: number,
  startTime?: number
) {
  assert.deepStrictEqual(metric, {
    name: 'int-counter',
    description: 'sample counter description',
    unit: '',
    sum: {
      dataPoints: [
        {
          asInt: '1',
          startTimeUnixNano: String(startTime),
          timeUnixNano: String(time),
        },
      ],
      isMonotonic: true,
      aggregationTemporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE',
    },
  });
}

export function ensureExportedObservableGaugeIsCorrect(
  metric: IMetric,
  time?: number,
  startTime?: number
) {
  assert.deepStrictEqual(metric, {
    name: 'double-observable-gauge',
    description: 'sample observable gauge description',
    unit: '',
    gauge: {
      dataPoints: [
        {
          asDouble: 6,
          startTimeUnixNano: String(startTime),
          timeUnixNano: String(time),
        },
      ],
    },
  });
}

export function ensureExportedHistogramIsCorrect(
  metric: IMetric,
  time?: number,
  startTime?: number,
  explicitBounds: number[] = [Infinity],
  bucketCounts: string[] = ['2', '0']
) {
  assert.deepStrictEqual(metric, {
    name: 'int-histogram',
    description: 'sample histogram description',
    unit: '',
    histogram: {
      dataPoints: [
        {
          sum: 21,
          count: '2',
          min: 7,
          max: 14,
          startTimeUnixNano: String(startTime),
          timeUnixNano: String(time),
          bucketCounts,
          explicitBounds,
        },
      ],
      aggregationTemporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE',
    },
  });
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
  constructor(private _code: number, private _msg?: string) {
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
