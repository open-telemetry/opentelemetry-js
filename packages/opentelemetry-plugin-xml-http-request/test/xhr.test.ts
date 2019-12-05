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
import * as assert from 'assert';
import * as sinon from 'sinon';

import { LogLevel, otperformance as performance } from '@opentelemetry/core';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';
import * as tracing from '@opentelemetry/tracing';
import * as types from '@opentelemetry/types';
import { PerformanceTimingNames as PTN, WebTracer } from '@opentelemetry/web';
import { AttributeNames } from '../src/enums/AttributeNames';
import { EventNames } from '../src/enums/EventNames';
import { TRACE_HEADERS } from '../src/enums/xhr';
import { XMLHttpRequestPlugin } from '../src/xhr';

class DummySpanExporter implements tracing.SpanExporter {
  export(spans: any) {}

  shutdown() {}
}

const getData = (url: string, callbackAfterSend: Function) => {
  return new Promise(async (resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.send();
    req.onload = function() {
      resolve();
    };

    req.onerror = function() {
      resolve();
    };

    req.ontimeout = function() {
      resolve();
    };

    callbackAfterSend();
  });
};

function createResource(resource = {}): PerformanceResourceTiming {
  const defaultResource = {
    connectEnd: 15,
    connectStart: 13,
    decodedBodySize: 0,
    domainLookupEnd: 12,
    domainLookupStart: 11,
    encodedBodySize: 0,
    fetchStart: 10.1,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: '',
    redirectEnd: 0,
    redirectStart: 0,
    requestStart: 16,
    responseEnd: 80.5,
    responseStart: 17,
    secureConnectionStart: 14,
    transferSize: 0,
    workerStart: 0,
    duration: 0,
    entryType: '',
    name: '',
    startTime: 0,
  };
  return Object.assign(
    {},
    defaultResource,
    resource
  ) as PerformanceResourceTiming;
}

