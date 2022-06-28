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
} from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import { InstrumentationScope, VERSION } from '@opentelemetry/core';
import {
  AggregationTemporality,
  ExplicitBucketHistogramAggregation,
  MeterProvider,
  MetricReader
} from '@opentelemetry/sdk-metrics-base';
import {
  IExportMetricsServiceRequest,
  IKeyValue,
  IMetric,
  IResource
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

  selectAggregationTemporality() {
    return AggregationTemporality.CUMULATIVE;
  }
}

const defaultResource = Resource.default().merge(new Resource({
  service: 'ui',
  version: 1,
  cost: 112.12,
}));

let meterProvider = new MeterProvider({ resource: defaultResource });
let reader = new TestMetricReader();
meterProvider.addMetricReader(
  reader
);
let meter = meterProvider.getMeter('default', '0.0.1');

export async function collect() {
  return (await reader.collect())!;
}

export function setUp() {
  meterProvider = new MeterProvider({ resource: defaultResource });
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
  callback: (observableResult: ObservableResult) => void,
  name = 'double-observable-gauge'
): ObservableGauge {
  const observableGauge = meter.createObservableGauge(
    name,
    {
      description: 'sample observable gauge description',
      valueType: ValueType.DOUBLE,
    }
  );
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
  const observableCounter = meter.createObservableCounter(
    name,
    {
      description: 'sample observable counter description',
      valueType: ValueType.DOUBLE,
    }
  );
  observableCounter.addCallback(callback);

  return observableCounter;
}

export function mockObservableUpDownCounter(
  callback: (observableResult: ObservableResult) => void,
  name = 'double-up-down-observable-counter'
): ObservableUpDownCounter {
  const observableUpDownCounter = meter.createObservableUpDownCounter(
    name,
    {
      description: 'sample observable up down counter description',
      valueType: ValueType.DOUBLE,
    },
  );
  observableUpDownCounter.addCallback(callback);

  return observableUpDownCounter;
}

export function mockHistogram(): Histogram {
  const name = 'int-histogram';

  meterProvider.addView({
    aggregation: new ExplicitBucketHistogramAggregation([0, 100])
  },
  {
    instrument: {
      name: name
    }
  });

  return meter.createHistogram(name, {
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

export function ensureAttributesAreCorrect(
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

export function ensureWebResourceIsCorrect(
  resource: IResource
) {
  assert.strictEqual(resource.attributes.length, 7);
  assert.strictEqual(resource.attributes[0].key, 'service.name');
  assert.strictEqual(resource.attributes[0].value.stringValue, 'unknown_service');
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
          attributes: [],
          asInt: 1,
          startTimeUnixNano: startTime,
          timeUnixNano: time,
        },
      ],
      isMonotonic: true,
      aggregationTemporality: 2,
    },
  });
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
  time: number,
  startTime: number,
  value: number,
  name = 'double-observable-gauge'
) {
  assert.deepStrictEqual(metric, {
    name,
    description: 'sample observable gauge description',
    unit: '',
    gauge: {
      dataPoints: [
        {
          attributes: [],
          asDouble: value,
          startTimeUnixNano: startTime,
          timeUnixNano: time,
        },
      ]
    },
  });
}

export function ensureObservableCounterIsCorrect(
  metric: IMetric,
  time: number,
  startTime: number,
  value: number,
  name = 'double-observable-counter'
) {
  assert.deepStrictEqual(metric, {
    name,
    description: 'sample observable counter description',
    unit: '',
    doubleSum: {
      isMonotonic: true,
      dataPoints: [
        {
          attributes: [],
          value,
          startTimeUnixNano: startTime,
          timeUnixNano: time,
        },
      ],
      aggregationTemporality: 2
    },
  });
}

export function ensureObservableUpDownCounterIsCorrect(
  metric: IMetric,
  time: number,
  startTime: number,
  value: number,
  name = 'double-up-down-observable-counter'
) {
  assert.deepStrictEqual(metric, {
    name,
    description: 'sample observable up down counter description',
    unit: '',
    doubleSum: {
      isMonotonic: false,
      dataPoints: [
        {
          labels: [],
          value,
          startTimeUnixNano: startTime,
          timeUnixNano: time,
        },
      ],
      aggregationTemporality: 2
    },
  });
}

export function ensureHistogramIsCorrect(
  metric: IMetric,
  time: number,
  startTime: number,
  explicitBounds: (number | null)[] = [Infinity],
  bucketCounts: number[] = [2, 0]
) {
  assert.deepStrictEqual(metric, {
    name: 'int-histogram',
    description: 'sample histogram description',
    unit: '',
    histogram: {
      dataPoints: [
        {
          attributes: [],
          sum: 21,
          count: 2,
          min: 7,
          max: 14,
          startTimeUnixNano: startTime,
          timeUnixNano: time,
          bucketCounts,
          explicitBounds,
        },
      ],
      aggregationTemporality: 2
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
