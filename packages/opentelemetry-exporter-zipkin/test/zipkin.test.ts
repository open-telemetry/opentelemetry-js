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
import * as nock from 'nock';
import { ExportResult, ReadableSpan } from '@opentelemetry/tracer-basic';
import { NoopLogger, hrTimeToMicroseconds } from '@opentelemetry/core';
import * as types from '@opentelemetry/types';
import { ZipkinExporter } from '../src';
import * as zipkinTypes from '../src/types';
import { OT_REQUEST_HEADER } from '../src/utils';

const MICROS_PER_SECS = 1e6;

function getReadableSpan() {
  const startTime = 1566156729709;
  const duration = 2000;
  const readableSpan: ReadableSpan = {
    name: 'my-span',
    kind: types.SpanKind.INTERNAL,
    spanContext: {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
    },
    startTime: [startTime, 0],
    endTime: [startTime + duration, 0],
    duration: [duration, 0],
    status: {
      code: types.CanonicalCode.OK,
    },
    attributes: {},
    links: [],
    events: [],
  };
  return readableSpan;
}

describe('ZipkinExporter', () => {
  describe('constructor', () => {
    it('should construct an exporter', () => {
      const exporter = new ZipkinExporter({ serviceName: 'my-service' });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });
    it('should construct an exporter with url', () => {
      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        url: 'http://localhost',
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });
    it('should construct an exporter with logger', () => {
      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });
    it('should construct an exporter with forceFlush', () => {
      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        forceFlush: false,
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });
    it('should construct an exporter with statusCodeTagName', () => {
      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        statusCodeTagName: 'code',
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });
    it('should construct an exporter with statusDescriptionTagName', () => {
      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        statusDescriptionTagName: 'description',
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });
  });

  describe('export', () => {
    before(() => {
      nock.disableNetConnect();
    });

    after(() => {
      nock.enableNetConnect();
    });

    it('should skip send with empty array', () => {
      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
      });

      exporter.export([], (result: ExportResult) => {
        assert.strictEqual(result, ExportResult.SUCCESS);
      });
    });

    it('should send spans to Zipkin backend and return with Success', () => {
      let requestBody: [zipkinTypes.Span];
      const scope = nock('http://localhost:9411')
        .post('/api/v2/spans', (body: [zipkinTypes.Span]) => {
          requestBody = body;
          return true;
        })
        .reply(202);

      const parentSpanId = '5c1c63257de34c67';
      const startTime = 1566156729709;
      const duration = 2000;

      const span1: ReadableSpan = {
        name: 'my-span',
        kind: types.SpanKind.INTERNAL,
        parentSpanId,
        spanContext: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
        },
        startTime: [startTime, 0],
        endTime: [startTime + duration, 0],
        duration: [duration, 0],
        status: {
          code: types.CanonicalCode.OK,
        },
        attributes: {
          key1: 'value1',
          key2: 'value2',
        },
        links: [],
        events: [
          {
            name: 'my-event',
            time: [startTime + 10, 0],
            attributes: { key3: 'value3' },
          },
        ],
      };
      const span2: ReadableSpan = {
        name: 'my-span',
        kind: types.SpanKind.SERVER,
        spanContext: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
        },
        startTime: [startTime, 0],
        endTime: [startTime + duration, 0],
        duration: [duration, 0],
        status: {
          code: types.CanonicalCode.OK,
        },
        attributes: {},
        links: [],
        events: [],
      };

      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
      });

      exporter.export([span1, span2], (result: ExportResult) => {
        scope.done();
        assert.strictEqual(result, ExportResult.SUCCESS);
        assert.deepStrictEqual(requestBody, [
          // Span 1
          {
            annotations: [
              {
                value: 'my-event',
                timestamp: (startTime + 10) * MICROS_PER_SECS,
              },
            ],
            duration: duration * MICROS_PER_SECS,
            id: span1.spanContext.spanId,
            localEndpoint: {
              serviceName: 'my-service',
            },
            name: span1.name,
            parentId: parentSpanId,
            tags: {
              key1: 'value1',
              key2: 'value2',
              'ot.status_code': 'OK',
            },
            timestamp: startTime * MICROS_PER_SECS,
            traceId: span1.spanContext.traceId,
          },
          // Span 2
          {
            duration: duration * MICROS_PER_SECS,
            id: span2.spanContext.spanId,
            kind: 'SERVER',
            localEndpoint: {
              serviceName: 'my-service',
            },
            name: span2.name,
            tags: {
              'ot.status_code': 'OK',
            },
            timestamp: hrTimeToMicroseconds([startTime, 0]),
            traceId: span2.spanContext.traceId,
          },
        ]);
      });
    });

    it('should support https protocol', () => {
      const scope = nock('https://localhost:9411')
        .post('/api/v2/spans')
        .reply(200);

      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
        url: 'https://localhost:9411/api/v2/spans',
      });

      exporter.export([getReadableSpan()], (result: ExportResult) => {
        scope.done();
        assert.strictEqual(result, ExportResult.SUCCESS);
      });
    });

    it(`should send '${OT_REQUEST_HEADER}' header`, () => {
      const scope = nock('https://localhost:9411')
        .post('/api/v2/spans')
        .reply(function(uri, requestBody, cb) {
          assert.ok(this.req.headers[OT_REQUEST_HEADER]);
          cb(null, [200, 'Ok']);
        });

      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
        url: 'https://localhost:9411/api/v2/spans',
      });

      exporter.export([getReadableSpan()], (result: ExportResult) => {
        scope.done();
        assert.strictEqual(result, ExportResult.SUCCESS);
      });
    });

    it('should return FailedNonRetryable with 4xx', () => {
      const scope = nock('http://localhost:9411')
        .post('/api/v2/spans')
        .reply(400);

      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
      });

      exporter.export([getReadableSpan()], (result: ExportResult) => {
        scope.done();
        assert.strictEqual(result, ExportResult.FAILED_NOT_RETRYABLE);
      });
    });

    it('should return FailedRetryable with 5xx', () => {
      const scope = nock('http://localhost:9411')
        .post('/api/v2/spans')
        .reply(500);

      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
      });

      exporter.export([getReadableSpan()], (result: ExportResult) => {
        scope.done();
        assert.strictEqual(result, ExportResult.FAILED_RETRYABLE);
      });
    });

    it('should return FailedRetryable with socket error', () => {
      const scope = nock('http://localhost:9411')
        .post('/api/v2/spans')
        .replyWithError(new Error('My Socket Error'));

      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        logger: new NoopLogger(),
      });

      exporter.export([getReadableSpan()], (result: ExportResult) => {
        scope.done();
        assert.strictEqual(result, ExportResult.FAILED_RETRYABLE);
      });
    });
  });

  describe('shutdown', () => {
    before(() => {
      nock.disableNetConnect();
    });

    after(() => {
      nock.enableNetConnect();
    });

    // @todo: implement
    it('should send by default');
    it('should not send with forceFlush=false', () => {
      const exporter = new ZipkinExporter({
        serviceName: 'my-service',
        forceFlush: false,
      });

      exporter.shutdown();
    });
  });
});
