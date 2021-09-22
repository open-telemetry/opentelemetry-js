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
  ObserverResult,
  ValueObserver,
  ValueRecorder,
  ValueType,
} from '@opentelemetry/api-metrics';
import { otlpTypes } from '@opentelemetry/exporter-otlp-http';
import * as metrics from '@opentelemetry/sdk-metrics-base';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as grpc from '@grpc/grpc-js';
import { VERSION } from '@opentelemetry/core';

const meterProvider = new metrics.MeterProvider({
  interval: 30000,
  resource: new Resource({
    service: 'ui',
    version: 1,
    cost: 112.12,
  }),
});

const meter = meterProvider.getMeter('default', '0.0.1');

export function mockCounter(): metrics.Metric<metrics.BoundCounter> & Counter {
  const name = 'int-counter';
  const metric =
    meter['_metrics'].get(name) ||
    meter.createCounter(name, {
      description: 'sample counter description',
      valueType: ValueType.INT,
    });
  metric.clear();
  metric.bind({});
  return metric;
}

export function mockObserver(
  callback: (observerResult: ObserverResult) => void
): metrics.Metric<metrics.BoundCounter> & ValueObserver {
  const name = 'double-observer';
  const metric =
    meter['_metrics'].get(name) ||
    meter.createValueObserver(
      name,
      {
        description: 'sample observer description',
        valueType: ValueType.DOUBLE,
      },
      callback
    );
  metric.clear();
  metric.bind({});
  return metric;
}

export function mockValueRecorder(): metrics.Metric<metrics.BoundValueRecorder> &
  ValueRecorder {
  const name = 'int-recorder';
  const metric =
    meter['_metrics'].get(name) ||
    meter.createValueRecorder(name, {
      description: 'sample recorder description',
      valueType: ValueType.INT,
      boundaries: [0, 100],
    });
  metric.clear();
  metric.bind({});
  return metric;
}

export function ensureExportedAttributesAreCorrect(
  attributes: otlpTypes.opentelemetryProto.common.v1.KeyValue[]
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
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time?: number
) {
  assert.deepStrictEqual(metric, {
    name: 'int-counter',
    description: 'sample counter description',
    unit: '1',
    data: 'intSum',
    intSum: {
      dataPoints: [
        {
          labels: [],
          exemplars: [],
          value: '1',
          startTimeUnixNano: '1592602232694000128',
          timeUnixNano: String(time),
        },
      ],
      isMonotonic: true,
      aggregationTemporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE',
    },
  });
}

export function ensureExportedObserverIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time?: number
) {
  assert.deepStrictEqual(metric, {
    name: 'double-observer',
    description: 'sample observer description',
    unit: '1',
    data: 'doubleGauge',
    doubleGauge: {
      dataPoints: [
        {
          labels: [],
          exemplars: [],
          value: 6,
          startTimeUnixNano: '1592602232694000128',
          timeUnixNano: String(time),
        },
      ],
    },
  });
}

export function ensureExportedValueRecorderIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time?: number,
  explicitBounds: number[] = [Infinity],
  bucketCounts: string[] = ['2', '0']
) {
  assert.deepStrictEqual(metric, {
    name: 'int-recorder',
    description: 'sample recorder description',
    unit: '1',
    data: 'intHistogram',
    intHistogram: {
      dataPoints: [
        {
          labels: [],
          exemplars: [],
          sum: '21',
          count: '2',
          startTimeUnixNano: '1592602232694000128',
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
  resource: otlpTypes.opentelemetryProto.resource.v1.Resource
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
  actual: grpc.Metadata,
  expected: grpc.Metadata
) {
  //ignore user agent
  expected.remove('user-agent');
  actual.remove('user-agent');
  assert.deepStrictEqual(actual.getMap(), expected.getMap());
}
