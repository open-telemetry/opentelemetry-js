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
import { otperformance as performance } from '@opentelemetry/core';
import {
  registerInstrumentations,
  isWrapped,
} from '@opentelemetry/instrumentation';
import {
  B3Propagator,
  B3InjectEncoding,
  X_B3_SAMPLED,
  X_B3_SPAN_ID,
  X_B3_TRACE_ID,
} from '@opentelemetry/propagator-b3';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import * as tracing from '@opentelemetry/sdk-trace-base';
import {
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_URL,
  SEMATTRS_HTTP_USER_AGENT,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
} from '@opentelemetry/semantic-conventions';
import {
  PerformanceTimingNames as PTN,
  WebTracerProvider,
  parseUrl,
} from '@opentelemetry/sdk-trace-web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { EventNames } from '../src/enums/EventNames';
import {
  XMLHttpRequestInstrumentation,
  XMLHttpRequestInstrumentationConfig,
} from '../src/xhr';
import { AttributeNames } from '../src/enums/AttributeNames';

class DummySpanExporter implements tracing.SpanExporter {
  export(spans: any) {}

  shutdown() {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

const XHR_TIMEOUT = 2000;

const getData = (
  req: XMLHttpRequest,
  url: string,
  callbackAfterSend: () => void,
  async?: boolean
) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve, reject) => {
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

const postData = (
  req: XMLHttpRequest,
  url: string,
  data: Document | XMLHttpRequestBodyInit,
  callbackAfterSend: () => void,
  async?: boolean
) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve, reject) => {
    if (async === undefined) {
      async = true;
    }
    req.timeout = XHR_TIMEOUT;

    req.open('POST', url, async);
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
    req.send(data);
    callbackAfterSend();
  });
};

function createResource(resource = {}): PerformanceResourceTiming {
  const defaultResource = {
    entryType: 'resource',
    name: '',
    initiatorType: 'xmlhttprequest',
    startTime: 10.1,
    redirectStart: 0,
    redirectEnd: 0,
    workerStart: 0,
    fetchStart: 10.1,
    domainLookupStart: 11,
    domainLookupEnd: 12,
    connectStart: 13,
    secureConnectionStart: 0,
    connectEnd: 15,
    requestStart: 16,
    responseStart: 17,
    responseEnd: 20.5,
    duration: 10.4,
    decodedBodySize: 30,
    encodedBodySize: 30,
    transferSize: 0,
    nextHopProtocol: '',
  };

  if (
    'name' in resource &&
    typeof resource.name === 'string' &&
    resource.name.startsWith('https:')
  ) {
    defaultResource.secureConnectionStart = 14;
  }

  return Object.assign(
    {},
    defaultResource,
    resource
  ) as PerformanceResourceTiming;
}

function createMainResource(resource = {}): PerformanceResourceTiming {
  const mainResource: any = createResource(resource);
  Object.keys(mainResource).forEach((key: string) => {
    if (typeof mainResource[key] === 'number' && mainResource[key] !== 0) {
      mainResource[key] = mainResource[key] + 30;
    }
  });
  return mainResource;
}

function createFakePerformanceObs(url: string) {
  class FakePerfObs implements PerformanceObserver {
    constructor(private readonly cb: PerformanceObserverCallback) {}

    observe() {
      const absoluteUrl = url.startsWith('http') ? url : location.origin + url;
      const resources: PerformanceObserverEntryList = {
        getEntries(): PerformanceEntryList {
          return [
            createResource({ name: absoluteUrl }) as any,
            createMainResource({ name: absoluteUrl }) as any,
          ];
        },
        getEntriesByName(): PerformanceEntryList {
          return [];
        },
        getEntriesByType(): PerformanceEntryList {
          return [];
        },
      };
      this.cb(resources, this);
    }

    disconnect() {}

    takeRecords(): PerformanceEntryList {
      return [];
    }
  }

  return FakePerfObs;
}

function testForCorrectEvents(
  events: tracing.TimedEvent[],
  eventNames: string[]
) {
  for (let i = 0; i < events.length; i++) {
    assert.strictEqual(
      events[i].name,
      eventNames[i],
      `event ${eventNames[i]} is not defined`
    );
  }
}

