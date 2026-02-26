/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TraceFlags, SpanStatusCode } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { Span } from '../src/types';
import { resourceFromAttributes } from '@opentelemetry/resources';

export const mockedReadableSpan: ReadableSpan = {
  name: 'documentFetch',
  kind: 0,
  spanContext: () => {
    return {
      traceId: '1f1008dc8e270e85c40a0d7c3939b278',
      spanId: '5e107261f64fa53e',
      traceFlags: TraceFlags.SAMPLED,
    };
  },
  parentSpanContext: {
    spanId: '78a8915098864388',
    traceId: '1f1008dc8e270e85c40a0d7c3939b278',
    traceFlags: TraceFlags.SAMPLED,
  },
  startTime: [1574120165, 429803070],
  endTime: [1574120165, 438688070],
  ended: true,
  status: { code: SpanStatusCode.OK },
  attributes: { component: 'foo' },
  links: [],
  events: [],
  duration: [0, 8885000],
  resource: resourceFromAttributes({
    service: 'ui',
    version: 1,
    cost: 112.12,
  }),
  instrumentationScope: { name: 'default', version: '0.0.1' },
  droppedAttributesCount: 0,
  droppedEventsCount: 0,
  droppedLinksCount: 0,
};

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

export function ensureSpanIsCorrect(span: Span) {
  assert.deepStrictEqual(span, {
    traceId: '1f1008dc8e270e85c40a0d7c3939b278',
    parentId: '78a8915098864388',
    name: 'documentFetch',
    id: '5e107261f64fa53e',
    timestamp: 1574120165429803,
    duration: 8885,
    localEndpoint: { serviceName: 'OpenTelemetry Service' },
    tags: {
      component: 'foo',
      'otel.status_code': 'OK',
      service: 'ui',
      version: '1',
      cost: '112.12',
    },
  });
}
