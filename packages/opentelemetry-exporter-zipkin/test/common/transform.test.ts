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

import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import { Span, BasicTracerProvider } from '@opentelemetry/tracing';
import {
  NoopLogger,
  hrTimeToMicroseconds,
  hrTimeDuration,
  VERSION,
} from '@opentelemetry/core';
import {
  toZipkinSpan,
  _toZipkinTags,
  _toZipkinAnnotations,
  statusCodeTagName,
  statusDescriptionTagName,
} from '../../src/transform';
import * as zipkinTypes from '../../src/types';
import { Resource, TELEMETRY_SDK_RESOURCE } from '@opentelemetry/resources';
const logger = new NoopLogger();
const tracer = new BasicTracerProvider({
  logger,
}).getTracer('default');

const language = tracer.resource.attributes[TELEMETRY_SDK_RESOURCE.LANGUAGE];

const parentId = '5c1c63257de34c67';
const spanContext: api.SpanContext = {
  traceId: 'd4cda95b652f4a1592b449d5929fda1b',
  spanId: '6e0c63257de34c92',
  traceFlags: api.TraceFlags.SAMPLED,
};

const DUMMY_RESOURCE = new Resource({
  service: 'ui',
  version: 1,
  cost: 112.12,
});

describe('transform', () => {
  describe('toZipkinSpan', () => {
    it('should convert an OpenTelemetry span to a Zipkin span', () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        api.SpanKind.SERVER,
        parentId
      );
      span.setAttributes({
        key1: 'value1',
        key2: 'value2',
      });
      span.addEvent('my-event', { key3: 'value3' });
      span.end();

      const zipkinSpan = toZipkinSpan(
        span,
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
        id: span.spanContext.spanId,
        localEndpoint: {
          serviceName: 'my-service',
        },
        name: span.name,
        parentId,
        tags: {
          key1: 'value1',
          key2: 'value2',
          [statusCodeTagName]: 'OK',
          'telemetry.sdk.language': language,
          'telemetry.sdk.name': 'opentelemetry',
          'telemetry.sdk.version': VERSION,
        },
        timestamp: hrTimeToMicroseconds(span.startTime),
        traceId: span.spanContext.traceId,
      });
    });
    it("should skip parentSpanId if doesn't exist", () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        api.SpanKind.SERVER
      );
      span.end();

      const zipkinSpan = toZipkinSpan(
        span,
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
        id: span.spanContext.spanId,
        localEndpoint: {
          serviceName: 'my-service',
        },
        name: span.name,
        parentId: undefined,
        tags: {
          [statusCodeTagName]: 'OK',
          'telemetry.sdk.language': language,
          'telemetry.sdk.name': 'opentelemetry',
          'telemetry.sdk.version': VERSION,
        },
        timestamp: hrTimeToMicroseconds(span.startTime),
        traceId: span.spanContext.traceId,
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
        const span = new Span(tracer, 'my-span', spanContext, item.ot);
        span.end();

        const zipkinSpan = toZipkinSpan(
          span,
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
          id: span.spanContext.spanId,
          localEndpoint: {
            serviceName: 'my-service',
          },
          name: span.name,
          parentId: undefined,
          tags: {
            [statusCodeTagName]: 'OK',
            'telemetry.sdk.language': language,
            'telemetry.sdk.name': 'opentelemetry',
            'telemetry.sdk.version': VERSION,
          },
          timestamp: hrTimeToMicroseconds(span.startTime),
          traceId: span.spanContext.traceId,
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
        api.SpanKind.SERVER,
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
        statusDescriptionTagName,
        DUMMY_RESOURCE
      );

      assert.deepStrictEqual(tags, {
        key1: 'value1',
        key2: 'value2',
        [statusCodeTagName]: 'OK',
        cost: 112.12,
        service: 'ui',
        version: 1,
      });
    });
    it('should map OpenTelemetry Status.code to a Zipkin tag', () => {
      const span = new Span(
        tracer,
        'my-span',
        spanContext,
        api.SpanKind.SERVER,
        parentId
      );
      const status: api.Status = {
        code: api.CanonicalCode.ABORTED,
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
        statusDescriptionTagName,
        Resource.empty()
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
        api.SpanKind.SERVER,
        parentId
      );
      const status: api.Status = {
        code: api.CanonicalCode.ABORTED,
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
        statusDescriptionTagName,
        Resource.empty()
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
        api.SpanKind.SERVER,
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
