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
  isWrapped,
  NoopLogger,
} from '@opentelemetry/core';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import * as tracing from '@opentelemetry/tracing';
import { HttpAttribute } from '@opentelemetry/semantic-conventions';
import {
  PerformanceTimingNames as PTN,
  WebTracerProvider,
  parseUrl,
} from '@opentelemetry/web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { EventNames } from '../src/enums/EventNames';
import { XMLHttpRequestPlugin } from '../src/xhr';

class DummySpanExporter implements tracing.SpanExporter {
  export(spans: any) {}

  shutdown() {}
}

const XHR_TIMEOUT = 2000;

const getData = (
  req: XMLHttpRequest,
  url: string,
  callbackAfterSend: Function,
  async?: boolean
) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    if (async === undefined) {
      async = true;
    }
    req.timeout = XHR_TIMEOUT;

    req.open('GET', url, async);
    req.onload = function () {
      resolve();
    };

    req.onerror = function () {
      resolve();
    };

    req.onabort = function () {
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
    responseEnd: 20.5,
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

function createMasterResource(resource = {}): PerformanceResourceTiming {
  const masterResource: any = createResource(resource);
  Object.keys(masterResource).forEach((key: string) => {
    if (typeof masterResource[key] === 'number') {
      masterResource[key] = masterResource[key] + 30;
    }
  });
  return masterResource;
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
        let clearResourceTimingsSpy: any;
        let rootSpan: api.Span;
        let spyEntries: any;
        const url = 'http://localhost:8090/xml-http-request.js';
        let fakeNow = 0;
        let xmlHttpRequestPlugin: XMLHttpRequestPlugin;

        clearData = () => {
          requests = [];
          sandbox.restore();
          spyEntries.restore();
        };

        prepareData = (done: any, fileUrl: string, config?: any) => {
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
              name: fileUrl,
            }),
            createMasterResource({
              name: fileUrl,
            })
          );

          spyEntries = sandbox.stub(performance, 'getEntriesByType');
          spyEntries.withArgs('resource').returns(resources);
          xmlHttpRequestPlugin = new XMLHttpRequestPlugin(config);
          webTracerProviderWithZone = new WebTracerProvider({
            logLevel: LogLevel.ERROR,
            plugins: [xmlHttpRequestPlugin],
          });
          webTracerWithZone = webTracerProviderWithZone.getTracer('xhr-test');
          dummySpanExporter = new DummySpanExporter();
          exportSpy = sinon.stub(dummySpanExporter, 'export');
          clearResourceTimingsSpy = sandbox.stub(
            (performance as unknown) as Performance,
            'clearResourceTimings'
          );
          webTracerProviderWithZone.addSpanProcessor(
            new tracing.SimpleSpanProcessor(dummySpanExporter)
          );

          rootSpan = webTracerWithZone.startSpan('root');
          webTracerWithZone.withSpan(rootSpan, () => {
            getData(
              new XMLHttpRequest(),
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
          prepareData(done, url, { propagateTraceHeaderCorsUrls });
        });

        afterEach(() => {
          clearData();
        });

        it('should patch to wrap XML HTTP Requests when enabled', () => {
          const xhttp = new XMLHttpRequest();
          assert.ok(isWrapped(xhttp.send));
          xmlHttpRequestPlugin.enable(
            XMLHttpRequest.prototype,
            new api.NoopTracerProvider(),
            new NoopLogger()
          );
          assert.ok(isWrapped(xhttp.send));
        });

        it('should unpatch to unwrap XML HTTP Requests when disabled', () => {
          const xhttp = new XMLHttpRequest();
          assert.ok(isWrapped(xhttp.send));
          xmlHttpRequestPlugin.disable();
          assert.ok(!isWrapped(xhttp.send));
        });

        it('should create a span with correct root span', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(
            span.parentSpanId,
            rootSpan.context().spanId,
            'parent span is not root span'
          );
        });

        it('span should have correct name', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(span.name, 'HTTP GET', 'span has wrong name');
        });

        it('span should have correct kind', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(
            span.kind,
            api.SpanKind.CLIENT,
            'span has wrong kind'
          );
        });

        it('span should have correct attributes', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          const attributes = span.attributes;
          const keys = Object.keys(attributes);

          assert.strictEqual(
            attributes[keys[0]],
            'GET',
            `attributes ${HttpAttribute.HTTP_METHOD} is wrong`
          );
          assert.strictEqual(
            attributes[keys[1]],
            url,
            `attributes ${HttpAttribute.HTTP_URL} is wrong`
          );
          assert.ok(
            (attributes[keys[2]] as number) > 0,
            'attributes ${HttpAttributes.HTTP_RESPONSE_CONTENT_SIZE} <= 0'
          );
          assert.strictEqual(
            attributes[keys[3]],
            200,
            `attributes ${HttpAttribute.HTTP_STATUS_CODE} is wrong`
          );
          assert.strictEqual(
            attributes[keys[4]],
            'OK',
            `attributes ${HttpAttribute.HTTP_STATUS_TEXT} is wrong`
          );
          assert.strictEqual(
            attributes[keys[5]],
            parseUrl(url).host,
            `attributes ${HttpAttribute.HTTP_HOST} is wrong`
          );
          assert.ok(
            attributes[keys[6]] === 'http' || attributes[keys[6]] === 'https',
            `attributes ${HttpAttribute.HTTP_SCHEME} is wrong`
          );
          assert.ok(
            attributes[keys[7]] !== '',
            `attributes ${HttpAttribute.HTTP_USER_AGENT} is not defined`
          );

          assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
        });

        it('span should have correct events', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
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

        it('should create a span for preflight request', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          const parentSpan: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(
            span.parentSpanId,
            parentSpan.spanContext.spanId,
            'parent span is not root span'
          );
        });

        it('preflight request span should have correct name', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          assert.strictEqual(
            span.name,
            'CORS Preflight',
            'preflight request span has wrong name'
          );
        });

        it('preflight request span should have correct kind', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          assert.strictEqual(
            span.kind,
            api.SpanKind.INTERNAL,
            'span has wrong kind'
          );
        });

        it('preflight request span should have correct events', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          const events = span.events;
          assert.strictEqual(events.length, 9, 'number of events is wrong');

          assert.strictEqual(
            events[0].name,
            PTN.FETCH_START,
            `event ${PTN.FETCH_START} is not defined`
          );
          assert.strictEqual(
            events[1].name,
            PTN.DOMAIN_LOOKUP_START,
            `event ${PTN.DOMAIN_LOOKUP_START} is not defined`
          );
          assert.strictEqual(
            events[2].name,
            PTN.DOMAIN_LOOKUP_END,
            `event ${PTN.DOMAIN_LOOKUP_END} is not defined`
          );
          assert.strictEqual(
            events[3].name,
            PTN.CONNECT_START,
            `event ${PTN.CONNECT_START} is not defined`
          );
          assert.strictEqual(
            events[4].name,
            PTN.SECURE_CONNECTION_START,
            `event ${PTN.SECURE_CONNECTION_START} is not defined`
          );
          assert.strictEqual(
            events[5].name,
            PTN.CONNECT_END,
            `event ${PTN.CONNECT_END} is not defined`
          );
          assert.strictEqual(
            events[6].name,
            PTN.REQUEST_START,
            `event ${PTN.REQUEST_START} is not defined`
          );
          assert.strictEqual(
            events[7].name,
            PTN.RESPONSE_START,
            `event ${PTN.RESPONSE_START} is not defined`
          );
          assert.strictEqual(
            events[8].name,
            PTN.RESPONSE_END,
            `event ${PTN.RESPONSE_END} is not defined`
          );
        });

        it('should NOT clear the resources', () => {
          assert.ok(
            clearResourceTimingsSpy.notCalled,
            'resources have been cleared'
          );
        });

        describe('AND origin match with window.location', () => {
          beforeEach(done => {
            clearData();
            // this won't generate a preflight span
            const propagateTraceHeaderCorsUrls = [url];
            prepareData(done, window.location.origin + '/xml-http-request.js', {
              propagateTraceHeaderCorsUrls,
            });
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
                { propagateTraceHeaderCorsUrls: /raw\.githubusercontent\.com/ }
              );
            });
            it('should set trace headers', () => {
              // span at exportSpy.args[0][0][0] is the preflight span
              const span: api.Span = exportSpy.args[1][0][0];
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

        describe('when url is ignored', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = url;
            prepareData(done, url, {
              propagateTraceHeaderCorsUrls,
              ignoreUrls: [propagateTraceHeaderCorsUrls],
            });
          });

          it('should NOT create any span', () => {
            assert.ok(exportSpy.notCalled, "span shouldn't be exported");
          });
        });

        describe('when clearTimingResources is set', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = url;
            prepareData(done, url, {
              propagateTraceHeaderCorsUrls,
              clearTimingResources: true,
            });
          });

          it('should clear the resources', () => {
            assert.ok(
              clearResourceTimingsSpy.calledOnce,
              "resources haven't been cleared"
            );
          });
        });

        describe('when reusing the same XML Http request', () => {
          const firstUrl = 'http://localhost:8090/get';
          const secondUrl = 'http://localhost:8099/get';

          beforeEach(done => {
            requests = [];
            const resources: PerformanceResourceTiming[] = [];
            resources.push(
              createResource({
                name: firstUrl,
              }),
              createResource({
                name: secondUrl,
              })
            );
            const reusableReq = new XMLHttpRequest();
            webTracerWithZone.withSpan(rootSpan, () => {
              getData(
                reusableReq,
                firstUrl,
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sandbox.clock.tick(1000);
              });
            });

            webTracerWithZone.withSpan(rootSpan, () => {
              getData(
                reusableReq,
                secondUrl,
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sandbox.clock.tick(1000);
                done();
              });

              assert.strictEqual(
                requests.length,
                1,
                'first request not called'
              );

              requests[0].respond(
                200,
                { 'Content-Type': 'application/json' },
                '{"foo":"bar"}'
              );
            });
          });

          it('should clear previous span information', () => {
            const span: tracing.ReadableSpan = exportSpy.args[2][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[1]],
              secondUrl,
              `attribute ${HttpAttribute.HTTP_URL} is wrong`
            );
          });
        });
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

        beforeEach(() => {
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
        });

        afterEach(() => {
          clearData();
        });

        describe('when request loads and receives an error code', () => {
          beforeEach(done => {
            webTracerWithZone.withSpan(rootSpan, () => {
              getData(
                new XMLHttpRequest(),
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
          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[0]],
              'GET',
              `attributes ${HttpAttribute.HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[keys[1]],
              url,
              `attributes ${HttpAttribute.HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[keys[2]],
              400,
              `attributes ${HttpAttribute.HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[keys[3]],
              'Bad Request',
              `attributes ${HttpAttribute.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[keys[4]],
              'raw.githubusercontent.com',
              `attributes ${HttpAttribute.HTTP_HOST} is wrong`
            );
            assert.ok(
              attributes[keys[5]] === 'http' || attributes[keys[5]] === 'https',
              `attributes ${HttpAttribute.HTTP_SCHEME} is wrong`
            );
            assert.ok(
              attributes[keys[6]] !== '',
              `attributes ${HttpAttribute.HTTP_USER_AGENT} is not defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
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

        describe('when request encounters a network error', () => {
          beforeEach(done => {
            webTracerWithZone.withSpan(rootSpan, () => {
              getData(new XMLHttpRequest(), url, () => {}, testAsync).then(
                () => {
                  fakeNow = 0;
                  sandbox.clock.tick(1000);
                  done();
                }
              );

              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].error();
            });
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[0]],
              'GET',
              `attributes ${HttpAttribute.HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[keys[1]],
              url,
              `attributes ${HttpAttribute.HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[keys[2]],
              0,
              `attributes ${HttpAttribute.HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[keys[3]],
              '',
              `attributes ${HttpAttribute.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[keys[4]],
              'raw.githubusercontent.com',
              `attributes ${HttpAttribute.HTTP_HOST} is wrong`
            );
            assert.ok(
              attributes[keys[5]] === 'http' || attributes[keys[5]] === 'https',
              `attributes ${HttpAttribute.HTTP_SCHEME} is wrong`
            );
            assert.ok(
              attributes[keys[6]] !== '',
              `attributes ${HttpAttribute.HTTP_USER_AGENT} is not defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
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
              EventNames.EVENT_ERROR,
              `event ${EventNames.EVENT_ERROR} is not defined`
            );

            assert.strictEqual(events.length, 3, 'number of events is wrong');
          });
        });

        describe('when request is aborted', () => {
          before(function () {
            // Can only abort Async requests
            if (!testAsync) {
              this.skip();
            }
          });

          beforeEach(done => {
            webTracerWithZone.withSpan(rootSpan, () => {
              getData(new XMLHttpRequest(), url, () => {}, testAsync).then(
                () => {
                  fakeNow = 0;
                  sandbox.clock.tick(1000);
                  done();
                }
              );

              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].abort();
            });
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[0]],
              'GET',
              `attributes ${HttpAttribute.HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[keys[1]],
              url,
              `attributes ${HttpAttribute.HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[keys[2]],
              0,
              `attributes ${HttpAttribute.HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[keys[3]],
              '',
              `attributes ${HttpAttribute.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[keys[4]],
              'raw.githubusercontent.com',
              `attributes ${HttpAttribute.HTTP_HOST} is wrong`
            );
            assert.ok(
              attributes[keys[5]] === 'http' || attributes[keys[5]] === 'https',
              `attributes ${HttpAttribute.HTTP_SCHEME} is wrong`
            );
            assert.ok(
              attributes[keys[6]] !== '',
              `attributes ${HttpAttribute.HTTP_USER_AGENT} is not defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
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
              EventNames.EVENT_ABORT,
              `event ${EventNames.EVENT_ABORT} is not defined`
            );

            assert.strictEqual(events.length, 3, 'number of events is wrong');
          });
        });

        describe('when request times out', () => {
          before(function () {
            // Can only set timeout for Async requests
            if (!testAsync) {
              this.skip();
            }
          });

          beforeEach(done => {
            webTracerWithZone.withSpan(rootSpan, () => {
              getData(
                new XMLHttpRequest(),
                url,
                () => {
                  sandbox.clock.tick(XHR_TIMEOUT);
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sandbox.clock.tick(1000);
                done();
              });
            });
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[0]],
              'GET',
              `attributes ${HttpAttribute.HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[keys[1]],
              url,
              `attributes ${HttpAttribute.HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[keys[2]],
              0,
              `attributes ${HttpAttribute.HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[keys[3]],
              '',
              `attributes ${HttpAttribute.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[keys[4]],
              'raw.githubusercontent.com',
              `attributes ${HttpAttribute.HTTP_HOST} is wrong`
            );
            assert.ok(
              attributes[keys[5]] === 'http' || attributes[keys[5]] === 'https',
              `attributes ${HttpAttribute.HTTP_SCHEME} is wrong`
            );
            assert.ok(
              attributes[keys[6]] !== '',
              `attributes ${HttpAttribute.HTTP_USER_AGENT} is not defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
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
              EventNames.EVENT_TIMEOUT,
              `event ${EventNames.EVENT_TIMEOUT} is not defined`
            );

            assert.strictEqual(events.length, 3, 'number of events is wrong');
          });
        });
      });
    });
  });
});
