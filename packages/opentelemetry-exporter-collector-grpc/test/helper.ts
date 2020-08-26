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

import { TraceFlags, ValueType } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
import { Resource } from '@opentelemetry/resources';
import { collectorTypes } from '@opentelemetry/exporter-collector';
import * as assert from 'assert';
import {
  MetricRecord,
  MetricKind,
  SumAggregator,
  MinMaxLastSumCountAggregator,
  HistogramAggregator,
} from '@opentelemetry/metrics';
import * as grpc from 'grpc';

const traceIdArr = [
  31,
  16,
  8,
  220,
  142,
  39,
  14,
  133,
  196,
  10,
  13,
  124,
  57,
  57,
  178,
  120,
];
const spanIdArr = [94, 16, 114, 97, 246, 79, 165, 62];
const parentIdArr = [120, 168, 145, 80, 152, 134, 67, 136];

export function mockCounter(): MetricRecord {
  return {
    descriptor: {
      name: 'test-counter',
      description: 'sample counter description',
      unit: '1',
      metricKind: MetricKind.COUNTER,
      valueType: ValueType.INT,
    },
    labels: {},
    aggregator: new SumAggregator(),
    resource: new Resource({
      service: 'ui',
      version: 1,
      cost: 112.12,
    }),
    instrumentationLibrary: { name: 'default', version: '0.0.1' },
  };
}

export function mockDoubleCounter(): MetricRecord {
  return {
    descriptor: {
      name: 'test-counter',
      description: 'sample counter description',
      unit: '1',
      metricKind: MetricKind.COUNTER,
      valueType: ValueType.DOUBLE,
    },
    labels: {},
    aggregator: new SumAggregator(),
    resource: new Resource({
      service: 'ui',
      version: 1,
      cost: 112.12,
    }),
    instrumentationLibrary: { name: 'default', version: '0.0.1' },
  };
}

export function mockObserver(): MetricRecord {
  return {
    descriptor: {
      name: 'test-observer',
      description: 'sample observer description',
      unit: '2',
      metricKind: MetricKind.VALUE_OBSERVER,
      valueType: ValueType.DOUBLE,
    },
    labels: {},
    aggregator: new MinMaxLastSumCountAggregator(),
    resource: new Resource({
      service: 'ui',
      version: 1,
      cost: 112.12,
    }),
    instrumentationLibrary: { name: 'default', version: '0.0.1' },
  };
}

export function mockValueRecorder(): MetricRecord {
  return {
    descriptor: {
      name: 'test-recorder',
      description: 'sample recorder description',
      unit: '3',
      metricKind: MetricKind.VALUE_RECORDER,
      valueType: ValueType.INT,
    },
    labels: {},
    aggregator: new MinMaxLastSumCountAggregator(),
    resource: new Resource({
      service: 'ui',
      version: 1,
      cost: 112.12,
    }),
    instrumentationLibrary: { name: 'default', version: '0.0.1' },
  };
}

export function mockHistogram(): MetricRecord {
  return {
    descriptor: {
      name: 'test-hist',
      description: 'sample observer description',
      unit: '2',
      metricKind: MetricKind.VALUE_OBSERVER,
      valueType: ValueType.DOUBLE,
    },
    labels: {},
    aggregator: new HistogramAggregator([10, 20]),
    resource: new Resource({
      service: 'ui',
      version: 1,
      cost: 112.12,
    }),
    instrumentationLibrary: { name: 'default', version: '0.0.1' },
  };
}

export const mockedReadableSpan: ReadableSpan = {
  name: 'documentFetch',
  kind: 0,
  spanContext: {
    traceId: '1f1008dc8e270e85c40a0d7c3939b278',
    spanId: '5e107261f64fa53e',
    traceFlags: TraceFlags.SAMPLED,
  },
  parentSpanId: '78a8915098864388',
  startTime: [1574120165, 429803070],
  endTime: [1574120165, 438688070],
  ended: true,
  status: { code: 0 },
  attributes: { component: 'document-load' },
  links: [
    {
      context: {
        traceId: '1f1008dc8e270e85c40a0d7c3939b278',
        spanId: '78a8915098864388',
      },
      attributes: { component: 'document-load' },
    },
  ],
  events: [
    { name: 'fetchStart', time: [1574120165, 429803070] },
    {
      name: 'domainLookupStart',
      time: [1574120165, 429803070],
    },
    { name: 'domainLookupEnd', time: [1574120165, 429803070] },
    {
      name: 'connectStart',
      time: [1574120165, 429803070],
    },
    { name: 'connectEnd', time: [1574120165, 429803070] },
    {
      name: 'requestStart',
      time: [1574120165, 435513070],
    },
    { name: 'responseStart', time: [1574120165, 436923070] },
    {
      name: 'responseEnd',
      time: [1574120165, 438688070],
    },
  ],
  duration: [0, 8885000],
  resource: new Resource({
    service: 'ui',
    version: 1,
    cost: 112.12,
  }),
  instrumentationLibrary: { name: 'default', version: '0.0.1' },
};

