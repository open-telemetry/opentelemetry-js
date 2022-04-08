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

import { SpanStatusCode, TraceFlags } from '@opentelemetry/api';
import { hexToBase64, InstrumentationLibrary, VERSION } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as otlpTypes from '../src/types';
import { opentelemetryProto } from '../src/types';

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: function (arr: []) {
      return new Uint8Array(arr);
    },
  };
}

const traceIdHex = '1f1008dc8e270e85c40a0d7c3939b278';
const spanIdHex = '5e107261f64fa53e';
const parentIdHex = '78a8915098864388';

export const mockedReadableSpan: ReadableSpan = {
  name: 'documentFetch',
  kind: 0,
  spanContext: ()=> {
    return {
      traceId: '1f1008dc8e270e85c40a0d7c3939b278',
      spanId: '5e107261f64fa53e',
      traceFlags: TraceFlags.SAMPLED,
    };
  },
  parentSpanId: '78a8915098864388',
  startTime: [1574120165, 429803070],
  endTime: [1574120165, 438688070],
  ended: true,
  status: { code: SpanStatusCode.OK },
  attributes: { component: 'document-load' },
  links: [
    {
      context: {
        traceId: '1f1008dc8e270e85c40a0d7c3939b278',
        spanId: '78a8915098864388',
        traceFlags: TraceFlags.SAMPLED,
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
  resource: Resource.default()
    .merge(new Resource({
      service: 'ui',
      version: 1,
      cost: 112.12,
    })),
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
    spanContext: () => {
      return {
        traceId: '1f1008dc8e270e85c40a0d7c3939b278',
        spanId: '5e107261f64fa53e',
        traceFlags: TraceFlags.SAMPLED,
      };
    },
    parentSpanId: '78a8915098864388',
    startTime: [1574120165, 429803070],
    endTime: [1574120165, 438688070],
    ended: true,
    status: { code: SpanStatusCode.OK },
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
    spanContext: () => {
      return {
        traceId: '1f1008dc8e270e85c40a0d7c3939b278',
        spanId: 'f64fa53e5e107261',
        traceFlags: TraceFlags.SAMPLED,
      };
    },
    parentSpanId: '78a8915098864388',
    startTime: [1575120165, 439803070],
    endTime: [1575120165, 448688070],
    ended: true,
    status: { code: SpanStatusCode.OK },
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
    spanContext: () => {
      return {
        traceId: '1f1008dc8e270e85c40a0d7c3939b278',
        spanId: '07261f64fa53e5e1',
        traceFlags: TraceFlags.SAMPLED,
      };
    },
    parentSpanId: 'a891578098864388',
    startTime: [1575120165, 439803070],
    endTime: [1575120165, 448688070],
    ended: true,
    status: { code: SpanStatusCode.OK },
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
  attributes: opentelemetryProto.trace.v1.Span.Link[],
  useHex?: boolean
) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        traceId: useHex ? traceIdHex : hexToBase64(traceIdHex),
        spanId: useHex ? parentIdHex : hexToBase64(parentIdHex),
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
  span: otlpTypes.opentelemetryProto.trace.v1.Span,
  useHex = true
) {
  if (span.attributes) {
    ensureAttributesAreCorrect(span.attributes);
  }
  if (span.events) {
    ensureEventsAreCorrect(span.events);
  }
  if (span.links) {
    ensureLinksAreCorrect(span.links, useHex);
  }
  assert.deepStrictEqual(
    span.traceId,
    useHex ? traceIdHex : hexToBase64(traceIdHex),
    'traceId is' + ' wrong'
  );
  assert.deepStrictEqual(
    span.spanId,
    useHex ? spanIdHex : hexToBase64(spanIdHex),
    'spanId is' + ' wrong'
  );
  assert.deepStrictEqual(
    span.parentSpanId,
    useHex ? parentIdHex : hexToBase64(parentIdHex),
    'parentIdArr is wrong'
  );
  assert.strictEqual(span.name, 'documentFetch', 'name is wrong');
  assert.strictEqual(
    span.kind,
    opentelemetryProto.trace.v1.Span.SpanKind.SPAN_KIND_INTERNAL,
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
  assert.deepStrictEqual(
    span.status,
    { code: SpanStatusCode.OK },
    'status is wrong'
  );
}

export function ensureWebResourceIsCorrect(
  resource: otlpTypes.opentelemetryProto.resource.v1.Resource
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

export function ensureExportTraceServiceRequestIsSet(
  json: otlpTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest
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
