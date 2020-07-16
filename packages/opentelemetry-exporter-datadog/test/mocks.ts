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
import * as api from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
import { Resource } from '@opentelemetry/resources';
import { TraceState } from '@opentelemetry/core';

export const mockSpanContextUnsampled = {
  traceId: 'd4cda95b652f4a1592b449d5929fda1b',
  spanId: '6e0c63257de34c92',
  traceFlags: api.TraceFlags.NONE,
};

export const mockSpanContextSampled = {
  traceId: 'd4cda95b652f4a1592b449d5929fda1b',
  spanId: '6e0c63257de34c92',
  traceFlags: api.TraceFlags.SAMPLED,
};

export const mockSpanContextOrigin = {
  traceId: 'd4cda95b652f4a1592b449d5929fda1b',
  spanId: '6e0c63257de34c92',
  traceFlags: api.TraceFlags.SAMPLED,
  traceState: new TraceState('dd_origin=synthetics-example'),
};

export const mockReadableSpan: ReadableSpan = {
  name: 'my-span1',
  kind: api.SpanKind.CLIENT,
  spanContext: mockSpanContextUnsampled,
  startTime: [1566156729, 709],
  endTime: [1566156731, 709],
  ended: true,
  status: {
    code: api.CanonicalCode.DATA_LOSS,
  },
  attributes: {},
  links: [],
  events: [],
  duration: [32, 800000000],
  resource: Resource.empty(),
  instrumentationLibrary: {
    name: 'default',
    version: '0.0.1',
  },
};

export const mockExandedReadableSpan: ReadableSpan = {
  name: 'my-span',
  kind: api.SpanKind.INTERNAL,
  spanContext: mockSpanContextUnsampled,
  startTime: [1566156729, 709],
  endTime: [1566156731, 709],
  ended: true,
  status: {
    code: api.CanonicalCode.OK,
  },
  attributes: {
    testBool: true,
    testString: 'test',
    testNum: '3.142',
  },
  links: [
    {
      context: {
        traceId: 'a4cda95b652f4a1592b449d5929fda1b',
        spanId: '3e0c63257de34c92',
      },
      attributes: {
        testBool: true,
        testString: 'test',
        testNum: 3.142,
      },
    },
  ],
  events: [
    {
      name: 'something happened',
      attributes: {
        error: true,
      },
      time: [1566156729, 809],
    },
  ],
  duration: [32, 800000000],
  resource: new Resource({
    service: 'ui',
    version: 1,
    cost: 112.12,
  }),
  instrumentationLibrary: {
    name: 'default',
    version: '0.0.1',
  },
};
