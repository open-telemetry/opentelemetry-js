/**
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

import * as assert from 'assert';
import * as types from '@opentelemetry/api';
import { Span, BasicTracerProvider } from '@opentelemetry/tracing';
import {
  NoopLogger,
  hrTimeToMicroseconds,
  hrTimeDuration,
} from '@opentelemetry/core';
import {
  toZipkinSpan,
  _toZipkinTags,
  _toZipkinAnnotations,
  statusCodeTagName,
  statusDescriptionTagName,
} from '../src/transform';
import * as zipkinTypes from '../src/types';

const logger = new NoopLogger();
const tracer = new BasicTracerProvider({
  logger,
}).getTracer('default');
const parentId = new Uint8Array([
  0x5c,
  0x1c,
  0x63,
  0x25,
  0x7d,
  0xe3,
  0x4c,
  0x67,
]);
const spanContext: types.SpanContext = {
  traceId: new Uint8Array([
    0xd4,
    0xcd,
    0xa9,
    0x5b,
    0x65,
    0x2f,
    0x4a,
    0x15,
    0x92,
    0xb4,
    0x49,
    0xd5,
    0x92,
    0x9f,
    0xda,
    0x1b,
  ]),
  spanId: new Uint8Array([0x6e, 0x0c, 0x63, 0x25, 0x7d, 0xe3, 0x4c, 0x92]),
  traceFlags: types.TraceFlags.SAMPLED,
};

describe('transform', () => {
  describe('toZipkinSpan', () => {
    it('should convert an OpenTelemetry span to a Zipkin span', () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        types.SpanKind.SERVER,
        parentId
      );
      span.setAttributes({
        key1: 'value1',
        key2: 'value2',
      });
      span.addEvent('my-event', { key3: 'value3' });
      span.end();

      const zipkinSpan = toZipkinSpan(
        span.toReadableSpan(),
        'my-service',
        statusCodeTagName,
        statusDescriptionTagName
      );
      assert.deepStrictEqual(zipkinSpan, {
        kind: 'SERVER',
        annotations: [
          {
            value: 'my-event',
            timestamp: hrTimeToMicroseconds(span.events[0].time),
          },
        ],
        duration: hrTimeToMicroseconds(
          hrTimeDuration(span.startTime, span.endTime)
        ),
        id: '6e0c63257de34c92',
        localEndpoint: {
          serviceName: 'my-service',
        },
        name: span.name,
        parentId: '5c1c63257de34c67',
        tags: {
          key1: 'value1',
          key2: 'value2',
          [statusCodeTagName]: 'OK',
        },
        timestamp: hrTimeToMicroseconds(span.startTime),
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      });
    });
    it("should skip parentSpanId if doesn't exist", () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        types.SpanKind.SERVER
      );
      span.end();

      const zipkinSpan = toZipkinSpan(
        span.toReadableSpan(),
        'my-service',
        statusCodeTagName,
        statusDescriptionTagName
      );
      assert.deepStrictEqual(zipkinSpan, {
        kind: 'SERVER',
        annotations: undefined,
        duration: hrTimeToMicroseconds(
          hrTimeDuration(span.startTime, span.endTime)
        ),
        id: '6e0c63257de34c92',
        localEndpoint: {
          serviceName: 'my-service',
        },
        name: span.name,
        parentId: undefined,
        tags: {
          [statusCodeTagName]: 'OK',
        },
        timestamp: hrTimeToMicroseconds(span.startTime),
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      });
    });
    // SpanKind mapping tests
    [
      { ot: types.SpanKind.CLIENT, zipkin: 'CLIENT' },
      { ot: types.SpanKind.SERVER, zipkin: 'SERVER' },
      { ot: types.SpanKind.CONSUMER, zipkin: 'CONSUMER' },
      { ot: types.SpanKind.PRODUCER, zipkin: 'PRODUCER' },
      { ot: types.SpanKind.INTERNAL, zipkin: undefined },
    ].forEach(item =>
      it(`should map OpenTelemetry SpanKind ${
        types.SpanKind[item.ot]
      } to Zipkin ${item.zipkin}`, () => {
        const span = new Span(tracer, 'my-span', spanContext, item.ot);
        span.end();

        const zipkinSpan = toZipkinSpan(
          span.toReadableSpan(),
          'my-service',
          statusCodeTagName,
          statusDescriptionTagName
        );
        assert.deepStrictEqual(zipkinSpan, {
          kind: item.zipkin,
          annotations: undefined,
          duration: hrTimeToMicroseconds(
            hrTimeDuration(span.startTime, span.endTime)
          ),
          id: '6e0c63257de34c92',
          localEndpoint: {
            serviceName: 'my-service',
          },
          name: span.name,
          parentId: undefined,
          tags: {
            [statusCodeTagName]: 'OK',
          },
          timestamp: hrTimeToMicroseconds(span.startTime),
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        });
      })
    );
  });

  describe('_toZipkinTags', () => {
    it('should convert OpenTelemetry attributes to Zipkin tags', () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        types.SpanKind.SERVER,
        parentId
      );
      span.setAttributes({
        key1: 'value1',
        key2: 'value2',
      });
      const tags: zipkinTypes.Tags = _toZipkinTags(
        span.attributes,
        span.status,
        statusCodeTagName,
        statusDescriptionTagName
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [statusCodeTagName]: 'OK',
      });
    });
    it('should map OpenTelemetry Status.code to a Zipkin tag', () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        types.SpanKind.SERVER,
        parentId
      );
      const status: types.Status = {
        code: types.CanonicalCode.ABORTED,
      };
      span.setStatus(status);
      span.setAttributes({
        key1: 'value1',
        key2: 'value2',
      });
      const tags: zipkinTypes.Tags = _toZipkinTags(
        span.attributes,
        span.status,
        statusCodeTagName,
        statusDescriptionTagName
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [statusCodeTagName]: 'ABORTED',
      });
    });
    it('should map OpenTelemetry Status.message to a Zipkin tag', () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        types.SpanKind.SERVER,
        parentId
      );
      const status: types.Status = {
        code: types.CanonicalCode.ABORTED,
        message: 'my-message',
      };
      span.setStatus(status);
      span.setAttributes({
        key1: 'value1',
        key2: 'value2',
      });
      const tags: zipkinTypes.Tags = _toZipkinTags(
        span.attributes,
        span.status,
        statusCodeTagName,
        statusDescriptionTagName
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [statusCodeTagName]: 'ABORTED',
        [statusDescriptionTagName]: status.message,
      });
    });
  });

  describe('_toZipkinAnnotations', () => {
    it('should convert OpenTelemetry events to Zipkin annotations', () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        types.SpanKind.SERVER,
        parentId
      );
      span.addEvent('my-event1');
      span.addEvent('my-event2', { key1: 'value1' });

      const annotations = _toZipkinAnnotations(span.events);
      assert.deepStrictEqual(annotations, [
        {
          value: 'my-event1',
          timestamp: hrTimeToMicroseconds(span.events[0].time),
        },
        {
          value: 'my-event2',
          timestamp: hrTimeToMicroseconds(span.events[1].time),
        },
      ]);
    });
  });
});