describe('xhr', () => {
  let sandbox: sinon.SinonSandbox;
  let fakeXhr: any;
  let requests: any[] = [];
  let prepareData: any;
  let clearData: any;
  beforeEach(() => {
    fakeXhr = sinon.useFakeXMLHttpRequest();
    fakeXhr.onCreate = function(xhr: any) {
      requests.push(xhr);
    };
  });

  afterEach(() => {
    fakeXhr.restore();
    requests = [];
  });

  describe('when request is successful', () => {
    let webTracerWithZone: WebTracer;
    let dummySpanExporter: DummySpanExporter;
    let exportSpy: any;
    let rootSpan: types.Span;
    let spyEntries: any;
    const url = window.location.origin;
    let fakeNow = 0;

    clearData = () => {
      requests = [];
      sandbox.restore();
      spyEntries.restore();
    };

    prepareData = (done: any, propagateTraceHeaderUrls?: any) => {
      sandbox = sinon.createSandbox();
      sandbox.stub(performance, 'timeOrigin').value(0);
      sandbox.stub(performance, 'now').callsFake(() => fakeNow);

      const resources: PerformanceResourceTiming[] = [];
      resources.push(
        createResource({
          name: url,
        })
      );

      spyEntries = sinon.stub(window.performance, 'getEntriesByType');
      spyEntries.withArgs('resource').returns(resources);

      webTracerWithZone = new WebTracer({
        logLevel: LogLevel.WARN,
        scopeManager: new ZoneScopeManager(),
        plugins: [
          new XMLHttpRequestPlugin({
            propagateTraceHeaderUrls,
          }),
        ],
      });
      dummySpanExporter = new DummySpanExporter();
      exportSpy = sinon.stub(dummySpanExporter, 'export');
      webTracerWithZone.addSpanProcessor(
        new tracing.SimpleSpanProcessor(dummySpanExporter)
      );

      rootSpan = webTracerWithZone.startSpan('root');

      webTracerWithZone.withSpan(rootSpan, () => {
        getData(url, () => {
          fakeNow = 100;
        }).then(() => {
          fakeNow = 0;
          done();
        });
        assert.strictEqual(requests.length, 1, 'request not called');
        setTimeout(() => {
          requests[0].respond(
            200,
            { 'Content-Type': 'application/json' },
            '{"foo":"bar"}'
          );
        });
      });
    };

    beforeEach(done => {
      const propagateTraceHeaderUrls = [window.location.origin];
      prepareData(done, propagateTraceHeaderUrls);
    });

    afterEach(() => {
      clearData();
    });

    it('current span should be root span', () => {
      assert.strictEqual(
        webTracerWithZone.getCurrentSpan(),
        rootSpan,
        'root span is wrong'
      );
    });

    it('should create a span with correct root span', () => {
      const span = exportSpy.args[0][0][0] as tracing.ReadableSpan;
      assert.strictEqual(
        span.parentSpanId,
        rootSpan.context().spanId,
        'parent span is not root span'
      );
    });

    it('span should have correct name', () => {
      const span = exportSpy.args[0][0][0] as tracing.ReadableSpan;
      assert.strictEqual(span.name, url, 'span has wrong name');
    });

    it('span should have correct attributes', () => {
      const span = exportSpy.args[0][0][0] as tracing.ReadableSpan;
      const attributes = span.attributes;
      const keys = Object.keys(attributes);

      assert.ok(
        attributes[keys[0]] !== '',
        `attributes ${AttributeNames.COMPONENT} is not defined`
      );
      assert.strictEqual(
        attributes[keys[1]],
        'GET',
        `attributes ${AttributeNames.HTTP_METHOD} is wrong`
      );
      assert.strictEqual(
        attributes[keys[2]],
        url,
        `attributes ${AttributeNames.HTTP_URL} is wrong`
      );
      assert.strictEqual(
        attributes[keys[3]],
        200,
        `attributes ${AttributeNames.HTTP_STATUS_CODE} is wrong`
      );
      assert.strictEqual(
        attributes[keys[4]],
        'OK',
        `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
      );
      assert.strictEqual(
        attributes[keys[5]],
        'localhost',
        `attributes ${AttributeNames.HTTP_HOSTNAME} is wrong`
      );
      assert.strictEqual(
        attributes[keys[6]],
        '/',
        `attributes ${AttributeNames.HTTP_PATH} is wrong`
      );
      assert.ok(
        attributes[keys[7]] !== '',
        `attributes ${AttributeNames.HTTP_USER_AGENT} is not defined`
      );

      assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
    });

    it('span should have correct events', () => {
      const span = exportSpy.args[0][0][0] as tracing.ReadableSpan;
      const events = span.events;

      assert.strictEqual(
        events[0].name,
        EventNames.METHOD_OPEN,
        `event ${EventNames.METHOD_OPEN} is not defined`
      );
      assert.strictEqual(
        events[1].name,
        EventNames.METHOD_SEND,
        `event ${EventNames.METHOD_SEND} is not defined`
      );
      assert.strictEqual(
        events[2].name,
        PTN.FETCH_START,
        `event ${PTN.FETCH_START} is not defined`
      );
      assert.strictEqual(
        events[3].name,
        PTN.DOMAIN_LOOKUP_START,
        `event ${PTN.DOMAIN_LOOKUP_START} is not defined`
      );
      assert.strictEqual(
        events[4].name,
        PTN.DOMAIN_LOOKUP_END,
        `event ${PTN.DOMAIN_LOOKUP_END} is not defined`
      );
      assert.strictEqual(
        events[5].name,
        PTN.CONNECT_START,
        `event ${PTN.CONNECT_START} is not defined`
      );
      assert.strictEqual(
        events[6].name,
        PTN.SECURE_CONNECTION_START,
        `event ${PTN.SECURE_CONNECTION_START} is not defined`
      );
      assert.strictEqual(
        events[7].name,
        PTN.CONNECT_END,
        `event ${PTN.CONNECT_END} is not defined`
      );
      assert.strictEqual(
        events[8].name,
        PTN.REQUEST_START,
        `event ${PTN.REQUEST_START} is not defined`
      );
      assert.strictEqual(
        events[9].name,
        PTN.RESPONSE_START,
        `event ${PTN.RESPONSE_START} is not defined`
      );
      assert.strictEqual(
        events[10].name,
        PTN.RESPONSE_END,
        `event ${PTN.RESPONSE_END} is not defined`
      );
      assert.strictEqual(
        events[11].name,
        EventNames.EVENT_LOAD,
        `event ${EventNames.EVENT_LOAD} is not defined`
      );

      assert.strictEqual(events.length, 12, 'number of events is wrong');
    });

    describe('AND origin match with propagateTraceHeaderUrls', () => {
      it('should set trace headers', () => {
        const span = exportSpy.args[0][0][0] as tracing.ReadableSpan;
        assert.strictEqual(
          requests[0].requestHeaders[TRACE_HEADERS.TRACE_ID],
          span.spanContext.traceId,
          `trace header '${TRACE_HEADERS.TRACE_ID}' not set`
        );
        assert.strictEqual(
          requests[0].requestHeaders[TRACE_HEADERS.SPAN_ID],
          span.spanContext.spanId,
          `trace header '${TRACE_HEADERS.SPAN_ID}' not set`
        );
        assert.strictEqual(
          requests[0].requestHeaders[TRACE_HEADERS.SAMPLED],
          String(span.spanContext.traceFlags),
          `trace header '${TRACE_HEADERS.SAMPLED}' not set`
        );
      });
    });

    describe('AND origin does NOT match with propagateTraceHeaderUrls', () => {
      beforeEach(done => {
        clearData();
        prepareData(done);
      });
      it('should NOT set trace headers', () => {
        assert.strictEqual(
          requests[0].requestHeaders[TRACE_HEADERS.TRACE_ID],
          undefined,
          `trace header '${TRACE_HEADERS.TRACE_ID}' should not be set`
        );
        assert.strictEqual(
          requests[0].requestHeaders[TRACE_HEADERS.SPAN_ID],
          undefined,
          `trace header '${TRACE_HEADERS.SPAN_ID}' should not be set`
        );
        assert.strictEqual(
          requests[0].requestHeaders[TRACE_HEADERS.SAMPLED],
          undefined,
          `trace header '${TRACE_HEADERS.SAMPLED}' should not be set`
        );
      });
    });
  });

  describe('when request is NOT successful', () => {
    let webTracerWithZone: WebTracer;
    let dummySpanExporter: DummySpanExporter;
    let exportSpy: any;
    let rootSpan: types.Span;
    let spyEntries: any;
    const url =
      'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
    let fakeNow = 0;
    beforeEach(done => {
      sandbox = sinon.createSandbox();
      sandbox.stub(performance, 'timeOrigin').value(0);
      sandbox.stub(performance, 'now').callsFake(() => fakeNow);

      const resources: PerformanceResourceTiming[] = [];
      resources.push(
        createResource({
          name: url,
        })
      );

      spyEntries = sinon.stub(window.performance, 'getEntriesByType');
      spyEntries.withArgs('resource').returns(resources);

      webTracerWithZone = new WebTracer({
        logLevel: LogLevel.WARN,
        scopeManager: new ZoneScopeManager(),
        plugins: [new XMLHttpRequestPlugin()],
      });
      dummySpanExporter = new DummySpanExporter();
      exportSpy = sinon.stub(dummySpanExporter, 'export');
      webTracerWithZone.addSpanProcessor(
        new tracing.SimpleSpanProcessor(dummySpanExporter)
      );

      rootSpan = webTracerWithZone.startSpan('root');

      webTracerWithZone.withSpan(rootSpan, () => {
        getData(url, () => {
          fakeNow = 100;
        }).then(() => {
          fakeNow = 0;
          done();
        });
        assert.strictEqual(requests.length, 1, 'request not called');
        setTimeout(() => {
          requests[0].respond(
            400,
            { 'Content-Type': 'text/plain' },
            'Bad Request'
          );
        });
      });
    });

    afterEach(() => {
      sandbox.restore();
      spyEntries.restore();
    });

    it('span should have correct attributes', () => {
      const span = exportSpy.args[0][0][0] as tracing.ReadableSpan;
      const attributes = span.attributes;
      const keys = Object.keys(attributes);

      assert.ok(
        attributes[keys[0]] !== '',
        `attributes ${AttributeNames.COMPONENT} is not defined`
      );
      assert.strictEqual(
        attributes[keys[1]],
        'GET',
        `attributes ${AttributeNames.HTTP_METHOD} is wrong`
      );
      assert.strictEqual(
        attributes[keys[2]],
        url,
        `attributes ${AttributeNames.HTTP_URL} is wrong`
      );
      assert.strictEqual(
        attributes[keys[3]],
        400,
        `attributes ${AttributeNames.HTTP_STATUS_CODE} is wrong`
      );
      assert.strictEqual(
        attributes[keys[4]],
        'Bad Request',
        `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
      );
      assert.strictEqual(
        attributes[keys[5]],
        'raw.githubusercontent.com',
        `attributes ${AttributeNames.HTTP_HOSTNAME} is wrong`
      );
      assert.strictEqual(
        attributes[keys[6]],
        '/open-telemetry/opentelemetry-js/master/package.json',
        `attributes ${AttributeNames.HTTP_PATH} is wrong`
      );
      assert.ok(
        attributes[keys[7]] !== '',
        `attributes ${AttributeNames.HTTP_USER_AGENT} is not defined`
      );

      assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
    });

    it('span should have correct events', () => {
      const span = exportSpy.args[0][0][0] as tracing.ReadableSpan;
      const events = span.events;

      assert.strictEqual(
        events[0].name,
        EventNames.METHOD_OPEN,
        `event ${EventNames.METHOD_OPEN} is not defined`
      );
      assert.strictEqual(
        events[1].name,
        EventNames.METHOD_SEND,
        `event ${EventNames.METHOD_SEND} is not defined`
      );
      assert.strictEqual(
        events[2].name,
        PTN.FETCH_START,
        `event ${PTN.FETCH_START} is not defined`
      );
      assert.strictEqual(
        events[3].name,
        PTN.DOMAIN_LOOKUP_START,
        `event ${PTN.DOMAIN_LOOKUP_START} is not defined`
      );
      assert.strictEqual(
        events[4].name,
        PTN.DOMAIN_LOOKUP_END,
        `event ${PTN.DOMAIN_LOOKUP_END} is not defined`
      );
      assert.strictEqual(
        events[5].name,
        PTN.CONNECT_START,
        `event ${PTN.CONNECT_START} is not defined`
      );
      assert.strictEqual(
        events[6].name,
        PTN.SECURE_CONNECTION_START,
        `event ${PTN.SECURE_CONNECTION_START} is not defined`
      );
      assert.strictEqual(
        events[7].name,
        PTN.CONNECT_END,
        `event ${PTN.CONNECT_END} is not defined`
      );
      assert.strictEqual(
        events[8].name,
        PTN.REQUEST_START,
        `event ${PTN.REQUEST_START} is not defined`
      );
      assert.strictEqual(
        events[9].name,
        PTN.RESPONSE_START,
        `event ${PTN.RESPONSE_START} is not defined`
      );
      assert.strictEqual(
        events[10].name,
        PTN.RESPONSE_END,
        `event ${PTN.RESPONSE_END} is not defined`
      );
      assert.strictEqual(
        events[11].name,
        EventNames.EVENT_ERROR,
        `event ${EventNames.EVENT_ERROR} is not defined`
      );

      assert.strictEqual(events.length, 12, 'number of events is wrong');
    });
  });
});
