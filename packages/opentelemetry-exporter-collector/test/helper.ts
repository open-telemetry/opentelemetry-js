/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { TraceFlags } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as collectorTypes from '../src/types';

if (typeof Buffer === 'undefined') {
  // @ts-ignore
  window.Buffer = {
    from: function(arr: []) {
      return new Uint8Array(arr);
    },
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
};

export function ensureSpanIsCorrect(
  span: collectorTypes.opentelemetryProto.trace.v1.Span
) {
  assert.deepStrictEqual(span, {
    traceId: Buffer.from([
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
    ]),
    spanId: Buffer.from([94, 16, 114, 97, 246, 79, 165, 62]),
    parentSpanId: Buffer.from([120, 168, 145, 80, 152, 134, 67, 136]),
    traceState: undefined,
    name: { value: 'documentFetch', truncatedByteCount: 0 },
    kind: 1,
    startTimeUnixNano: 1574120165429803000,
    endTimeUnixNano: 1574120165438688000,
    attributes: [
      {
        key: 'component',
        type: 0,
        stringValue: 'document-load',
      },
    ],
    droppedAttributesCount: 0,
    events: [
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
    droppedEventsCount: 0,
    status: { code: 0 },
    links: [
      {
        traceId: Buffer.from([
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
        ]),
        spanId: Buffer.from([120, 168, 145, 80, 152, 134, 67, 136]),
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
    droppedLinksCount: 0,
  });
}

export function ensureBrowserSpanIsCorrect(
  span: collectorTypes.opentelemetryProto.trace.v1.Span
) {
  const expected = {
    traceId: new Uint8Array([
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
    ]),
    spanId: new Uint8Array([94, 16, 114, 97, 246, 79, 165, 62]),
    parentSpanId: new Uint8Array([120, 168, 145, 80, 152, 134, 67, 136]),
    traceState: undefined,
    name: { value: 'documentFetch', truncatedByteCount: 0 },
    kind: 1,
    startTimeUnixNano: 1574120165429803000,
    endTimeUnixNano: 1574120165438688000,
    attributes: [
      {
        key: 'component',
        type: 0,
        stringValue: 'document-load',
      },
    ],
    droppedAttributesCount: 0,
    events: [
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
    droppedEventsCount: 0,
    status: { code: 0 },
    links: [
      {
        traceId: new Uint8Array([
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
        ]),
        spanId: new Uint8Array([120, 168, 145, 80, 152, 134, 67, 136]),
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
    droppedLinksCount: 0,
  };
  assert.deepStrictEqual(span, JSON.parse(JSON.stringify(expected)));
}

export function ensureExportedSpanIsCorrect(
  span: collectorTypes.opentelemetryProto.trace.v1.Span
) {
  assert.deepStrictEqual(span, {
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
    events: [
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
    links: [
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
        traceId: Buffer.from([
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
        ]),
        spanId: Buffer.from([120, 168, 145, 80, 152, 134, 67, 136]),
        traceState: '',
        droppedAttributesCount: 0,
      },
    ],
    traceId: Buffer.from([
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
    ]),
    spanId: Buffer.from([94, 16, 114, 97, 246, 79, 165, 62]),
    traceState: '',
    parentSpanId: Buffer.from([120, 168, 145, 80, 152, 134, 67, 136]),
    name: '[object Object]',
    kind: 'INTERNAL',
    startTimeUnixNano: '1574120165429803008',
    endTimeUnixNano: '1574120165438688000',
    droppedAttributesCount: 0,
    droppedEventsCount: 0,
    droppedLinksCount: 0,
    status: { code: 'Ok', message: '' },
  });
}

export function ensureWebResourceIsCorrect(
  resource: collectorTypes.opentelemetryProto.resource.v1.Resource
) {
  assert.deepStrictEqual(resource, {
    attributes: [
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
