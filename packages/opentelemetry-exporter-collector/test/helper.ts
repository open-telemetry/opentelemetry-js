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
import * as assert from 'assert';
import { opentelemetryProto } from '../src/types';
import * as collectorTypes from '../src/types';
import {
  MetricRecord,
  MetricKind,
  SumAggregator,
  MinMaxLastSumCountAggregator,
  HistogramAggregator,
} from '@opentelemetry/metrics';
import { InstrumentationLibrary } from '@opentelemetry/core';

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: function (arr: []) {
      return new Uint8Array(arr);
    },
  };
}

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

const traceIdBase64 = 'HxAI3I4nDoXECg18OTmyeA==';
const spanIdBase64 = 'XhByYfZPpT4=';
const parentIdBase64 = 'eKiRUJiGQ4g=';

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

export const mockedResources: Resource[] = [
  new Resource({ name: 'resource 1' }),
  new Resource({ name: 'resource 2' }),
];

export const mockedInstrumentationLibraries: InstrumentationLibrary[] = [
  {
    name: 'lib1',
    version: '0.0.1',
  },
  {
    name: 'lib2',
    version: '0.0.2',
  },
];

export const basicTrace: ReadableSpan[] = [
  {
    name: 'span1',
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
    attributes: {},
    links: [],
    events: [],
    duration: [0, 8885000],
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
  {
    name: 'span2',
    kind: 0,
    spanContext: {
      traceId: '1f1008dc8e270e85c40a0d7c3939b278',
      spanId: 'f64fa53e5e107261',
      traceFlags: TraceFlags.SAMPLED,
    },
    parentSpanId: '78a8915098864388',
    startTime: [1575120165, 439803070],
    endTime: [1575120165, 448688070],
    ended: true,
    status: { code: 0 },
    attributes: {},
    links: [],
    events: [],
    duration: [0, 8775000],
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
  {
    name: 'span3',
    kind: 0,
    spanContext: {
      traceId: '1f1008dc8e270e85c40a0d7c3939b278',
      spanId: '07261f64fa53e5e1',
      traceFlags: TraceFlags.SAMPLED,
    },
    parentSpanId: 'a891578098864388',
    startTime: [1575120165, 439803070],
    endTime: [1575120165, 448688070],
    ended: true,
    status: { code: 0 },
    attributes: {},
    links: [],
    events: [],
    duration: [0, 8775000],
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
];

export const multiResourceTrace: ReadableSpan[] = [
  {
    ...basicTrace[0],
    resource: mockedResources[0],
  },
  {
    ...basicTrace[1],
    resource: mockedResources[1],
  },
  {
    ...basicTrace[2],
    resource: mockedResources[1],
  },
];

export const multiResourceMetrics: MetricRecord[] = [
  {
    ...mockCounter(),
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
  {
    ...mockObserver(),
    resource: mockedResources[1],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
  {
    ...mockCounter(),
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
];

export const multiInstrumentationLibraryMetrics: MetricRecord[] = [
  {
    ...mockCounter(),
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
  {
    ...mockObserver(),
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[1],
  },
  {
    ...mockCounter(),
    resource: mockedResources[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
];

export const multiInstrumentationLibraryTrace: ReadableSpan[] = [
  {
    ...basicTrace[0],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
  {
    ...basicTrace[1],
    instrumentationLibrary: mockedInstrumentationLibraries[0],
  },
  {
    ...basicTrace[2],
    instrumentationLibrary: mockedInstrumentationLibraries[1],
  },
];

export function ensureEventsAreCorrect(
  events: opentelemetryProto.trace.v1.Span.Event[]
) {
  assert.deepStrictEqual(
    events,
    [
      {
        timeUnixNano: 1574120165429803000,
        name: 'fetchStart',
        attributes: [],
        droppedAttributesCount: 0,
      },
      {
        timeUnixNano: 1574120165429803000,
        name: 'domainLookupStart',
        attributes: [],
        droppedAttributesCount: 0,
      },
      {
        timeUnixNano: 1574120165429803000,
        name: 'domainLookupEnd',
        attributes: [],
        droppedAttributesCount: 0,
      },
      {
        timeUnixNano: 1574120165429803000,
        name: 'connectStart',
        attributes: [],
        droppedAttributesCount: 0,
      },
      {
        timeUnixNano: 1574120165429803000,
        name: 'connectEnd',
        attributes: [],
        droppedAttributesCount: 0,
      },
      {
        timeUnixNano: 1574120165435513000,
        name: 'requestStart',
        attributes: [],
        droppedAttributesCount: 0,
      },
      {
        timeUnixNano: 1574120165436923100,
        name: 'responseStart',
        attributes: [],
        droppedAttributesCount: 0,
      },
      {
        timeUnixNano: 1574120165438688000,
        name: 'responseEnd',
        attributes: [],
        droppedAttributesCount: 0,
      },
    ],
    'events are incorrect'
  );
}

export function ensureAttributesAreCorrect(
  attributes: opentelemetryProto.common.v1.KeyValue[]
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

export function ensureLinksAreCorrect(
  attributes: opentelemetryProto.trace.v1.Span.Link[]
) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        traceId: traceIdBase64,
        spanId: parentIdBase64,
        attributes: [
          {
            key: 'component',
            value: {
              stringValue: 'document-load',
            },
          },
        ],
        droppedAttributesCount: 0,
      },
    ],
    'links are incorrect'
  );
}

export function ensureSpanIsCorrect(
  span: collectorTypes.opentelemetryProto.trace.v1.Span
) {
  if (span.attributes) {
    ensureAttributesAreCorrect(span.attributes);
  }
  if (span.events) {
    ensureEventsAreCorrect(span.events);
  }
  if (span.links) {
    ensureLinksAreCorrect(span.links);
  }
  assert.deepStrictEqual(span.traceId, traceIdBase64, 'traceId is wrong');
  assert.deepStrictEqual(span.spanId, spanIdBase64, 'spanId is wrong');
  assert.deepStrictEqual(
    span.parentSpanId,
    parentIdBase64,
    'parentIdArr is wrong'
  );
  assert.strictEqual(span.name, 'documentFetch', 'name is wrong');
  assert.strictEqual(
    span.kind,
    opentelemetryProto.trace.v1.Span.SpanKind.INTERNAL,
    'kind is wrong'
  );
  assert.strictEqual(
    span.startTimeUnixNano,
    1574120165429803008,
    'startTimeUnixNano is wrong'
  );
  assert.strictEqual(
    span.endTimeUnixNano,
    1574120165438688000,
    'endTimeUnixNano is wrong'
  );
  assert.strictEqual(
    span.droppedAttributesCount,
    0,
    'droppedAttributesCount is wrong'
  );
  assert.strictEqual(span.droppedEventsCount, 0, 'droppedEventsCount is wrong');
  assert.strictEqual(span.droppedLinksCount, 0, 'droppedLinksCount is wrong');
  assert.deepStrictEqual(span.status, { code: 0 }, 'status is wrong');
}

export function ensureWebResourceIsCorrect(
  resource: collectorTypes.opentelemetryProto.resource.v1.Resource
) {
  assert.deepStrictEqual(resource, {
    attributes: [
      {
        key: 'service.name',
        value: {
          stringValue: 'bar',
        },
      },
      {
        key: 'service',
        value: {
          stringValue: 'ui',
        },
      },
      {
        key: 'version',
        value: {
          doubleValue: 1,
        },
      },
      {
        key: 'cost',
        value: {
          doubleValue: 112.12,
        },
      },
    ],
    droppedAttributesCount: 0,
  });
}

export function ensureCounterIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric,
  time: number
) {
  assert.deepStrictEqual(metric, {
    metricDescriptor: {
      name: 'test-counter',
      description: 'sample counter description',
      unit: '1',
      type:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorType
          .MONOTONIC_INT64,
      temporality:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorTemporality
          .CUMULATIVE,
    },
    int64DataPoints: [
      {
        labels: [],
        value: 1,
        startTimeUnixNano: 1592602232694000000,
        timeUnixNano: time,
      },
    ],
  });
}

export function ensureDoubleCounterIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric,
  time: number
) {
  assert.deepStrictEqual(metric, {
    metricDescriptor: {
      name: 'test-counter',
      description: 'sample counter description',
      unit: '1',
      type:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorType
          .MONOTONIC_DOUBLE,
      temporality:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorTemporality
          .CUMULATIVE,
    },
    doubleDataPoints: [
      {
        labels: [],
        value: 8,
        startTimeUnixNano: 1592602232694000000,
        timeUnixNano: time,
      },
    ],
  });
}

export function ensureObserverIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric,
  time: number
) {
  assert.deepStrictEqual(metric, {
    metricDescriptor: {
      name: 'test-observer',
      description: 'sample observer description',
      unit: '2',
      type:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorType
          .SUMMARY,
      temporality:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorTemporality
          .DELTA,
    },
    summaryDataPoints: [
      {
        startTimeUnixNano: 1592602232694000000,
        timeUnixNano: time,
        count: 2,
        sum: 9,
        labels: [],
        percentileValues: [
          {
            percentile: 0,
            value: 3,
          },
          { percentile: 100, value: 6 },
        ],
      },
    ],
  });
}

export function ensureValueRecorderIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric,
  time: number
) {
  assert.deepStrictEqual(metric, {
    metricDescriptor: {
      name: 'test-recorder',
      description: 'sample recorder description',
      unit: '3',
      type:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorType
          .SUMMARY,
      temporality:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorTemporality
          .DELTA,
    },
    summaryDataPoints: [
      {
        count: 1,
        sum: 5,
        labels: [],
        percentileValues: [
          { percentile: 0, value: 5 },
          { percentile: 100, value: 5 },
        ],
        startTimeUnixNano: 1592602232694000000,
        timeUnixNano: time,
      },
    ],
  });
}

export function ensureHistogramIsCorrect(
  metric: collectorTypes.opentelemetryProto.metrics.v1.Metric,
  time: number
) {
  assert.deepStrictEqual(metric, {
    metricDescriptor: {
      name: 'test-hist',
      description: 'sample observer description',
      unit: '2',
      type:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorType
          .HISTOGRAM,
      temporality:
        collectorTypes.opentelemetryProto.metrics.v1.MetricDescriptorTemporality
          .DELTA,
    },
    histogramDataPoints: [
      {
        labels: [],
        buckets: [{ count: 1 }, { count: 1 }, { count: 0 }],
        count: 2,
        sum: 21,
        explicitBounds: [10, 20],
        startTimeUnixNano: 1592602232694000000,
        timeUnixNano: time,
      },
    ],
  });
}

export function ensureExportTraceServiceRequestIsSet(
  json: collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest
) {
  const resourceSpans = json.resourceSpans;
  assert.strictEqual(
    resourceSpans && resourceSpans.length,
    1,
    'resourceSpans is missing'
  );

  const resource = resourceSpans[0].resource;
  assert.strictEqual(!!resource, true, 'resource is missing');

  const instrumentationLibrarySpans =
    resourceSpans[0].instrumentationLibrarySpans;
  assert.strictEqual(
    instrumentationLibrarySpans && instrumentationLibrarySpans.length,
    1,
    'instrumentationLibrarySpans is missing'
  );

  const instrumentationLibrary =
    instrumentationLibrarySpans[0].instrumentationLibrary;
  assert.strictEqual(
    !!instrumentationLibrary,
    true,
    'instrumentationLibrary is missing'
  );

  const spans = instrumentationLibrarySpans[0].spans;
  assert.strictEqual(spans && spans.length, 1, 'spans are missing');
}

export function ensureExportMetricsServiceRequestIsSet(
  json: collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest
) {
  const resourceMetrics = json.resourceMetrics;
  assert.strictEqual(
    resourceMetrics.length,
    4,
    'resourceMetrics has incorrect length'
  );

  const resource = resourceMetrics[0].resource;
  assert.strictEqual(!!resource, true, 'resource is missing');

  const instrumentationLibraryMetrics =
    resourceMetrics[0].instrumentationLibraryMetrics;
  assert.strictEqual(
    instrumentationLibraryMetrics && instrumentationLibraryMetrics.length,
    1,
    'instrumentationLibraryMetrics is missing'
  );

  const instrumentationLibrary =
    instrumentationLibraryMetrics[0].instrumentationLibrary;
  assert.strictEqual(
    !!instrumentationLibrary,
    true,
    'instrumentationLibrary is missing'
  );

  const metric1 = resourceMetrics[0].instrumentationLibraryMetrics[0].metrics;
  const metric2 = resourceMetrics[1].instrumentationLibraryMetrics[0].metrics;
  assert.strictEqual(metric1.length, 1, 'Metrics are missing');
  assert.strictEqual(metric2.length, 1, 'Metrics are missing');
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