export function ensureExportedEventsAreCorrect(
  events: collectorTypes.opentelemetryProto.trace.v1.Span.Event[]
) {
  assert.deepStrictEqual(
    events,
    [
      {
        attributes: [],
        timeUnixNano: '1574120165429803008',
        name: 'fetchStart',
        droppedAttributesCount: 0,
      },
      {
        attributes: [],
        timeUnixNano: '1574120165429803008',
        name: 'domainLookupStart',
        droppedAttributesCount: 0,
      },
      {
        attributes: [],
        timeUnixNano: '1574120165429803008',
        name: 'domainLookupEnd',
        droppedAttributesCount: 0,
      },
      {
        attributes: [],
        timeUnixNano: '1574120165429803008',
        name: 'connectStart',
        droppedAttributesCount: 0,
      },
      {
        attributes: [],
        timeUnixNano: '1574120165429803008',
        name: 'connectEnd',
        droppedAttributesCount: 0,
      },
      {
        attributes: [],
        timeUnixNano: '1574120165435513088',
        name: 'requestStart',
        droppedAttributesCount: 0,
      },
      {
        attributes: [],
        timeUnixNano: '1574120165436923136',
        name: 'responseStart',
        droppedAttributesCount: 0,
      },
      {
        attributes: [],
        timeUnixNano: '1574120165438688000',
        name: 'responseEnd',
        droppedAttributesCount: 0,
      },
    ],
    'exported events are incorrect'
  );
}

export function ensureExportedAttributesAreCorrect(
  attributes: collectorTypes.opentelemetryProto.common.v1.KeyValue[]
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

export function ensureExportedLinksAreCorrect(
  attributes: collectorTypes.opentelemetryProto.trace.v1.Span.Link[]
) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        attributes: [
          {
            key: 'component',
            value: {
              stringValue: 'document-load',
              value: 'stringValue',
            },
          },
        ],
        traceId: Buffer.from(traceIdArr),
        spanId: Buffer.from(parentIdArr),
        traceState: '',
        droppedAttributesCount: 0,
      },
    ],
    'exported links are incorrect'
  );
}

export function ensureExportedSpanIsCorrect(
  span: collectorTypes.opentelemetryProto.trace.v1.Span
) {
  if (span.attributes) {
    ensureExportedAttributesAreCorrect(span.attributes);
  }
  if (span.events) {
    ensureExportedEventsAreCorrect(span.events);
  }
  if (span.links) {
    ensureExportedLinksAreCorrect(span.links);
  }
  assert.deepStrictEqual(
    span.traceId,
    Buffer.from(traceIdArr),
    'traceId is wrong'
  );
  assert.deepStrictEqual(
    span.spanId,
    Buffer.from(spanIdArr),
    'spanId is wrong'
  );
  assert.strictEqual(span.traceState, '', 'traceState is wrong');
  assert.deepStrictEqual(
    span.parentSpanId,
    Buffer.from(parentIdArr),
    'parentIdArr is wrong'
  );
  assert.strictEqual(span.name, 'documentFetch', 'name is wrong');
  assert.strictEqual(span.kind, 'INTERNAL', 'kind is wrong');
  assert.strictEqual(
    span.startTimeUnixNano,
    '1574120165429803008',
    'startTimeUnixNano is wrong'
  );
  assert.strictEqual(
    span.endTimeUnixNano,
    '1574120165438688000',
    'endTimeUnixNano is wrong'
  );
  assert.strictEqual(
    span.droppedAttributesCount,
    0,
    'droppedAttributesCount is wrong'
  );
  assert.strictEqual(span.droppedEventsCount, 0, 'droppedEventsCount is wrong');
  assert.strictEqual(span.droppedLinksCount, 0, 'droppedLinksCount is wrong');
  assert.deepStrictEqual(
    span.status,
    { code: 'Ok', message: '' },
    'status is wrong'
  );
}