describe('xhr', () => {
  const asyncTests = [{ async: true }, { async: false }];
  asyncTests.forEach(test => {
    const testAsync = test.async;
    describe(`when async='${testAsync}'`, () => {
      let requests: any[] = [];
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
        api.propagation.setGlobalPropagator(
          new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })
        );
      });

      after(() => {
        api.propagation.disable();
      });

      describe('when GET request is successful', () => {
        let webTracerWithZone: api.Tracer;
        let webTracerProviderWithZone: WebTracerProvider;
        let dummySpanExporter: DummySpanExporter;
        let exportSpy: any;
        let clearResourceTimingsSpy: any;
        let rootSpan: api.Span;
        let spyEntries: any;
        const url = 'http://localhost:8090/xml-http-request.js';
        const secureUrl = 'https://localhost:8090/xml-http-request.js';
        let fakeNow = 0;
        let xmlHttpRequestInstrumentation: XMLHttpRequestInstrumentation;

        clearData = () => {
          requests = [];
          sinon.restore();
        };

        const prepareData = (
          done: any,
          fileUrl: string,
          config?: XMLHttpRequestInstrumentationConfig
        ) => {
          const fakeXhr = sinon.useFakeXMLHttpRequest();
          fakeXhr.onCreate = function (xhr: any) {
            requests.push(xhr);
          };
          sinon.useFakeTimers();

          sinon.stub(performance, 'timeOrigin').value(0);
          sinon.stub(performance, 'now').callsFake(() => fakeNow);

          const resources: PerformanceResourceTiming[] = [];
          resources.push(
            createResource({
              name: fileUrl,
            }),
            createMainResource({
              name: fileUrl,
            })
          );

          spyEntries = sinon.stub(
            performance as unknown as Performance,
            'getEntriesByType'
          );
          spyEntries.withArgs('resource').returns(resources);

          sinon
            .stub(window, 'PerformanceObserver')
            .value(createFakePerformanceObs(fileUrl));

          xmlHttpRequestInstrumentation = new XMLHttpRequestInstrumentation(
            config
          );
          dummySpanExporter = new DummySpanExporter();
          webTracerProviderWithZone = new WebTracerProvider({
            spanProcessors: [
              new tracing.SimpleSpanProcessor(dummySpanExporter),
            ],
          });
          registerInstrumentations({
            instrumentations: [xmlHttpRequestInstrumentation],
            tracerProvider: webTracerProviderWithZone,
          });
          webTracerWithZone = webTracerProviderWithZone.getTracer('xhr-test');

          exportSpy = sinon.stub(dummySpanExporter, 'export');
          clearResourceTimingsSpy = sinon.stub(
            performance as unknown as Performance,
            'clearResourceTimings'
          );

          rootSpan = webTracerWithZone.startSpan('root');
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void getData(
                new XMLHttpRequest(),
                fileUrl,
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });
              assert.strictEqual(requests.length, 1, 'request not called');

              requests[0].respond(
                200,
                { 'Content-Type': 'application/json' },
                '{"foo":"bar"}'
              );
            }
          );
        };

        beforeEach(done => {
          const propagateTraceHeaderCorsUrls = [window.location.origin];
          prepareData(done, url, {
            propagateTraceHeaderCorsUrls,
            measureRequestSize: true,
          });
        });

        afterEach(() => {
          clearData();
        });

        it('should patch to wrap XML HTTP Requests when enabled', () => {
          const xhttp = new XMLHttpRequest();
          assert.ok(isWrapped(xhttp.send));
          xmlHttpRequestInstrumentation.enable();
          assert.ok(isWrapped(xhttp.send));
        });

        it('should unpatch to unwrap XML HTTP Requests when disabled', () => {
          const xhttp = new XMLHttpRequest();
          assert.ok(isWrapped(xhttp.send));
          xmlHttpRequestInstrumentation.disable();
          assert.ok(!isWrapped(xhttp.send));
        });

        it('should create a span with correct root span', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(
            span.parentSpanContext?.spanId,
            rootSpan.spanContext().spanId,
            'parent span is not root span'
          );
        });

        it('span should have correct name', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(span.name, 'GET', 'span has wrong name');
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
            attributes[SEMATTRS_HTTP_METHOD],
            'GET',
            `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_URL],
            url,
            `attributes ${SEMATTRS_HTTP_URL} is wrong`
          );
          const requestContentLength = attributes[
            SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
          ] as number;
          assert.strictEqual(
            requestContentLength,
            undefined,
            `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
          );
          const responseContentLength = attributes[
            SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
          ] as number;
          assert.strictEqual(
            responseContentLength,
            60,
            `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_STATUS_CODE],
            200,
            `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
          );
          assert.strictEqual(
            attributes[AttributeNames.HTTP_STATUS_TEXT],
            'OK',
            `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_HOST],
            parseUrl(url).host,
            `attributes ${SEMATTRS_HTTP_HOST} is wrong`
          );

          const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
          assert.ok(
            httpScheme === 'http' || httpScheme === 'https',
            `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
          );
          assert.notStrictEqual(
            attributes[SEMATTRS_HTTP_USER_AGENT],
            '',
            `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
          );

          assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
        });

        it('span should have correct events', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          const events = span.events;
          testForCorrectEvents(events, [
            EventNames.METHOD_OPEN,
            EventNames.METHOD_SEND,
            PTN.FETCH_START,
            PTN.DOMAIN_LOOKUP_START,
            PTN.DOMAIN_LOOKUP_END,
            PTN.CONNECT_START,
            PTN.CONNECT_END,
            PTN.REQUEST_START,
            PTN.RESPONSE_START,
            PTN.RESPONSE_END,
            EventNames.EVENT_LOAD,
          ]);
          assert.strictEqual(events.length, 11, 'number of events is wrong');
        });

        it('should create a span for preflight request', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          const parentSpan: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(
            span.parentSpanContext?.spanId,
            parentSpan.spanContext().spanId,
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
          assert.strictEqual(events.length, 8, 'number of events is wrong');
          testForCorrectEvents(events, [
            PTN.FETCH_START,
            PTN.DOMAIN_LOOKUP_START,
            PTN.DOMAIN_LOOKUP_END,
            PTN.CONNECT_START,
            PTN.CONNECT_END,
            PTN.REQUEST_START,
            PTN.RESPONSE_START,
            PTN.RESPONSE_END,
          ]);
        });

        it('should NOT clear the resources', () => {
          assert.ok(
            clearResourceTimingsSpy.notCalled,
            'resources have been cleared'
          );
        });
        describe('When making https requests', () => {
          beforeEach(done => {
            clearData();
            // this won't generate a preflight span
            const propagateTraceHeaderCorsUrls = [secureUrl];
            prepareData(done, secureUrl, {
              propagateTraceHeaderCorsUrls,
            });
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const events = span.events;
            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              PTN.FETCH_START,
              PTN.DOMAIN_LOOKUP_START,
              PTN.DOMAIN_LOOKUP_END,
              PTN.CONNECT_START,
              PTN.SECURE_CONNECTION_START,
              PTN.CONNECT_END,
              PTN.REQUEST_START,
              PTN.RESPONSE_START,
              PTN.RESPONSE_END,
              EventNames.EVENT_LOAD,
            ]);
            assert.strictEqual(events.length, 12, 'number of events is wrong');
          });

          it('preflight request span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;
            assert.strictEqual(events.length, 9, 'number of events is wrong');
            testForCorrectEvents(events, [
              PTN.FETCH_START,
              PTN.DOMAIN_LOOKUP_START,
              PTN.DOMAIN_LOOKUP_END,
              PTN.CONNECT_START,
              PTN.SECURE_CONNECTION_START,
              PTN.CONNECT_END,
              PTN.REQUEST_START,
              PTN.RESPONSE_START,
              PTN.RESPONSE_END,
            ]);
          });
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
              span.spanContext().traceId,
              `trace header '${X_B3_TRACE_ID}' not set`
            );
            assert.strictEqual(
              requests[0].requestHeaders[X_B3_SPAN_ID],
              span.spanContext().spanId,
              `trace header '${X_B3_SPAN_ID}' not set`
            );
            assert.strictEqual(
              requests[0].requestHeaders[X_B3_SAMPLED],
              String(span.spanContext().traceFlags),
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
                span.spanContext().traceId,
                `trace header '${X_B3_TRACE_ID}' not set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SPAN_ID],
                span.spanContext().spanId,
                `trace header '${X_B3_SPAN_ID}' not set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SAMPLED],
                String(span.spanContext().traceFlags),
                `trace header '${X_B3_SAMPLED}' not set`
              );
            });
          }
        );
        describe(
          'AND origin does NOT match window.location And does NOT match' +
            ' with propagateTraceHeaderCorsUrls',
          () => {
            let spyDebug: sinon.SinonSpy;
            beforeEach(done => {
              const diagLogger = new api.DiagConsoleLogger();
              spyDebug = sinon.spy();
              diagLogger.debug = spyDebug;
              api.diag.setLogger(diagLogger, api.DiagLogLevel.ALL);
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

            it('should debug info that injecting headers was skipped', () => {
              assert.strictEqual(
                spyDebug.lastCall.args[1],
                'headers inject skipped due to CORS policy'
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
            const reusableReq = new XMLHttpRequest();
            api.context.with(
              api.trace.setSpan(api.context.active(), rootSpan),
              () => {
                void getData(
                  reusableReq,
                  firstUrl,
                  () => {
                    fakeNow = 100;
                  },
                  testAsync
                ).then(() => {
                  fakeNow = 0;
                  sinon.clock.tick(1000);
                });
              }
            );

            api.context.with(
              api.trace.setSpan(api.context.active(), rootSpan),
              () => {
                void getData(
                  reusableReq,
                  secondUrl,
                  () => {
                    fakeNow = 100;
                  },
                  testAsync
                ).then(() => {
                  fakeNow = 0;
                  sinon.clock.tick(1000);
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
              }
            );
          });

          it('should clear previous span information', () => {
            const span: tracing.ReadableSpan = exportSpy.args[2][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[1]],
              secondUrl,
              `attribute ${SEMATTRS_HTTP_URL} is wrong`
            );
          });
        });

        describe('and applyCustomAttributesOnSpan hook is configured', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [url];
            prepareData(done, url, {
              propagateTraceHeaderCorsUrls,
              applyCustomAttributesOnSpan: function (
                span: api.Span,
                xhr: XMLHttpRequest
              ) {
                const res = JSON.parse(xhr.response);
                span.setAttribute('xhr-custom-attribute', res.foo);
              },
            });
          });

          it('span should have custom attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;
            assert.ok(attributes['xhr-custom-attribute'] === 'bar');
          });
        });

        describe('when using relative url', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [window.location.origin];
            prepareData(done, '/get', { propagateTraceHeaderCorsUrls });
          });

          it('should create correct span with events', () => {
            // no prefetch span because mock observer uses location.origin as url when relative
            // and prefetch span finding compares url origins
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;

            assert.strictEqual(
              exportSpy.args.length,
              1,
              `Wrong number of spans: ${exportSpy.args.length}`
            );

            assert.strictEqual(
              events.length,
              11,
              `number of events is wrong: ${events.length}`
            );
            assert.strictEqual(
              events[7].name,
              PTN.REQUEST_START,
              `event ${PTN.REQUEST_START} is not defined`
            );
          });

          it('should have an absolute http.url attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              location.origin + '/get',
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
          });
        });

        describe('when network events are ignored', () => {
          beforeEach(done => {
            clearData();
            prepareData(done, url, {
              ignoreNetworkEvents: true,
            });
          });
          it('should NOT add network events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const events = span.events;
            assert.strictEqual(events.length, 3, 'number of events is wrong');
          });

          it('should still add the CONTENT_LENGTH attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              60,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
            );
          });
        });
      });

      describe('when GET request is NOT successful', () => {
        let webTracerWithZoneProvider: WebTracerProvider;
        let webTracerWithZone: api.Tracer;
        let dummySpanExporter: DummySpanExporter;
        let exportSpy: any;
        let rootSpan: api.Span;
        let spyEntries: any;
        const url =
          'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
        let fakeNow = 0;

        const prepareData = function (
          config: XMLHttpRequestInstrumentationConfig = {}
        ) {
          const fakeXhr = sinon.useFakeXMLHttpRequest();
          fakeXhr.onCreate = function (xhr: any) {
            requests.push(xhr);
          };

          sinon.useFakeTimers();

          sinon.stub(performance, 'timeOrigin').value(0);
          sinon.stub(performance, 'now').callsFake(() => fakeNow);

          const resources: PerformanceResourceTiming[] = [];
          resources.push(
            createResource({
              name: url,
            })
          );

          spyEntries = sinon.stub(
            performance as unknown as Performance,
            'getEntriesByType'
          );
          spyEntries.withArgs('resource').returns(resources);

          dummySpanExporter = new DummySpanExporter();
          webTracerWithZoneProvider = new WebTracerProvider({
            spanProcessors: [
              new tracing.SimpleSpanProcessor(dummySpanExporter),
            ],
          });

          registerInstrumentations({
            instrumentations: [new XMLHttpRequestInstrumentation(config)],
            tracerProvider: webTracerWithZoneProvider,
          });

          exportSpy = sinon.stub(dummySpanExporter, 'export');
          webTracerWithZone = webTracerWithZoneProvider.getTracer('xhr-test');

          rootSpan = webTracerWithZone.startSpan('root');
        };

        beforeEach(() => {
          prepareData();
        });

        afterEach(() => {
          clearData();
        });

        function timedOutRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void getData(
                new XMLHttpRequest(),
                url,
                () => {
                  sinon.clock.tick(XHR_TIMEOUT);
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });
            }
          );
        }

        function abortedRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void getData(new XMLHttpRequest(), url, () => {}, testAsync).then(
                () => {
                  fakeNow = 0;
                  sinon.clock.tick(1000);
                  done();
                }
              );

              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].abort();
            }
          );
        }

        function erroredRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void getData(
                new XMLHttpRequest(),
                url,
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });
              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].respond(
                400,
                { 'Content-Type': 'text/plain' },
                'Bad Request'
              );
            }
          );
        }

        function networkErrorRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void getData(new XMLHttpRequest(), url, () => {}, testAsync).then(
                () => {
                  fakeNow = 0;
                  sinon.clock.tick(1000);
                  done();
                }
              );

              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].error();
            }
          );
        }

        describe('when request loads and receives an error code', () => {
          beforeEach(done => {
            erroredRequest(done);
          });
          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'GET',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              30,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              400,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              'Bad Request',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );

            assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;

            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              PTN.FETCH_START,
              PTN.DOMAIN_LOOKUP_START,
              PTN.DOMAIN_LOOKUP_END,
              PTN.CONNECT_START,
              PTN.SECURE_CONNECTION_START,
              PTN.CONNECT_END,
              PTN.REQUEST_START,
              PTN.RESPONSE_START,
              PTN.RESPONSE_END,
              EventNames.EVENT_ERROR,
            ]);
            assert.strictEqual(events.length, 12, 'number of events is wrong');
          });
        });

        describe('when request encounters a network error', () => {
          beforeEach(done => {
            networkErrorRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'GET',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              0,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              '',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;
            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              EventNames.EVENT_ERROR,
            ]);
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
            abortedRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'GET',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              0,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              '',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;
            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              EventNames.EVENT_ABORT,
            ]);
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
            timedOutRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'GET',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              0,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              '',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;

            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              EventNames.EVENT_TIMEOUT,
            ]);
            assert.strictEqual(events.length, 3, 'number of events is wrong');
          });
        });

        describe('when applyCustomAttributesOnSpan hook is present', () => {
          describe('AND request loads and receives an error code', () => {
            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              erroredRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 400);
            });
          });

          describe('AND request encounters a network error', () => {
            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              networkErrorRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 0);
            });
          });

          describe('AND request is aborted', () => {
            before(function () {
              // Can only abort Async requests
              if (!testAsync) {
                this.skip();
              }
            });

            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              abortedRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 0);
            });
          });

          describe('AND request times out', () => {
            before(function () {
              // Can only set timeout for Async requests
              if (!testAsync) {
                this.skip();
              }
            });

            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              timedOutRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 0);
            });
          });
        });
      });

      describe('when POST request is successful', () => {
        let webTracerWithZone: api.Tracer;
        let webTracerProviderWithZone: WebTracerProvider;
        let dummySpanExporter: DummySpanExporter;
        let exportSpy: any;
        let clearResourceTimingsSpy: any;
        let rootSpan: api.Span;
        let spyEntries: any;
        const url = 'http://localhost:8090/xml-http-request.js';
        const secureUrl = 'https://localhost:8090/xml-http-request.js';
        let fakeNow = 0;
        let xmlHttpRequestInstrumentation: XMLHttpRequestInstrumentation;

        clearData = () => {
          requests = [];
          sinon.restore();
        };

        const prepareData = (
          done: any,
          fileUrl: string,
          config?: XMLHttpRequestInstrumentationConfig
        ) => {
          const fakeXhr = sinon.useFakeXMLHttpRequest();
          fakeXhr.onCreate = function (xhr: any) {
            requests.push(xhr);
          };
          sinon.useFakeTimers();

          sinon.stub(performance, 'timeOrigin').value(0);
          sinon.stub(performance, 'now').callsFake(() => fakeNow);

          const resources: PerformanceResourceTiming[] = [];
          resources.push(
            createResource({
              name: fileUrl,
            }),
            createMainResource({
              name: fileUrl,
            })
          );

          spyEntries = sinon.stub(
            performance as unknown as Performance,
            'getEntriesByType'
          );
          spyEntries.withArgs('resource').returns(resources);

          sinon
            .stub(window, 'PerformanceObserver')
            .value(createFakePerformanceObs(fileUrl));

          xmlHttpRequestInstrumentation = new XMLHttpRequestInstrumentation(
            config
          );
          dummySpanExporter = new DummySpanExporter();
          exportSpy = sinon.stub(dummySpanExporter, 'export');
          webTracerProviderWithZone = new WebTracerProvider({
            spanProcessors: [
              new tracing.SimpleSpanProcessor(dummySpanExporter),
            ],
          });
          registerInstrumentations({
            instrumentations: [xmlHttpRequestInstrumentation],
            tracerProvider: webTracerProviderWithZone,
          });
          webTracerWithZone = webTracerProviderWithZone.getTracer('xhr-test');
          clearResourceTimingsSpy = sinon.stub(
            performance as unknown as Performance,
            'clearResourceTimings'
          );

          rootSpan = webTracerWithZone.startSpan('root');
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void postData(
                new XMLHttpRequest(),
                fileUrl,
                '{"embedded":"data"}',
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });
              assert.strictEqual(requests.length, 1, 'request not called');

              requests[0].respond(
                200,
                { 'Content-Type': 'application/json' },
                '{"foo":"bar"}'
              );
            }
          );
        };

        beforeEach(done => {
          const propagateTraceHeaderCorsUrls = [window.location.origin];
          prepareData(done, url, {
            propagateTraceHeaderCorsUrls,
            measureRequestSize: true,
          });
        });

        afterEach(() => {
          clearData();
        });

        it('should patch to wrap XML HTTP Requests when enabled', () => {
          const xhttp = new XMLHttpRequest();
          assert.ok(isWrapped(xhttp.send));
          xmlHttpRequestInstrumentation.enable();
          assert.ok(isWrapped(xhttp.send));
        });

        it('should unpatch to unwrap XML HTTP Requests when disabled', () => {
          const xhttp = new XMLHttpRequest();
          assert.ok(isWrapped(xhttp.send));
          xmlHttpRequestInstrumentation.disable();
          assert.ok(!isWrapped(xhttp.send));
        });

        it('should create a span with correct root span', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(
            span.parentSpanContext?.spanId,
            rootSpan.spanContext().spanId,
            'parent span is not root span'
          );
        });

        it('span should have correct name', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(span.name, 'POST', 'span has wrong name');
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
            attributes[SEMATTRS_HTTP_METHOD],
            'POST',
            `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_URL],
            url,
            `attributes ${SEMATTRS_HTTP_URL} is wrong`
          );
          const requestContentLength = attributes[
            SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
          ] as number;
          assert.strictEqual(
            requestContentLength,
            19,
            `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} !== 19`
          );
          const responseContentLength = attributes[
            SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
          ] as number;
          assert.strictEqual(
            responseContentLength,
            60,
            `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_STATUS_CODE],
            200,
            `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
          );
          assert.strictEqual(
            attributes[AttributeNames.HTTP_STATUS_TEXT],
            'OK',
            `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_HOST],
            parseUrl(url).host,
            `attributes ${SEMATTRS_HTTP_HOST} is wrong`
          );

          const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
          assert.ok(
            httpScheme === 'http' || httpScheme === 'https',
            `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
          );
          assert.notStrictEqual(
            attributes[SEMATTRS_HTTP_USER_AGENT],
            '',
            `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
          );

          assert.strictEqual(keys.length, 9, 'number of attributes is wrong');
        });

        it('span should have correct events', () => {
          const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
          const events = span.events;
          testForCorrectEvents(events, [
            EventNames.METHOD_OPEN,
            EventNames.METHOD_SEND,
            PTN.FETCH_START,
            PTN.DOMAIN_LOOKUP_START,
            PTN.DOMAIN_LOOKUP_END,
            PTN.CONNECT_START,
            PTN.CONNECT_END,
            PTN.REQUEST_START,
            PTN.RESPONSE_START,
            PTN.RESPONSE_END,
            EventNames.EVENT_LOAD,
          ]);
          assert.strictEqual(events.length, 11, 'number of events is wrong');
        });

        it('should create a span for preflight request', () => {
          const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
          const parentSpan: tracing.ReadableSpan = exportSpy.args[1][0][0];
          assert.strictEqual(
            span.parentSpanContext?.spanId,
            parentSpan.spanContext().spanId,
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
          assert.strictEqual(events.length, 8, 'number of events is wrong');
          testForCorrectEvents(events, [
            PTN.FETCH_START,
            PTN.DOMAIN_LOOKUP_START,
            PTN.DOMAIN_LOOKUP_END,
            PTN.CONNECT_START,
            PTN.CONNECT_END,
            PTN.REQUEST_START,
            PTN.RESPONSE_START,
            PTN.RESPONSE_END,
          ]);
        });

        it('should NOT clear the resources', () => {
          assert.ok(
            clearResourceTimingsSpy.notCalled,
            'resources have been cleared'
          );
        });
        describe('When making https requests', () => {
          beforeEach(done => {
            clearData();
            // this won't generate a preflight span
            const propagateTraceHeaderCorsUrls = [secureUrl];
            prepareData(done, secureUrl, {
              propagateTraceHeaderCorsUrls,
            });
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const events = span.events;
            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              PTN.FETCH_START,
              PTN.DOMAIN_LOOKUP_START,
              PTN.DOMAIN_LOOKUP_END,
              PTN.CONNECT_START,
              PTN.SECURE_CONNECTION_START,
              PTN.CONNECT_END,
              PTN.REQUEST_START,
              PTN.RESPONSE_START,
              PTN.RESPONSE_END,
              EventNames.EVENT_LOAD,
            ]);
            assert.strictEqual(events.length, 12, 'number of events is wrong');
          });

          it('preflight request span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;
            assert.strictEqual(events.length, 9, 'number of events is wrong');
            testForCorrectEvents(events, [
              PTN.FETCH_START,
              PTN.DOMAIN_LOOKUP_START,
              PTN.DOMAIN_LOOKUP_END,
              PTN.CONNECT_START,
              PTN.SECURE_CONNECTION_START,
              PTN.CONNECT_END,
              PTN.REQUEST_START,
              PTN.RESPONSE_START,
              PTN.RESPONSE_END,
            ]);
          });
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
              span.spanContext().traceId,
              `trace header '${X_B3_TRACE_ID}' not set`
            );
            assert.strictEqual(
              requests[0].requestHeaders[X_B3_SPAN_ID],
              span.spanContext().spanId,
              `trace header '${X_B3_SPAN_ID}' not set`
            );
            assert.strictEqual(
              requests[0].requestHeaders[X_B3_SAMPLED],
              String(span.spanContext().traceFlags),
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
                span.spanContext().traceId,
                `trace header '${X_B3_TRACE_ID}' not set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SPAN_ID],
                span.spanContext().spanId,
                `trace header '${X_B3_SPAN_ID}' not set`
              );
              assert.strictEqual(
                requests[0].requestHeaders[X_B3_SAMPLED],
                String(span.spanContext().traceFlags),
                `trace header '${X_B3_SAMPLED}' not set`
              );
            });
          }
        );
        describe(
          'AND origin does NOT match window.location And does NOT match' +
            ' with propagateTraceHeaderCorsUrls',
          () => {
            let spyDebug: sinon.SinonSpy;
            beforeEach(done => {
              const diagLogger = new api.DiagConsoleLogger();
              spyDebug = sinon.spy();
              diagLogger.debug = spyDebug;
              api.diag.setLogger(diagLogger, api.DiagLogLevel.ALL);
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

            it('should debug info that injecting headers was skipped', () => {
              assert.strictEqual(
                spyDebug.lastCall.args[1],
                'headers inject skipped due to CORS policy'
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
            const reusableReq = new XMLHttpRequest();
            api.context.with(
              api.trace.setSpan(api.context.active(), rootSpan),
              () => {
                void postData(
                  reusableReq,
                  firstUrl,
                  '{"embedded":"data"}',
                  () => {
                    fakeNow = 100;
                  },
                  testAsync
                ).then(() => {
                  fakeNow = 0;
                  sinon.clock.tick(1000);
                });
              }
            );

            api.context.with(
              api.trace.setSpan(api.context.active(), rootSpan),
              () => {
                void postData(
                  reusableReq,
                  secondUrl,
                  '{"embedded":"data"}',
                  () => {
                    fakeNow = 100;
                  },
                  testAsync
                ).then(() => {
                  fakeNow = 0;
                  sinon.clock.tick(1000);
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
              }
            );
          });

          it('should clear previous span information', () => {
            const span: tracing.ReadableSpan = exportSpy.args[2][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[1]],
              secondUrl,
              `attribute ${SEMATTRS_HTTP_URL} is wrong`
            );
          });
        });

        describe('and applyCustomAttributesOnSpan hook is configured', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [url];
            prepareData(done, url, {
              propagateTraceHeaderCorsUrls,
              applyCustomAttributesOnSpan: function (
                span: api.Span,
                xhr: XMLHttpRequest
              ) {
                const res = JSON.parse(xhr.response);
                span.setAttribute('xhr-custom-attribute', res.foo);
              },
            });
          });

          it('span should have custom attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;
            assert.ok(attributes['xhr-custom-attribute'] === 'bar');
          });
        });

        describe('when using relative url', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [window.location.origin];
            prepareData(done, '/get', { propagateTraceHeaderCorsUrls });
          });

          it('should create correct span with events', () => {
            // no prefetch span because mock observer uses location.origin as url when relative
            // and prefetch span finding compares url origins
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;

            assert.strictEqual(
              exportSpy.args.length,
              1,
              `Wrong number of spans: ${exportSpy.args.length}`
            );

            assert.strictEqual(
              events.length,
              11,
              `number of events is wrong: ${events.length}`
            );
            assert.strictEqual(
              events[7].name,
              PTN.REQUEST_START,
              `event ${PTN.REQUEST_START} is not defined`
            );
          });

          it('should have an absolute http.url attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              location.origin + '/get',
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
          });
        });
      });

      describe('when POST request is NOT successful', () => {
        let webTracerWithZoneProvider: WebTracerProvider;
        let webTracerWithZone: api.Tracer;
        let dummySpanExporter: DummySpanExporter;
        let exportSpy: any;
        let rootSpan: api.Span;
        let spyEntries: any;
        const url =
          'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
        let fakeNow = 0;

        const prepareData = function (
          config: XMLHttpRequestInstrumentationConfig = {}
        ) {
          const fakeXhr = sinon.useFakeXMLHttpRequest();
          fakeXhr.onCreate = function (xhr: any) {
            requests.push(xhr);
          };

          sinon.useFakeTimers();

          sinon.stub(performance, 'timeOrigin').value(0);
          sinon.stub(performance, 'now').callsFake(() => fakeNow);

          const resources: PerformanceResourceTiming[] = [];
          resources.push(
            createResource({
              name: url,
            })
          );

          spyEntries = sinon.stub(
            performance as unknown as Performance,
            'getEntriesByType'
          );
          spyEntries.withArgs('resource').returns(resources);

          dummySpanExporter = new DummySpanExporter();
          webTracerWithZoneProvider = new WebTracerProvider({
            spanProcessors: [
              new tracing.SimpleSpanProcessor(dummySpanExporter),
            ],
          });

          registerInstrumentations({
            instrumentations: [new XMLHttpRequestInstrumentation(config)],
            tracerProvider: webTracerWithZoneProvider,
          });

          exportSpy = sinon.stub(dummySpanExporter, 'export');

          webTracerWithZone = webTracerWithZoneProvider.getTracer('xhr-test');

          rootSpan = webTracerWithZone.startSpan('root');
        };

        beforeEach(() => {
          prepareData();
        });

        afterEach(() => {
          clearData();
        });

        function timedOutRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void postData(
                new XMLHttpRequest(),
                url,
                '{"embedded":"data"}',
                () => {
                  sinon.clock.tick(XHR_TIMEOUT);
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });
            }
          );
        }

        function abortedRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void postData(
                new XMLHttpRequest(),
                url,
                '{"embedded":"data"}',
                () => {},
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });

              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].abort();
            }
          );
        }

        function erroredRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void postData(
                new XMLHttpRequest(),
                url,
                '{"embedded":"data"}',
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });
              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].respond(
                400,
                { 'Content-Type': 'text/plain' },
                'Bad Request'
              );
            }
          );
        }

        function networkErrorRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void postData(
                new XMLHttpRequest(),
                url,
                '{"embedded":"data"}',
                () => {},
                testAsync
              ).then(() => {
                fakeNow = 0;
                sinon.clock.tick(1000);
                done();
              });

              assert.strictEqual(requests.length, 1, 'request not called');
              requests[0].error();
            }
          );
        }

        describe('when request loads and receives an error code', () => {
          beforeEach(done => {
            erroredRequest(done);
          });
          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'POST',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              30,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              400,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              'Bad Request',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );

            assert.strictEqual(keys.length, 8, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;

            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              PTN.FETCH_START,
              PTN.DOMAIN_LOOKUP_START,
              PTN.DOMAIN_LOOKUP_END,
              PTN.CONNECT_START,
              PTN.SECURE_CONNECTION_START,
              PTN.CONNECT_END,
              PTN.REQUEST_START,
              PTN.RESPONSE_START,
              PTN.RESPONSE_END,
              EventNames.EVENT_ERROR,
            ]);
            assert.strictEqual(events.length, 12, 'number of events is wrong');
          });
        });

        describe('when request encounters a network error', () => {
          beforeEach(done => {
            networkErrorRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'POST',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              0,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              '',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;
            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              EventNames.EVENT_ERROR,
            ]);
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
            abortedRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'POST',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              0,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              '',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;
            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              EventNames.EVENT_ABORT,
            ]);
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
            timedOutRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[SEMATTRS_HTTP_METHOD],
              'POST',
              `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_URL],
              url,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_STATUS_CODE],
              0,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
            assert.strictEqual(
              attributes[AttributeNames.HTTP_STATUS_TEXT],
              '',
              `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
            );
            assert.strictEqual(
              attributes[SEMATTRS_HTTP_HOST],
              'raw.githubusercontent.com',
              `attributes ${SEMATTRS_HTTP_HOST} is wrong`
            );

            const httpScheme = attributes[SEMATTRS_HTTP_SCHEME];
            assert.ok(
              httpScheme === 'http' || httpScheme === 'https',
              `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
            );
            assert.notStrictEqual(
              attributes[SEMATTRS_HTTP_USER_AGENT],
              '',
              `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
            );
            const requestContentLength = attributes[
              SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
            ] as number;
            assert.strictEqual(
              requestContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
            );
            const responseContentLength = attributes[
              SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
            ] as number;
            assert.strictEqual(
              responseContentLength,
              undefined,
              `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
            );

            assert.strictEqual(keys.length, 7, 'number of attributes is wrong');
          });

          it('span should have correct events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const events = span.events;

            testForCorrectEvents(events, [
              EventNames.METHOD_OPEN,
              EventNames.METHOD_SEND,
              EventNames.EVENT_TIMEOUT,
            ]);
            assert.strictEqual(events.length, 3, 'number of events is wrong');
          });
        });

        describe('when applyCustomAttributesOnSpan hook is present', () => {
          describe('AND request loads and receives an error code', () => {
            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              erroredRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 400);
            });
          });

          describe('AND request encounters a network error', () => {
            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              networkErrorRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 0);
            });
          });

          describe('AND request is aborted', () => {
            before(function () {
              // Can only abort Async requests
              if (!testAsync) {
                this.skip();
              }
            });

            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              abortedRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 0);
            });
          });

          describe('AND request times out', () => {
            before(function () {
              // Can only set timeout for Async requests
              if (!testAsync) {
                this.skip();
              }
            });

            beforeEach(done => {
              clearData();
              prepareData({
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              timedOutRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 0);
            });
          });
        });
      });
    });
  });
});
