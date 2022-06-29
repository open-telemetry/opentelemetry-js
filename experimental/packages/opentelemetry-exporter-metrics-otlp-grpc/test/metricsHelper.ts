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

import { Counter, Histogram, ObservableGauge, ObservableResult, ValueType } from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as grpc from '@grpc/grpc-js';
import { VERSION } from '@opentelemetry/core';
import {
  AggregationTemporality,
  ExplicitBucketHistogramAggregation,
  MeterProvider,
  MetricReader,
} from '@opentelemetry/sdk-metrics-base';
import { IKeyValue, IMetric, IResource } from '@opentelemetry/otlp-transformer';

class TestMetricReader extends MetricReader {
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

export function ensureExportedAttributesAreCorrect(
  attributes: IKeyValue[]
) {
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
  time?: number,
  startTime?: number
) {
  assert.deepStrictEqual(metric, {
    name: 'int-counter',
    description: 'sample counter description',
    unit: '',
    data: 'sum',
    sum: {
      dataPoints: [
        {
          attributes: [],
          exemplars: [],
          value: 'asInt',
          asInt: '1',
          flags: 0,
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
    data: 'gauge',
    gauge: {
      dataPoints: [
        {
          attributes: [],
          exemplars: [],
          value: 'asDouble',
          asDouble: 6,
          flags: 0,
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
    data: 'histogram',
    histogram: {
      dataPoints: [
        {
          attributes: [],
          exemplars: [],
          flags: 0,
          _sum: 'sum',
          _min: 'min',
          _max: 'max',
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

export function ensureResourceIsCorrect(
  resource: IResource
) {
  assert.deepStrictEqual(resource, {
    attributes: [
      {
        'key': 'service.name',
        'value': {
          'stringValue': `unknown_service:${process.argv0}`,
          'value': 'stringValue'
        }
      },
      {
        'key': 'telemetry.sdk.language',
        'value': {
          'stringValue': 'nodejs',
          'value': 'stringValue'
        }
      },
      {
        'key': 'telemetry.sdk.name',
        'value': {
          'stringValue': 'opentelemetry',
          'value': 'stringValue'
        }
      },
      {
        'key': 'telemetry.sdk.version',
        'value': {
          'stringValue': VERSION,
          'value': 'stringValue'
        }
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
