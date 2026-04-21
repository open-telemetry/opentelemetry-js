/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as api from '@opentelemetry/api';
import { otperformance as performance } from '@opentelemetry/core';
import {
  registerInstrumentations,
  isWrapped,
  semconvStabilityFromStr,
  SemconvStability,
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
  PerformanceTimingNames as PTN,
  WebTracerProvider,
  parseUrl,
} from '@opentelemetry/sdk-trace-web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  ATTR_HTTP_HOST,
  ATTR_HTTP_METHOD,
  ATTR_HTTP_RESPONSE_CONTENT_LENGTH,
  ATTR_HTTP_SCHEME,
  ATTR_HTTP_STATUS_CODE,
  ATTR_HTTP_URL,
  ATTR_HTTP_USER_AGENT,
  ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  ATTR_HTTP_REQUEST_BODY_SIZE,
} from '../src/semconv';
import { EventNames } from '../src/enums/EventNames';
import type { XMLHttpRequestInstrumentationConfig } from '../src/xhr';
import { XMLHttpRequestInstrumentation } from '../src/xhr';
import { AttributeNames } from '../src/enums/AttributeNames';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';

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
    private readonly cb: PerformanceObserverCallback;
    constructor(cb: PerformanceObserverCallback) {
      this.cb = cb;
    }

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
  const asyncTests = [
    { async: true, semconvStabilityOptIn: undefined },
    { async: true, semconvStabilityOptIn: 'http' },
    { async: true, semconvStabilityOptIn: 'http/dup' },
    { async: false, semconvStabilityOptIn: undefined },
    { async: false, semconvStabilityOptIn: 'http' },
    { async: false, semconvStabilityOptIn: 'http/dup' },
  ];

  let timer: sinon.SinonFakeTimers;

  beforeEach(function () {
    timer = sinon.useFakeTimers();
  });

  afterEach(function () {
    sinon.restore();
  });

  asyncTests.forEach(test => {
    const testAsync = test.async;
    describe(`when async='${testAsync}', semconvStabilityOptIn=${test.semconvStabilityOptIn}`, () => {
      let requests: any[] = [];
      let contextManager: ZoneContextManager;
      let webTracerWithZone: api.Tracer;
      let webTracerProviderWithZone: WebTracerProvider;
      let dummySpanExporter: DummySpanExporter;
      let spyEntries: any;
      let fakeNow = 0;
      let xmlHttpRequestInstrumentation: XMLHttpRequestInstrumentation;
      let exportSpy: any;
      let clearResourceTimingsSpy: any;
      let rootSpan: api.Span;

      const clearData = () => {
        sinon.restore();
        timer = sinon.useFakeTimers();
        requests = [];
      };

      const prepareData = (
        fileUrl: string,
        config?: XMLHttpRequestInstrumentationConfig
      ) => {
        const fakeXhr = sinon.useFakeXMLHttpRequest();
        fakeXhr.onCreate = function (xhr: any) {
          requests.push(xhr);
        };
        // @ts-expect-error -- custom property
        if (typeof XMLHttpRequest.prototype.send.__unwrap === 'function') {
          // @ts-expect-error -- custom property
          XMLHttpRequest.prototype.send.__unwrap();
        }
        // @ts-expect-error -- custom property
        if (typeof XMLHttpRequest.prototype.open.__unwrap === 'function') {
          // @ts-expect-error -- custom property
          XMLHttpRequest.prototype.open.__unwrap();
        }

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

        xmlHttpRequestInstrumentation = new XMLHttpRequestInstrumentation({
          semconvStabilityOptIn: test.semconvStabilityOptIn,
          ...config,
        });
        dummySpanExporter = new DummySpanExporter();
        webTracerProviderWithZone = new WebTracerProvider({
          spanProcessors: [new tracing.SimpleSpanProcessor(dummySpanExporter)],
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
      };

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
        const url = 'http://localhost:8090/xml-http-request.js';
        const secureUrl = 'https://localhost:8090/xml-http-request.js';

        function successfulGetRequest(
          url: string,
          done: any,
          xhr = new XMLHttpRequest()
        ) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void getData(
                xhr,
                url,
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                timer.tick(1000);
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
        }

        describe('AND the spans are exported', () => {
          beforeEach(function (done) {
            const propagateTraceHeaderCorsUrls = [window.location.origin];
            clearData();
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              measureRequestSize: true,
            });
            successfulGetRequest(url, done);
          });

          it('should patch to wrap XML HTTP Requests when enabled', () => {
            const xhttp = new XMLHttpRequest();
            assert.ok(isWrapped(xhttp.send));
            xmlHttpRequestInstrumentation.enable();
            assert.ok(isWrapped(xhttp.send));
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
            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 8;

              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'GET',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                60,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                200,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                'OK',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                parseUrl(url).host,
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );

              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              expectedNumAttrs += 5;

              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'GET');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                200
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                parseUrl(url).hostname
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                Number(parseUrl(url).port)
              );
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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
        });

        describe('When making https requests', () => {
          beforeEach(done => {
            clearData();
            // this won't generate a preflight span
            const propagateTraceHeaderCorsUrls = [secureUrl];
            prepareData(secureUrl, {
              propagateTraceHeaderCorsUrls,
            });
            successfulGetRequest(secureUrl, done);
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
            prepareData(window.location.origin + '/xml-http-request.js', {
              propagateTraceHeaderCorsUrls,
            });
            successfulGetRequest(window.location.origin, done);
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
              const ghUrl =
                'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
              clearData();
              prepareData(ghUrl, {
                propagateTraceHeaderCorsUrls: /raw\.githubusercontent\.com/,
              });
              successfulGetRequest(ghUrl, done);
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
              clearData();
              const ghUrl =
                'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
              const diagLogger = new api.DiagConsoleLogger();
              spyDebug = sinon.spy();
              diagLogger.debug = spyDebug;
              api.diag.setLogger(diagLogger, api.DiagLogLevel.ALL);
              prepareData(ghUrl);
              successfulGetRequest(ghUrl, done);
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
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              ignoreUrls: [propagateTraceHeaderCorsUrls],
            });
            successfulGetRequest(url, done);
          });

          it('should NOT create any span', () => {
            assert.ok(exportSpy.notCalled, "span shouldn't be exported");
          });
        });

        describe('when clearTimingResources is set', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = url;
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              clearTimingResources: true,
            });
            successfulGetRequest(url, done);
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
            clearData();
            prepareData(firstUrl);
            // Must create xhr after prepareData call because it craetes the instrumentation
            const xhr = new XMLHttpRequest();
            successfulGetRequest(
              firstUrl,
              () => successfulGetRequest(secondUrl, done, xhr),
              xhr
            );
          });

          it('should clear previous span information', () => {
            const span: tracing.ReadableSpan = exportSpy.args[2][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[1]],
              secondUrl,
              `attribute ${ATTR_HTTP_URL} is wrong`
            );
          });
        });

        describe('and applyCustomAttributesOnSpan hook is configured', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [url];
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              applyCustomAttributesOnSpan: function (
                span: api.Span,
                xhr: XMLHttpRequest
              ) {
                const res = JSON.parse(xhr.response);
                span.setAttribute('xhr-custom-attribute', res.foo);
              },
            });
            successfulGetRequest(url, done);
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
            prepareData('/get', { propagateTraceHeaderCorsUrls });
            successfulGetRequest('/get', done);
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

          it('should have an absolute url attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                location.origin + '/get',
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
            }
            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(
                attributes[ATTR_URL_FULL],
                location.origin + '/get',
                `attributes ${ATTR_URL_FULL} is wrong`
              );
            }
          });
        });

        describe('when network events are ignored', () => {
          beforeEach(done => {
            clearData();
            prepareData(url, { ignoreNetworkEvents: true });
            successfulGetRequest(url, done);
          });
          it('should NOT add network events', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const events = span.events;
            assert.strictEqual(events.length, 3, 'number of events is wrong');
          });

          it('should still add the CONTENT_LENGTH attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                60,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
              );
            }
          });
        });
      });

      describe('when GET request is NOT successful', () => {
        const url =
          'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';

        beforeEach(() => {
          clearData();
          prepareData(url);
        });

        function timedOutRequest(done: any) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void getData(
                new XMLHttpRequest(),
                url,
                () => {
                  timer.tick(XHR_TIMEOUT);
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                timer.tick(1000);
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
                  timer.tick(1000);
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
                timer.tick(1000);
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
                  timer.tick(1000);
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

          it('span should have correct attributes and status', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;
            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 8;

              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'GET',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                60,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                400,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                'Bad Request',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );

              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.ERROR);

              expectedNumAttrs += 6;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'GET');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                400
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
              assert.strictEqual(attributes[ATTR_ERROR_TYPE], '400');
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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
              EventNames.EVENT_ERROR,
            ]);
            assert.strictEqual(events.length, 12, 'number of events is wrong');
          });
        });

        describe('when request encounters a network error', () => {
          beforeEach(done => {
            networkErrorRequest(done);
          });

          it('span should have correct attributes and status', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 7;

              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'GET',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                0,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                '',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );

              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                undefined,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.ERROR);

              expectedNumAttrs += 5;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'GET');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                undefined
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
              assert.strictEqual(attributes[ATTR_ERROR_TYPE], 'error');
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 7;
              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'GET',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                0,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                '',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );

              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                undefined,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.UNSET);

              expectedNumAttrs += 4;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'GET');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                undefined
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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

          it('span should have correct attributes and status', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 7;
              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'GET',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                0,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                '',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );

              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                undefined,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.ERROR);

              expectedNumAttrs += 5;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'GET');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                undefined
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
              assert.strictEqual(attributes[ATTR_ERROR_TYPE], 'timeout');
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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
              prepareData(url, {
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              erroredRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 400);
            });
          });

          describe('AND request encounters a network error', () => {
            beforeEach(done => {
              clearData();
              prepareData(url, {
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
              prepareData(url, {
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
              prepareData(url, {
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
        const url = 'http://localhost:8090/xml-http-request.js';
        const secureUrl = 'https://localhost:8090/xml-http-request.js';

        function successfulPostRequest(
          url: string,
          done: any,
          xhr = new XMLHttpRequest()
        ) {
          api.context.with(
            api.trace.setSpan(api.context.active(), rootSpan),
            () => {
              void postData(
                xhr,
                url,
                '{"embedded":"data"}',
                () => {
                  fakeNow = 100;
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                timer.tick(1000);
                done();
              });
              assert.ok(requests.length >= 1, 'request not called');

              requests[requests.length - 1].respond(
                200,
                { 'Content-Type': 'application/json' },
                '{"foo":"bar"}'
              );
            }
          );
        }

        describe('When making http requests', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [window.location.origin];
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              measureRequestSize: true,
            });
            successfulPostRequest(url, done);
          });

          it('should patch to wrap XML HTTP Requests when enabled', () => {
            const xhttp = new XMLHttpRequest();
            assert.ok(isWrapped(xhttp.send));
            xmlHttpRequestInstrumentation.enable();
            assert.ok(isWrapped(xhttp.send));
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

          it('span should have correct attributes and status', () => {
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 9;
              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'POST',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                19,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} !== 19`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                60,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                200,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                'OK',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                parseUrl(url).host,
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );
              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.UNSET);

              expectedNumAttrs += 6;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'POST');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                200
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                parseUrl(url).hostname,
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                Number(parseUrl(url).port),
                'server.port'
              );
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_BODY_SIZE], 19);
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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
        });

        describe('When making https requests', () => {
          beforeEach(done => {
            clearData();
            // this won't generate a preflight span
            const propagateTraceHeaderCorsUrls = [secureUrl];
            prepareData(secureUrl, {
              propagateTraceHeaderCorsUrls,
            });
            successfulPostRequest(secureUrl, done);
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
            prepareData(window.location.origin + '/xml-http-request.js', {
              propagateTraceHeaderCorsUrls,
            });
            successfulPostRequest(
              window.location.origin + '/xml-http-request.js',
              done
            );
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
              const ghUrl =
                'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
              clearData();
              prepareData(ghUrl, {
                propagateTraceHeaderCorsUrls: /raw\.githubusercontent\.com/,
              });
              successfulPostRequest(ghUrl, done);
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
              clearData();
              const ghUrl =
                'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
              const diagLogger = new api.DiagConsoleLogger();
              spyDebug = sinon.spy();
              diagLogger.debug = spyDebug;
              api.diag.setLogger(diagLogger, api.DiagLogLevel.ALL);
              prepareData(ghUrl);
              successfulPostRequest(ghUrl, done);
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
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              ignoreUrls: [propagateTraceHeaderCorsUrls],
            });
            successfulPostRequest(url, done);
          });

          it('should NOT create any span', () => {
            assert.ok(exportSpy.notCalled, "span shouldn't be exported");
          });
        });

        describe('when clearTimingResources is set', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = url;
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              clearTimingResources: true,
            });
            successfulPostRequest(url, done);
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
            clearData();
            const propagateTraceHeaderCorsUrls = [firstUrl, secondUrl];
            prepareData(firstUrl, {
              propagateTraceHeaderCorsUrls,
            });
            const xhr = new XMLHttpRequest();
            successfulPostRequest(
              firstUrl,
              () => successfulPostRequest(secondUrl, done),
              xhr
            );
          });

          it('should clear previous span information', () => {
            // span at exportSpy.args[0][0][0] is the preflight span
            const span: tracing.ReadableSpan = exportSpy.args[2][0][0];
            const attributes = span.attributes;
            const keys = Object.keys(attributes);

            assert.strictEqual(
              attributes[keys[1]],
              secondUrl,
              `attribute ${ATTR_HTTP_URL} is wrong`
            );
          });
        });

        describe('and applyCustomAttributesOnSpan hook is configured', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [url];
            prepareData(url, {
              propagateTraceHeaderCorsUrls,
              applyCustomAttributesOnSpan: function (
                span: api.Span,
                xhr: XMLHttpRequest
              ) {
                const res = JSON.parse(xhr.response);
                span.setAttribute('xhr-custom-attribute', res.foo);
              },
            });
            successfulPostRequest(url, done);
          });

          it('span should have custom attribute', () => {
            // span at exportSpy.args[0][0][0] is the preflight span
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;
            assert.ok(attributes['xhr-custom-attribute'] === 'bar');
          });
        });

        describe('when using relative url', () => {
          beforeEach(done => {
            clearData();
            const propagateTraceHeaderCorsUrls = [window.location.origin];
            prepareData('/get', { propagateTraceHeaderCorsUrls });
            successfulPostRequest('/get', done);
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

          it('should have an absolute url attribute', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                location.origin + '/get',
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
            }
            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(
                attributes[ATTR_URL_FULL],
                location.origin + '/get',
                `attributes ${ATTR_URL_FULL} is wrong`
              );
            }
          });
        });
      });

      describe('when POST request is NOT successful', () => {
        const url =
          'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';

        beforeEach(() => {
          clearData();
          prepareData(url);
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
                  timer.tick(XHR_TIMEOUT);
                },
                testAsync
              ).then(() => {
                fakeNow = 0;
                timer.tick(1000);
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
                timer.tick(1000);
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
                timer.tick(1000);
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
                timer.tick(1000);
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
            const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
            const attributes = span.attributes;

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 8;

              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'POST',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                60,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} <= 0`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                400,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                'Bad Request',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );
              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.ERROR);

              expectedNumAttrs += 6;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'POST');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                400
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
              assert.strictEqual(attributes[ATTR_ERROR_TYPE], '400');
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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
              EventNames.EVENT_ERROR,
            ]);
            assert.strictEqual(events.length, 12, 'number of events is wrong');
          });
        });

        describe('when request encounters a network error', () => {
          // this won't generate a preflight span
          beforeEach(done => {
            networkErrorRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 7;
              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'POST',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                0,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                '',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );
              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                undefined,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.ERROR);

              expectedNumAttrs += 5;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'POST');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                undefined
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
              assert.strictEqual(attributes[ATTR_ERROR_TYPE], 'error');
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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

          // this won't generate a preflight span
          beforeEach(done => {
            abortedRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 7;

              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'POST',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                0,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                '',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );
              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                undefined,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.UNSET);

              expectedNumAttrs += 4;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'POST');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                undefined
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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

          // this won't generate a preflight span
          beforeEach(done => {
            timedOutRequest(done);
          });

          it('span should have correct attributes', () => {
            const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const attributes = span.attributes;

            let expectedNumAttrs = 0;
            const semconvStability = semconvStabilityFromStr(
              'http',
              test.semconvStabilityOptIn
            );

            if (semconvStability & SemconvStability.OLD) {
              expectedNumAttrs += 7;
              assert.strictEqual(
                attributes[ATTR_HTTP_METHOD],
                'POST',
                `attributes ${ATTR_HTTP_METHOD} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_URL],
                url,
                `attributes ${ATTR_HTTP_URL} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_STATUS_CODE],
                0,
                `attributes ${ATTR_HTTP_STATUS_CODE} is wrong`
              );
              assert.strictEqual(
                attributes[AttributeNames.HTTP_STATUS_TEXT],
                '',
                `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
              );
              assert.strictEqual(
                attributes[ATTR_HTTP_HOST],
                'raw.githubusercontent.com',
                `attributes ${ATTR_HTTP_HOST} is wrong`
              );
              const httpScheme = attributes[ATTR_HTTP_SCHEME];
              assert.ok(
                httpScheme === 'http' || httpScheme === 'https',
                `attributes ${ATTR_HTTP_SCHEME} is wrong`
              );
              assert.notStrictEqual(
                attributes[ATTR_HTTP_USER_AGENT],
                '',
                `attributes ${ATTR_HTTP_USER_AGENT} is not defined`
              );
              const requestContentLength = attributes[
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
              ] as number;
              assert.strictEqual(
                requestContentLength,
                undefined,
                `attributes ${ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
              );
              const responseContentLength = attributes[
                ATTR_HTTP_RESPONSE_CONTENT_LENGTH
              ] as number;
              assert.strictEqual(
                responseContentLength,
                undefined,
                `attributes ${ATTR_HTTP_RESPONSE_CONTENT_LENGTH} is defined`
              );
            }

            if (semconvStability & SemconvStability.STABLE) {
              assert.strictEqual(span.status.code, api.SpanStatusCode.ERROR);

              expectedNumAttrs += 5;
              assert.strictEqual(attributes[ATTR_HTTP_REQUEST_METHOD], 'POST');
              assert.strictEqual(attributes[ATTR_URL_FULL], url);
              assert.strictEqual(
                attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
                undefined
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_ADDRESS],
                'raw.githubusercontent.com',
                'server.address'
              );
              assert.strictEqual(
                attributes[ATTR_SERVER_PORT],
                443,
                'server.port'
              );
              assert.strictEqual(attributes[ATTR_ERROR_TYPE], 'timeout');
            }

            assert.strictEqual(
              Object.keys(attributes).length,
              expectedNumAttrs,
              'number of attributes is wrong'
            );
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
              prepareData(url, {
                applyCustomAttributesOnSpan: function (span, xhr) {
                  span.setAttribute('xhr-custom-error-code', xhr.status);
                },
              });
              erroredRequest(done);
            });

            it('span should have custom attribute', () => {
              const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
              const attributes = span.attributes;
              assert.ok(attributes['xhr-custom-error-code'] === 400);
            });
          });

          describe('AND request encounters a network error', () => {
            beforeEach(done => {
              clearData();
              prepareData(url, {
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
              prepareData(url, {
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
              prepareData(url, {
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