export function ensureExportedCounterIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric
) {
  assert.deepStrictEqual(metric.metricDescriptor, {
    name: 'test-counter',
    description: 'sample counter description',
    unit: '1',
    type: 'MONOTONIC_INT64',
    temporality: 'CUMULATIVE',
  });
  assert.deepStrictEqual(metric.doubleDataPoints, []);
  assert.deepStrictEqual(metric.summaryDataPoints, []);
  assert.deepStrictEqual(metric.histogramDataPoints, []);
  assert.ok(metric.int64DataPoints);
  assert.deepStrictEqual(metric.int64DataPoints[0].labels, []);
  assert.deepStrictEqual(metric.int64DataPoints[0].value, '1');
  assert.deepStrictEqual(
    metric.int64DataPoints[0].startTimeUnixNano,
    '1592602232694000128'
  );
}

export function ensureExportedObserverIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric
) {
  assert.deepStrictEqual(metric.metricDescriptor, {
    name: 'test-observer',
    description: 'sample observer description',
    unit: '2',
    type: 'SUMMARY',
    temporality: 'DELTA',
  });

  assert.deepStrictEqual(metric.int64DataPoints, []);
  assert.deepStrictEqual(metric.doubleDataPoints, []);
  assert.deepStrictEqual(metric.histogramDataPoints, []);
  assert.ok(metric.summaryDataPoints);
  assert.deepStrictEqual(metric.summaryDataPoints[0].labels, []);
  assert.deepStrictEqual(metric.summaryDataPoints[0].sum, 9);
  assert.deepStrictEqual(metric.summaryDataPoints[0].count, '2');
  assert.deepStrictEqual(
    metric.summaryDataPoints[0].startTimeUnixNano,
    '1592602232694000128'
  );
  assert.deepStrictEqual(metric.summaryDataPoints[0].percentileValues, [
    { percentile: 0, value: 3 },
    { percentile: 100, value: 6 },
  ]);
}

export function ensureExportedHistogramIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric
) {
  assert.deepStrictEqual(metric.metricDescriptor, {
    name: 'test-hist',
    description: 'sample observer description',
    unit: '2',
    type: 'HISTOGRAM',
    temporality: 'DELTA',
  });
  assert.deepStrictEqual(metric.int64DataPoints, []);
  assert.deepStrictEqual(metric.summaryDataPoints, []);
  assert.deepStrictEqual(metric.doubleDataPoints, []);
  assert.ok(metric.histogramDataPoints);
  assert.deepStrictEqual(metric.histogramDataPoints[0].labels, []);
  assert.deepStrictEqual(metric.histogramDataPoints[0].count, '2');
  assert.deepStrictEqual(metric.histogramDataPoints[0].sum, 21);
  assert.deepStrictEqual(metric.histogramDataPoints[0].buckets, [
    { count: '1', exemplar: null },
    { count: '1', exemplar: null },
    { count: '0', exemplar: null },
  ]);
  assert.deepStrictEqual(metric.histogramDataPoints[0].explicitBounds, [
    10,
    20,
  ]);
  assert.deepStrictEqual(
    metric.histogramDataPoints[0].startTimeUnixNano,
    '1592602232694000128'
  );
}

export function ensureExportedValueRecorderIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric
) {
  assert.deepStrictEqual(metric.metricDescriptor, {
    name: 'test-recorder',
    description: 'sample recorder description',
    unit: '3',
    type: 'SUMMARY',
    temporality: 'DELTA',
  });
  assert.deepStrictEqual(metric.histogramDataPoints, []);
  assert.deepStrictEqual(metric.int64DataPoints, []);
  assert.deepStrictEqual(metric.doubleDataPoints, []);
  assert.ok(metric.summaryDataPoints);
  assert.deepStrictEqual(metric.summaryDataPoints[0].labels, []);
  assert.deepStrictEqual(
    metric.summaryDataPoints[0].startTimeUnixNano,
    '1592602232694000128'
  );
  assert.deepStrictEqual(metric.summaryDataPoints[0].percentileValues, [
    { percentile: 0, value: 5 },
    { percentile: 100, value: 5 },
  ]);
  assert.deepStrictEqual(metric.summaryDataPoints[0].count, '1');
  assert.deepStrictEqual(metric.summaryDataPoints[0].sum, 5);
}

export function ensureResourceIsCorrect(
  resource: collectorTypes.opentelemetryProto.resource.v1.Resource
) {
  assert.deepStrictEqual(resource, {
    attributes: [
      {
        key: 'service.name',
        value: {
          stringValue: 'basic-service',
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
          doubleValue: 1,
          value: 'doubleValue',
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
