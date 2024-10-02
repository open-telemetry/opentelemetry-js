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
import {
  hrTime,
  hrTimeDuration,
  hrTimeToMicroseconds,
  millisToHrTime,
  VERSION,
} from '@opentelemetry/core';
import { IResource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  defaultStatusCodeTagName,
  defaultStatusErrorTagName,
  toZipkinSpan,
  _toZipkinAnnotations,
  _toZipkinTags,
} from '../../src/transform';
import * as zipkinTypes from '../../src/types';

const resource = {
  attributes: {
    [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
    cost: '112.12',
    service: 'ui',
    version: '1',
    'telemetry.sdk.language': 'nodejs',
    'telemetry.sdk.name': 'opentelemetry',
    'telemetry.sdk.version': VERSION,
  },
} as unknown as IResource;
const parentId = '5c1c63257de34c67';
const spanContext: api.SpanContext = {
  traceId: 'd4cda95b652f4a1592b449d5929fda1b',
  spanId: '6e0c63257de34c92',
  traceFlags: api.TraceFlags.SAMPLED,
};
const currentTime = Date.now();
const durationMs = 10;
const startTime = hrTime(currentTime - durationMs);
const endTime = hrTime(currentTime);
const duration = millisToHrTime(durationMs);

function getSpan(options: Partial<ReadableSpan>): ReadableSpan {
  const span = {
    name: options.name || 'my-span',
    kind: typeof options.kind === 'number' ? options.kind : api.SpanKind.SERVER,
    startTime: options.startTime || startTime,
    endTime: options.endTime || endTime,
    duration: options.duration || duration,
    spanContext: () => spanContext,
    parentSpanId: options.parentSpanId || parentId,
    attributes: options.attributes || {},
    events: options.events || [],
    status: options.status || { code: api.SpanStatusCode.UNSET },
    resource,
  } as ReadableSpan;

  // Expicit `undefined` properties fro options will be removed from the
  // result span.
  Object.keys(options).forEach(k => {
    if (options[k as keyof ReadableSpan] === undefined) {
      delete span[k as keyof ReadableSpan];
    }
  });

  return span;
}

describe('transform', () => {
  describe('toZipkinSpan', () => {
    it('should convert an OpenTelemetry span to a Zipkin span', () => {
      const span = getSpan({
        attributes: { key1: 'value1', key2: 'value2' },
        events: [
          {
            name: 'my-event',
            time: hrTime(Date.now() + 5),
            attributes: { key3: 'value 3' },
          },
        ],
      });

      const zipkinSpan = toZipkinSpan(
        span,
        'my-service',
        defaultStatusCodeTagName,
        defaultStatusErrorTagName
      );
      assert.deepStrictEqual(zipkinSpan, {
        kind: 'SERVER',
        annotations: [
          {
            value: 'my-event',
            timestamp: Math.round(hrTimeToMicroseconds(span.events[0].time)),
          },
        ],
        duration: Math.round(
          hrTimeToMicroseconds(hrTimeDuration(span.startTime, span.endTime))
        ),
        id: span.spanContext().spanId,
        localEndpoint: {
          serviceName: 'my-service',
        },
        name: span.name,
        parentId,
        tags: {
          key1: 'value1',
          key2: 'value2',
          [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
          cost: '112.12',
          service: 'ui',
          version: '1',
          'telemetry.sdk.language': 'nodejs',
          'telemetry.sdk.name': 'opentelemetry',
          'telemetry.sdk.version': VERSION,
        },
        timestamp: hrTimeToMicroseconds(span.startTime),
        traceId: span.spanContext().traceId,
      });
    });
    it("should skip parentSpanId if doesn't exist", () => {
      const span = getSpan({
        parentSpanId: undefined,
      });

      const zipkinSpan = toZipkinSpan(
        span,
        'my-service',
        defaultStatusCodeTagName,
        defaultStatusErrorTagName
      );
      assert.deepStrictEqual(zipkinSpan, {
        kind: 'SERVER',
        annotations: undefined,
        duration: Math.round(
          hrTimeToMicroseconds(hrTimeDuration(span.startTime, span.endTime))
        ),
        id: span.spanContext().spanId,
        localEndpoint: {
          serviceName: 'my-service',
        },
        name: span.name,
        parentId: undefined,
        tags: {
          [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
          cost: '112.12',
          service: 'ui',
          version: '1',
          'telemetry.sdk.language': 'nodejs',
          'telemetry.sdk.name': 'opentelemetry',
          'telemetry.sdk.version': VERSION,
        },
        timestamp: hrTimeToMicroseconds(span.startTime),
        traceId: span.spanContext().traceId,
      });
    });
    // SpanKind mapping tests
    [
      { ot: api.SpanKind.CLIENT, zipkin: 'CLIENT' },
      { ot: api.SpanKind.SERVER, zipkin: 'SERVER' },
      { ot: api.SpanKind.CONSUMER, zipkin: 'CONSUMER' },
      { ot: api.SpanKind.PRODUCER, zipkin: 'PRODUCER' },
      { ot: api.SpanKind.INTERNAL, zipkin: undefined },
    ].forEach(item =>
      it(`should map OpenTelemetry SpanKind ${
        api.SpanKind[item.ot]
      } to Zipkin ${item.zipkin}`, () => {
        const span = getSpan({
          kind: item.ot,
          parentSpanId: undefined,
        });
        const zipkinSpan = toZipkinSpan(
          span,
          'my-service',
          defaultStatusCodeTagName,
          defaultStatusErrorTagName
        );
        assert.deepStrictEqual(zipkinSpan, {
          kind: item.zipkin,
          annotations: undefined,
          duration: Math.round(
            hrTimeToMicroseconds(hrTimeDuration(span.startTime, span.endTime))
          ),
          id: span.spanContext().spanId,
          localEndpoint: {
            serviceName: 'my-service',
          },
          name: span.name,
          parentId: undefined,
          tags: {
            [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
            cost: '112.12',
            service: 'ui',
            version: '1',
            'telemetry.sdk.language': 'nodejs',
            'telemetry.sdk.name': 'opentelemetry',
            'telemetry.sdk.version': VERSION,
          },
          timestamp: hrTimeToMicroseconds(span.startTime),
          traceId: span.spanContext().traceId,
        });
      })
    );
  });

  describe('_toZipkinTags', () => {
    it('should convert OpenTelemetry attributes to Zipkin tags', () => {
      const span = getSpan({
        parentSpanId: undefined,
        attributes: {
          key1: 'value1',
          key2: 'value2',
        },
      });
      const tags: zipkinTypes.Tags = _toZipkinTags(
        span,
        defaultStatusCodeTagName,
        defaultStatusErrorTagName
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
        'telemetry.sdk.language': 'nodejs',
        'telemetry.sdk.name': 'opentelemetry',
        'telemetry.sdk.version': VERSION,
        cost: '112.12',
        service: 'ui',
        version: '1',
      });
    });
    it('should map OpenTelemetry constructor attributes to a Zipkin tag', () => {
      const span = getSpan({
        parentSpanId: undefined,
        attributes: {
          key1: 'value1',
          key2: 'value2',
        },
      });

      const tags: zipkinTypes.Tags = _toZipkinTags(
        span,
        defaultStatusCodeTagName,
        defaultStatusErrorTagName
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
        'telemetry.sdk.language': 'nodejs',
        'telemetry.sdk.name': 'opentelemetry',
        'telemetry.sdk.version': VERSION,
        cost: '112.12',
        service: 'ui',
        version: '1',
      });
    });
    it('should map OpenTelemetry SpanStatus.code to a Zipkin tag', () => {
      const span = getSpan({
        parentSpanId: undefined,
        attributes: {
          key1: 'value1',
          key2: 'value2',
        },
        status: { code: api.SpanStatusCode.ERROR },
      });
      const tags: zipkinTypes.Tags = _toZipkinTags(
        span,
        defaultStatusCodeTagName,
        defaultStatusErrorTagName
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [defaultStatusCodeTagName]: 'ERROR',
        [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
        'telemetry.sdk.language': 'nodejs',
        'telemetry.sdk.name': 'opentelemetry',
        'telemetry.sdk.version': VERSION,
        cost: '112.12',
        service: 'ui',
        version: '1',
      });
    });
    it('should map OpenTelemetry SpanStatus.message to a Zipkin tag', () => {
      const span = getSpan({
        parentSpanId: undefined,
        attributes: {
          key1: 'value1',
          key2: 'value2',
        },
        status: { code: api.SpanStatusCode.ERROR, message: 'my-message' },
      });
      const tags: zipkinTypes.Tags = _toZipkinTags(
        span,
        defaultStatusCodeTagName,
        defaultStatusErrorTagName
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [defaultStatusCodeTagName]: 'ERROR',
        [defaultStatusErrorTagName]: 'my-message',
        [SEMRESATTRS_SERVICE_NAME]: 'zipkin-test',
        'telemetry.sdk.language': 'nodejs',
        'telemetry.sdk.name': 'opentelemetry',
        'telemetry.sdk.version': VERSION,
        cost: '112.12',
        service: 'ui',
        version: '1',
      });
    });
  });

  describe('_toZipkinAnnotations', () => {
    it('should convert OpenTelemetry events to Zipkin annotations', () => {
      const span = getSpan({
        parentSpanId: undefined,
        events: [
          { name: 'my-event1', time: hrTime(Date.now()) },
          {
            name: 'my-event2',
            time: hrTime(Date.now()),
            attributes: { key1: 'value1' },
          },
        ],
      });

      const annotations = _toZipkinAnnotations(span.events);
      assert.deepStrictEqual(annotations, [
        {
          value: 'my-event1',
          timestamp: Math.round(hrTimeToMicroseconds(span.events[0].time)),
        },
        {
          value: 'my-event2',
          timestamp: Math.round(hrTimeToMicroseconds(span.events[1].time)),
        },
      ]);
    });
  });
});
