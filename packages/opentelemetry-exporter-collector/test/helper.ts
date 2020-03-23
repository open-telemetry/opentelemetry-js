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
import * as core from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import { opentelemetry } from '../src/platform/node/grpc/types';
import * as collectorTypes from '../src/types';
import { VERSION } from '../src/version';

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

export function ensureProtoSpanIsCorrect(
  span: opentelemetry.proto.trace.v1.Span
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

export function ensureResourceIsCorrect(resource: collectorTypes.Resource) {
  assert.deepStrictEqual(resource, {
    labels: { service: 'ui', version: '1', cost: '112.12' },
  });
}

export function ensureProtoResourceIsCorrect(
  resource: opentelemetry.proto.resource.v1.Resource
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

export function ensureSpanIsCorrect(span: collectorTypes.Span) {
  assert.deepStrictEqual(span, {
    traceId: 'HxAI3I4nDoXECg18OTmyeA==',
    spanId: 'XhByYfZPpT4=',
    parentSpanId: 'eKiRUJiGQ4g=',
    tracestate: {},
    name: { value: 'documentFetch', truncatedByteCount: 0 },
    kind: 0,
    startTime: '2019-11-18T23:36:05.429803070Z',
    endTime: '2019-11-18T23:36:05.438688070Z',
    attributes: {
      droppedAttributesCount: 0,
      attributeMap: {
        component: {
          stringValue: { value: 'document-load', truncatedByteCount: 0 },
        },
      },
    },
    timeEvents: {
      timeEvent: [
        {
          time: '2019-11-18T23:36:05.429803070Z',
          annotation: {
            description: { value: 'fetchStart', truncatedByteCount: 0 },
          },
        },
        {
          time: '2019-11-18T23:36:05.429803070Z',
          annotation: {
            description: {
              value: 'domainLookupStart',
              truncatedByteCount: 0,
            },
          },
        },
        {
          time: '2019-11-18T23:36:05.429803070Z',
          annotation: {
            description: {
              value: 'domainLookupEnd',
              truncatedByteCount: 0,
            },
          },
        },
        {
          time: '2019-11-18T23:36:05.429803070Z',
          annotation: {
            description: { value: 'connectStart', truncatedByteCount: 0 },
          },
        },
        {
          time: '2019-11-18T23:36:05.429803070Z',
          annotation: {
            description: { value: 'connectEnd', truncatedByteCount: 0 },
          },
        },
        {
          time: '2019-11-18T23:36:05.435513070Z',
          annotation: {
            description: { value: 'requestStart', truncatedByteCount: 0 },
          },
        },
        {
          time: '2019-11-18T23:36:05.436923070Z',
          annotation: {
            description: { value: 'responseStart', truncatedByteCount: 0 },
          },
        },
        {
          time: '2019-11-18T23:36:05.438688070Z',
          annotation: {
            description: { value: 'responseEnd', truncatedByteCount: 0 },
          },
        },
      ],
      droppedAnnotationsCount: 0,
      droppedMessageEventsCount: 0,
    },
    status: { code: 0 },
    sameProcessAsParentSpan: true,
    links: {
      droppedLinksCount: 0,
      link: [
        {
          traceId: 'HxAI3I4nDoXECg18OTmyeA==',
          spanId: 'eKiRUJiGQ4g=',
          type: 2,
          attributes: {
            droppedAttributesCount: 0,
            attributeMap: {
              component: {
                stringValue: { value: 'document-load', truncatedByteCount: 0 },
              },
            },
          },
        },
      ],
    },
  });
}

export function ensureExportTraceServiceRequestIsSet(
  json: collectorTypes.ExportTraceServiceRequest,
  languageInfo: collectorTypes.LibraryInfoLanguage
) {
  const libraryInfo = json.node && json.node.libraryInfo;
  const serviceInfo = json.node && json.node.serviceInfo;
  const identifier = json.node && json.node.identifier;

  const language = libraryInfo && libraryInfo.language;
  assert.strictEqual(language, languageInfo, 'language is missing');

  const exporterVersion = libraryInfo && libraryInfo.exporterVersion;
  assert.strictEqual(exporterVersion, VERSION, 'version is missing');

  const coreVersion = libraryInfo && libraryInfo.coreLibraryVersion;
  assert.strictEqual(coreVersion, core.VERSION, 'core version is missing');

  const name = serviceInfo && serviceInfo.name;
  assert.strictEqual(name, 'bar', 'name is missing');

  const hostName = identifier && identifier.hostName;
  assert.strictEqual(hostName, 'foo', 'hostName is missing');
}
