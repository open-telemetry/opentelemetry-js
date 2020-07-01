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
import { InstrumentationLibrary } from '@opentelemetry/core';
import * as grpc from 'grpc';
import {
  MetricRecord,
  MetricKind,
  SumAggregator,
  LastValueAggregator,
} from '@opentelemetry/metrics';

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: function (arr: []) {
      return new Uint8Array(arr);
    },
  };
}

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

export const mockCounter: MetricRecord = {
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

export const mockObserver: MetricRecord = {
  descriptor: {
    name: 'test-observer',
    description: 'sample observer description',
    unit: '2',
    metricKind: MetricKind.VALUE_OBSERVER,
    valueType: ValueType.DOUBLE,
  },
  labels: {},
  aggregator: new LastValueAggregator(),
  resource: new Resource({
    service: 'ui',
    version: 1,
    cost: 112.12,
  }),
  instrumentationLibrary: { name: 'default', version: '0.0.1' },
};

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

export function ensureExportedEventsAreCorrect(
  events: opentelemetryProto.trace.v1.Span.Event[]
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
  attributes: opentelemetryProto.common.v1.AttributeKeyValue[]
) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        key: 'component',
        type: 'STRING',
        stringValue: 'document-load',
        intValue: '0',
        doubleValue: 0,
        boolValue: false,
      },
    ],
    'exported attributes are incorrect'
  );
}

export function ensureExportedLinksAreCorrect(
  attributes: opentelemetryProto.trace.v1.Span.Link[]
) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        attributes: [
          {
            key: 'component',
            type: 'STRING',
            stringValue: 'document-load',
            intValue: '0',
            doubleValue: 0,
            boolValue: false,
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
  attributes: opentelemetryProto.common.v1.AttributeKeyValue[]
) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        key: 'component',
        type: 0,
        stringValue: 'document-load',
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
            type: 0,
            stringValue: 'document-load',
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

export function ensureWebResourceIsCorrect(
  resource: collectorTypes.opentelemetryProto.resource.v1.Resource
) {
  assert.deepStrictEqual(resource, {
    attributes: [
      {
        key: 'service.name',
        type: 0,
        stringValue: 'bar',
      },
      {
        key: 'service',
        type: 0,
        stringValue: 'ui',
      },
      { key: 'version', type: 2, doubleValue: 1 },
      {
        key: 'cost',
        type: 2,
        doubleValue: 112.12,
      },
    ],
    droppedAttributesCount: 0,
  });
}

export function ensureResourceIsCorrect(
  resource: collectorTypes.opentelemetryProto.resource.v1.Resource
) {
  assert.deepStrictEqual(resource, {
    attributes: [
      {
        key: 'service.name',
        type: 'STRING',
        stringValue: 'basic-service',
        intValue: '0',
        doubleValue: 0,
        boolValue: false,
      },
      {
        key: 'service',
        type: 'STRING',
        stringValue: 'ui',
        intValue: '0',
        doubleValue: 0,
        boolValue: false,
      },
      {
        key: 'version',
        type: 'DOUBLE',
        stringValue: '',
        intValue: '0',
        doubleValue: 1,
        boolValue: false,
      },
      {
        key: 'cost',
        type: 'DOUBLE',
        stringValue: '',
        intValue: '0',
        doubleValue: 112.12,
        boolValue: false,
      },
    ],
    droppedAttributesCount: 0,
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

export function ensureMetadataIsCorrect(
  actual: grpc.Metadata,
  expected: grpc.Metadata
) {
  //ignore user agent
  expected.remove('user-agent');
  actual.remove('user-agent');
  assert.deepStrictEqual(actual.getMap(), expected.getMap());
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
