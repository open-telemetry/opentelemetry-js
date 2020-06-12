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
  B3Propagator,
  LogLevel,
  otperformance as performance,
  X_B3_SAMPLED,
  X_B3_SPAN_ID,
  X_B3_TRACE_ID,
} from '@opentelemetry/core';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import * as tracing from '@opentelemetry/tracing';
import {
  PerformanceTimingNames as PTN,
  WebTracerProvider,
} from '@opentelemetry/web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { AttributeNames } from '../src/enums/AttributeNames';
import { EventNames } from '../src/enums/EventNames';
import { XMLHttpRequestPlugin } from '../src/xhr';

class DummySpanExporter implements tracing.SpanExporter {
  export(spans: any) {}

  shutdown() {}
}

const getData = (url: string, callbackAfterSend: Function, async?: boolean) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    if (async === undefined) {
      async = true;
    }
    const req = new XMLHttpRequest();
    req.open('GET', url, async);
    req.onload = function () {
      resolve();
    };

    req.onerror = function () {
      resolve();
    };

    req.ontimeout = function () {
      resolve();
    };
    req.send();

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
  const asyncTests = [{ async: true }, { async: false }];
  asyncTests.forEach(test => {
    const testAsync = test.async;
    describe(`when async='${testAsync}'`, () => {
      let sandbox: sinon.SinonSandbox;
      let requests: any[] = [];
      let prepareData: any;
      let clearData: any;
      let contextManager: ZoneContextManager;

      beforeEach(() => {
        contextManager = new ZoneContextManager().enable();
        api.context.setGlobalContextManager(contextManager);
      });

      afterEach(() => {
        api.context.disable();
      });

      before(() => {
        api.propagation.setGlobalPropagator(new B3Propagator());
      });

      describe('when request is successful', () => {
        let webTracerWithZone: api.Tracer;
        let webTracerProviderWithZone: WebTracerProvider;
        let dummySpanExporter: DummySpanExporter;
        let exportSpy: any;
        let rootSpan: api.Span;
        let spyEntries: any;
        const url = `${window.location.origin}/xml-http-request.js`;
        let fakeNow = 0;

        clearData = () => {
          requests = [];
          sandbox.restore();
          spyEntries.restore();
        };

        prepareData = (
          done: any,
          fileUrl: string,
          propagateTraceHeaderCorsUrls?: any
        ) => {
          sandbox = sinon.createSandbox();
          const fakeXhr = sandbox.useFakeXMLHttpRequest();
          fakeXhr.onCreate = function (xhr: any) {
            requests.push(xhr);
          };
          sandbox.useFakeTimers();

          sandbox.stub(performance, 'timeOrigin').value(0);
          sandbox.stub(performance, 'now').callsFake(() => fakeNow);

          const resources: PerformanceResourceTiming[] = [];
          resources.push(
            createResource({
              name: url,
            })
          );

          spyEntries = sandbox.stub(performance, 'getEntriesByType');
          spyEntries.withArgs('resource').returns(resources);

          webTracerProviderWithZone = new WebTracerProvider({
            logLevel: LogLevel.ERROR,
            plugins: [
              new XMLHttpRequestPlugin({
                propagateTraceHeaderCorsUrls: propagateTraceHeaderCorsUrls,
              }),
            ],
          });
          webTracerWithZone = webTracerProviderWithZone.getTracer('xhr-test');
          dummySpanExporter = new DummySpanExporter();
          exportSpy = sinon.stub(dummySpanExporter, 'export');
          webTracerProviderWithZone.addSpanProcessor(
            new tracing.SimpleSpanProcessor(dummySpanExporter)
          );

          rootSpan = webTracerWithZone.startSpan('root');
          webTracerWithZone.withSpan(rootSpan, () => {
            getData(
              fileUrl,
              () => {
                fakeNow = 100;
              },
              testAsync
            ).then(() => {
              fakeNow = 0;
              sandbox.clock.tick(1000);
              done();
            });
            assert.strictEqual(requests.length, 1, 'request not called');

            requests[0].respond(
              200,
              { 'Content-Type': 'application/json' },
              '{"foo":"bar"}'
            );
          });
        };

        beforeEach(done => {
          const propagateTraceHeaderCorsUrls = [window.location.origin];
          prepareData(done, url, propagateTraceHeaderCorsUrls);
        });

        afterEach(() => {
          clearData();
        });

        it('should create a span with correct root span', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          assert.strictEqual(
            span.parentSpanId,
            rootSpan.context().spanId,
            'parent span is not root span'
          );
        });

        it('span should have correct name', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          assert.strictEqual(span.name, url, 'span has wrong name');
        });

        it('span should have correct kind', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          assert.strictEqual(
            span.kind,
            api.SpanKind.CLIENT,
            'span has wrong kind'
          );
        });

        it('span should have correct attributes', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
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
            window.location.host,
            `attributes ${AttributeNames.HTTP_HOST} is wrong`
          );
          assert.ok(
            attributes[keys[6]] === 'http' || attributes[keys[6]] === 'https',
            `attributes ${AttributeNames.HTTP_SCHEME} is wrong`
          );
          assert.ok(
            attributes[keys[7]] !== '',
            `attributes ${AttributeNames.HTTP_USER_AGENT} is not defined`
          );

          assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
        });

        it('span should have correct events', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
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

        describe('AND origin match with window.location', () => {
          it('should set trace headers', () => {
            const span: api.Span = exportSpy.args[0][0][0];
            assert.strictEqual(
              requests[0].requestHeaders[X_B3_TRACE_ID],
              span.context().traceId,
              `trace header '${X_B3_TRACE_ID}' not set`
            );
            assert.strictEqual(
              requests[0].requestHeaders[X_B3_SPAN_ID],
              span.context().spanId,
              `trace header '${X_B3_SPAN_ID}' not set`
            );
            assert.strictEqual(
              requests[0].requestHeaders[X_B3_SAMPLED],
              String(span.context().traceFlags),
              `trace header '${X_B3_SAMPLED}' not set`
            );
          });
        });

        describe(
          'AND origin does NOT match window.location but match with' +
            ' propagateTraceHeaderCorsUrls',
          () => {
            beforeEach(done => {
              clearData();
              prepareData(
                done,
                'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json',
                /raw\.githubusercontent\.com/
              );
            });
            it('should set trace headers', () => {
              const span: api.Span = exportSpy.args[0][0][0];
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_TRACE_ID],
                span.context().traceId,
                `trace header '${X_B3_TRACE_ID}' not set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SPAN_ID],
                span.context().spanId,
                `trace header '${X_B3_SPAN_ID}' not set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SAMPLED],
                String(span.context().traceFlags),
                `trace header '${X_B3_SAMPLED}' not set`
              );
            });
          }
        );
        describe(
          'AND origin does NOT match window.location And does NOT match' +
            ' with propagateTraceHeaderCorsUrls',
          () => {
            beforeEach(done => {
              clearData();
              prepareData(
                done,
                'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json'
              );
            });
            it('should NOT set trace headers', () => {
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_TRACE_ID],
                undefined,
                `trace header '${X_B3_TRACE_ID}' should not be set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SPAN_ID],
                undefined,
                `trace header '${X_B3_SPAN_ID}' should not be set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SAMPLED],
                undefined,
                `trace header '${X_B3_SAMPLED}' should not be set`
              );
            });
          }
        );
      });

      describe('when request is NOT successful', () => {
        let webTracerWithZoneProvider: WebTracerProvider;
        let webTracerWithZone: api.Tracer;
        let dummySpanExporter: DummySpanExporter;
        let exportSpy: any;
        let rootSpan: api.Span;
        let spyEntries: any;
        const url =
          'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
        let fakeNow = 0;

        beforeEach(done => {
          sandbox = sinon.createSandbox();
          const fakeXhr = sandbox.useFakeXMLHttpRequest();
          fakeXhr.onCreate = function (xhr: any) {
            requests.push(xhr);
          };

          sandbox.useFakeTimers();

          sandbox.stub(performance, 'timeOrigin').value(0);
          sandbox.stub(performance, 'now').callsFake(() => fakeNow);

          const resources: PerformanceResourceTiming[] = [];
          resources.push(
            createResource({
              name: url,
            })
          );

          spyEntries = sandbox.stub(performance, 'getEntriesByType');
          spyEntries.withArgs('resource').returns(resources);

          webTracerWithZoneProvider = new WebTracerProvider({
            logLevel: LogLevel.ERROR,
            plugins: [new XMLHttpRequestPlugin()],
          });
          dummySpanExporter = new DummySpanExporter();
          exportSpy = sinon.stub(dummySpanExporter, 'export');
          webTracerWithZoneProvider.addSpanProcessor(
            new tracing.SimpleSpanProcessor(dummySpanExporter)
          );
          webTracerWithZone = webTracerWithZoneProvider.getTracer('xhr-test');

          rootSpan = webTracerWithZone.startSpan('root');

          webTracerWithZone.withSpan(rootSpan, () => {
            getData(
              url,
              () => {
                fakeNow = 100;
              },
              testAsync
            ).then(() => {
              fakeNow = 0;
              sandbox.clock.tick(1000);
              done();
            });
            assert.strictEqual(requests.length, 1, 'request not called');
            requests[0].respond(
              400,
              { 'Content-Type': 'text/plain' },
              'Bad Request'
            );
          });
        });

        afterEach(() => {
          clearData();
        });

        it('span should have correct attributes', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
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
            `attributes ${AttributeNames.HTTP_HOST} is wrong`
          );
          assert.ok(
            attributes[keys[6]] === 'http' || attributes[keys[6]] === 'https',
            `attributes ${AttributeNames.HTTP_SCHEME} is wrong`
          );
          assert.ok(
            attributes[keys[7]] !== '',
            `attributes ${AttributeNames.HTTP_USER_AGENT} is not defined`
          );

          assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
        });

        it('span should have correct events', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
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
  });
});
