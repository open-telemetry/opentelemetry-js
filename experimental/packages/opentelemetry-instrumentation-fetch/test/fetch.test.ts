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
import * as core from '@opentelemetry/core';
import {
  isWrapped,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';

import {
  B3Propagator,
  B3InjectEncoding,
  X_B3_TRACE_ID,
  X_B3_SPAN_ID,
  X_B3_SAMPLED,
} from '@opentelemetry/propagator-b3';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import * as tracing from '@opentelemetry/sdk-trace-base';
import {
  PerformanceTimingNames as PTN,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  FetchInstrumentation,
  FetchInstrumentationConfig,
  FetchCustomAttributeFunction,
} from '../src';
import { AttributeNames } from '../src/enums/AttributeNames';
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

class DummySpanExporter implements tracing.SpanExporter {
  export(spans: any) {}

  shutdown() {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

const getData = (url: string, method?: string) => {
  return fetch(url, {
    method: method || 'GET',
    headers: {
      foo: 'bar',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

const ENCODER = new TextEncoder();
const textToReadableStream = (msg: string): ReadableStream => {
  return new ReadableStream({
    start: controller => {
      controller.enqueue(ENCODER.encode(msg));
      controller.close();
    },
    cancel: controller => {
      controller.close();
    },
  });
};

const CUSTOM_ATTRIBUTE_KEY = 'span kind';
const defaultResource = {
  connectEnd: 15,
  connectStart: 13,
  decodedBodySize: 0,
  domainLookupEnd: 12,
  domainLookupStart: 11,
  encodedBodySize: 0,
  fetchStart: 10.1,
  initiatorType: 'fetch',
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

function createResource(resource = {}): PerformanceResourceTiming {
  return Object.assign(
    {},
    defaultResource,
    resource
  ) as PerformanceResourceTiming;
}

function createMainResource(resource = {}): PerformanceResourceTiming {
  const mainResource: any = createResource(resource);
  Object.keys(mainResource).forEach((key: string) => {
    if (typeof mainResource[key] === 'number') {
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

describe('fetch', () => {
  let contextManager: ZoneContextManager;
  let lastResponse: Response | undefined;
  let requestBody: any | undefined;
  let webTracerWithZone: api.Tracer;
  let webTracerProviderWithZone: WebTracerProvider;
  let dummySpanExporter: DummySpanExporter;
  let exportSpy: any;
  let clearResourceTimingsSpy: any;
  let rootSpan: api.Span;
  let fakeNow = 0;
  let fetchInstrumentation: FetchInstrumentation;

  const url = 'http://localhost:8090/get';
  const secureUrl = 'https://localhost:8090/get';
  const badUrl = 'http://foo.bar.com/get';

  const clearData = () => {
    sinon.restore();
    lastResponse = undefined;
    requestBody = undefined;
  };

  const prepareData = async (
    fileUrl: string,
    apiCall: () => Promise<any>,
    config: FetchInstrumentationConfig,
    disablePerfObserver?: boolean,
    disableGetEntries?: boolean
  ) => {
    sinon.useFakeTimers();

    sinon.stub(core.otperformance, 'timeOrigin').value(0);
    sinon.stub(core.otperformance, 'now').callsFake(() => fakeNow);

    function fakeFetch(input: RequestInfo | Request, init: RequestInit = {}) {
      // Once upon a time, there was a bug (#2411), causing a `Request` object
      // to be incorrectly passed to `fetch()` as the second argument
      assert.ok(!(init instanceof Request));

      return new Promise((resolve, reject) => {
        const responseInit: ResponseInit = {};

        // This is the default response body expected by the few tests that care
        let responseBody = JSON.stringify({
          isServerResponse: true,
          request: {
            url: fileUrl,
            headers: { ...init.headers },
          },
        });

        // get the request body
        if (typeof input === 'string') {
          const body = init.body;
          if (body instanceof ReadableStream) {
            const decoder = new TextDecoder();
            requestBody = '';
            const read = async () => {
              for await (const c of body) {
                requestBody += decoder.decode(c);
              }
            };
            read();
          } else {
            requestBody = init.body;
          }
        } else {
          input.text().then(r => (requestBody = r));
        }
        if (init.method === 'DELETE') {
          responseInit.status = 405;
          responseInit.statusText = 'OK';
          responseBody = 'foo';
        } else if (
          (input instanceof Request && input.url === url) ||
          input === url
        ) {
          responseInit.status = 200;
          responseInit.statusText = 'OK';
        } else {
          responseInit.status = 404;
          responseInit.statusText = 'Not found';
        }

        resolve(new window.Response(responseBody, responseInit));
      });
    }

    sinon.stub(window, 'fetch').callsFake(fakeFetch as any);

    const resources: PerformanceResourceTiming[] = [];
    resources.push(
      createResource({
        name: fileUrl,
      }),
      createMainResource({
        name: fileUrl,
      })
    );

    if (disablePerfObserver) {
      sinon.stub(window, 'PerformanceObserver').value(undefined);
    } else {
      sinon
        .stub(window, 'PerformanceObserver')
        .value(createFakePerformanceObs(fileUrl));
    }

    if (disableGetEntries) {
      sinon.stub(performance, 'getEntriesByType').value(undefined);
    } else {
      const spyEntries = sinon.stub(performance, 'getEntriesByType');
      spyEntries.withArgs('resource').returns(resources);
    }

    fetchInstrumentation = new FetchInstrumentation(config);
    dummySpanExporter = new DummySpanExporter();
    webTracerProviderWithZone = new WebTracerProvider({
      spanProcessors: [new tracing.SimpleSpanProcessor(dummySpanExporter)],
    });
    registerInstrumentations({
      tracerProvider: webTracerProviderWithZone,
      instrumentations: [fetchInstrumentation],
    });
    webTracerWithZone = webTracerProviderWithZone.getTracer('fetch-test');
    exportSpy = sinon.stub(dummySpanExporter, 'export');
    clearResourceTimingsSpy = sinon.stub(performance, 'clearResourceTimings');

    // endSpan is called after the whole response body is read
    // this process is scheduled at the same time the fetch promise is resolved
    // due to this we can't rely on getData resolution to know that the span has ended
    let resolveEndSpan: (value: unknown) => void;
    const spanEnded = new Promise(r => (resolveEndSpan = r));
    const readSpy = sinon.spy(
      window.ReadableStreamDefaultReader.prototype,
      'read'
    );
    const endSpanStub: sinon.SinonStub<any> = sinon
      .stub(FetchInstrumentation.prototype, '_endSpan' as any)
      .callsFake(async function (this: FetchInstrumentation, ...args: any[]) {
        resolveEndSpan({});
        return endSpanStub.wrappedMethod.apply(this, args);
      });

    rootSpan = webTracerWithZone.startSpan('root');
    await api.context.with(
      api.trace.setSpan(api.context.active(), rootSpan),
      async () => {
        fakeNow = 0;
        lastResponse = undefined;

        const responsePromise = apiCall();
        fakeNow = 300;
        lastResponse = await responsePromise;

        // if the url is not ignored, body.read should be called by now
        // awaiting for the span to end
        if (readSpy.callCount > 0) await spanEnded;

        await sinon.clock.runAllAsync();
      }
    );
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
      new B3Propagator({
        injectEncoding: B3InjectEncoding.MULTI_HEADER,
      })
    );
  });

  describe('when request is successful', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = [url];
      await prepareData(url, () => getData(url), {
        propagateTraceHeaderCorsUrls,
      });
    });

    afterEach(() => {
      clearData();
    });

    it('should wrap methods', () => {
      assert.ok(isWrapped(window.fetch));
      fetchInstrumentation.enable();
      assert.ok(isWrapped(window.fetch));
    });

    it('should unwrap methods', () => {
      assert.ok(isWrapped(window.fetch));
      fetchInstrumentation.disable();
      assert.ok(!isWrapped(window.fetch));
    });

    it('should create a span with correct root span', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(
        span.parentSpanId,
        rootSpan.spanContext().spanId,
        'parent span is not root span'
      );
    });

    it('span should have correct name', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(span.name, 'HTTP GET', 'span has wrong name');
    });

    it('span should have correct kind', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(span.kind, api.SpanKind.CLIENT, 'span has wrong kind');
    });

    it('span should have correct attributes', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      const attributes = span.attributes;
      const keys = Object.keys(attributes);
      assert.notStrictEqual(
        attributes[AttributeNames.COMPONENT],
        '',
        `attributes ${AttributeNames.COMPONENT} is not defined`
      );

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
        200,
        `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
      );
      const statusText = attributes[AttributeNames.HTTP_STATUS_TEXT];
      assert.ok(
        statusText === 'OK' || statusText === '',
        `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
      );
      assert.ok(
        (attributes[SEMATTRS_HTTP_HOST] as string).indexOf('localhost') === 0,
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
        30,
        `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
      );

      assert.strictEqual(keys.length, 9, 'number of attributes is wrong');
    });

    it('span should have correct events', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
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

    it('should create a span for preflight request', () => {
      const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
      const parentSpan: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(
        span.parentSpanId,
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

    it('should set trace headers', async () => {
      const span: api.Span = exportSpy.args[1][0][0];
      assert.ok(lastResponse instanceof Response);

      const { request } = await lastResponse.json();

      assert.strictEqual(
        request.headers[X_B3_TRACE_ID],
        span.spanContext().traceId,
        `trace header '${X_B3_TRACE_ID}' not set`
      );
      assert.strictEqual(
        request.headers[X_B3_SPAN_ID],
        span.spanContext().spanId,
        `trace header '${X_B3_SPAN_ID}' not set`
      );
      assert.strictEqual(
        request.headers[X_B3_SAMPLED],
        String(span.spanContext().traceFlags),
        `trace header '${X_B3_SAMPLED}' not set`
      );
    });

    it('should set trace headers with a request object', () => {
      const r = new Request('url');
      window.fetch(r).catch(() => {});
      assert.ok(typeof r.headers.get(X_B3_TRACE_ID) === 'string');
    });

    it('should keep custom headers with a request object and a headers object', () => {
      const r = new Request('url', {
        headers: new Headers({ foo: 'bar' }),
      });
      window.fetch(r).catch(() => {});
      assert.ok(r.headers.get('foo') === 'bar');
    });

    it('should keep custom headers with url, untyped request object and typed (Headers) headers object', () => {
      const url = 'url';
      const init = {
        headers: new Headers({ foo: 'bar' }),
      };
      window.fetch(url, init).catch(() => {});
      assert.ok(init.headers.get('foo') === 'bar');
    });

    it('should keep custom headers with url, untyped request object and untyped headers object', () => {
      const url = 'url';
      const init = {
        headers: { foo: 'bar' },
      };
      window.fetch(url, init).catch(() => {});
      assert.ok(init.headers['foo'] === 'bar');
    });

    it('should keep custom headers with url, untyped request object and typed (Map) headers object', () => {
      const url = 'url';
      const init = {
        headers: new Map().set('foo', 'bar'),
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore variable init not of RequestInit type
      window.fetch(url, init).catch(() => {});
      assert.ok(init.headers.get('foo') === 'bar');
    });

    it('should NOT clear the resources', () => {
      assert.strictEqual(
        clearResourceTimingsSpy.args.length,
        0,
        'resources have been cleared'
      );
    });

    describe('when propagateTraceHeaderCorsUrls does NOT MATCH', () => {
      let spyDebug: sinon.SinonSpy;
      beforeEach(async () => {
        const diagLogger = new api.DiagConsoleLogger();
        spyDebug = sinon.spy();
        diagLogger.debug = spyDebug;
        api.diag.setLogger(diagLogger, api.DiagLogLevel.ALL);
        clearData();
        await prepareData(url, () => getData(url), {});
      });
      afterEach(() => {
        sinon.restore();
      });

      it('should NOT set trace headers', async () => {
        assert.ok(lastResponse instanceof Response);

        const { request } = await lastResponse.json();

        assert.strictEqual(
          request.headers[X_B3_TRACE_ID],
          undefined,
          `trace header '${X_B3_TRACE_ID}' should not be set`
        );
        assert.strictEqual(
          request.headers[X_B3_SPAN_ID],
          undefined,
          `trace header '${X_B3_SPAN_ID}' should not be set`
        );
        assert.strictEqual(
          request.headers[X_B3_SAMPLED],
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
    });
  });

  describe('post data', () => {
    describe('url and config object when request body measurement is disabled', () => {
      beforeEach(async () => {
        await prepareData(
          url,
          () =>
            fetch(url, {
              method: 'POST',
              headers: {
                foo: 'bar',
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ hello: 'world' }),
            }),
          {}
        );
      });

      afterEach(() => {
        clearData();
      });

      it('should post data', async () => {
        assert.strictEqual(requestBody, '{"hello":"world"}');

        const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
        const attributes = span.attributes;

        assert.strictEqual(
          attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
          undefined
        );
      });
    });

    describe('url and config object', () => {
      beforeEach(async () => {
        await prepareData(
          url,
          () =>
            fetch(url, {
              method: 'POST',
              headers: {
                foo: 'bar',
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ hello: 'world' }),
            }),
          {
            measureRequestSize: true,
          }
        );
      });

      afterEach(() => {
        clearData();
      });

      it('should post data', async () => {
        assert.strictEqual(requestBody, '{"hello":"world"}');

        const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
        const attributes = span.attributes;

        assert.strictEqual(
          attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
          17
        );
      });
    });

    describe('url and config object with stream', () => {
      beforeEach(async () => {
        await prepareData(
          url,
          () =>
            fetch(url, {
              method: 'POST',
              headers: {
                foo: 'bar',
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: textToReadableStream('{"hello":"world"}'),
            }),
          {
            measureRequestSize: true,
          }
        );
      });

      afterEach(() => {
        clearData();
      });

      it('should post data', async () => {
        assert.strictEqual(requestBody, '{"hello":"world"}');

        const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
        const attributes = span.attributes;

        assert.strictEqual(
          attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
          17
        );
      });
    });

    describe('single request object', () => {
      beforeEach(async () => {
        await prepareData(
          url,
          () => {
            const req = new Request(url, {
              method: 'POST',
              headers: {
                foo: 'bar',
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: '{"hello":"world"}',
            });
            return fetch(req);
          },
          {
            measureRequestSize: true,
          }
        );
      });

      afterEach(() => {
        clearData();
      });

      it('should post data', async () => {
        assert.strictEqual(requestBody, '{"hello":"world"}');

        const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
        const attributes = span.attributes;

        assert.strictEqual(
          attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
          17
        );
      });
    });

    describe('single request object with urlparams', () => {
      beforeEach(async () => {
        await prepareData(
          url,
          () => {
            const body = new URLSearchParams();
            body.append('hello', 'world');
            const req = new Request(url, {
              method: 'POST',
              headers: {
                foo: 'bar',
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body,
            });
            return fetch(req);
          },
          {
            measureRequestSize: true,
          }
        );
      });

      afterEach(() => {
        clearData();
      });

      it('should post data', async () => {
        assert.strictEqual(requestBody, 'hello=world');

        const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
        const attributes = span.attributes;

        assert.strictEqual(
          attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
          11
        );
      });
    });
  });

  describe('when request is secure and successful', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = [secureUrl];
      await prepareData(secureUrl, () => getData(secureUrl), {
        propagateTraceHeaderCorsUrls,
      });
    });

    afterEach(() => {
      clearData();
    });

    it('span should have correct events', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
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

  describe('applyCustomAttributesOnSpan option', () => {
    const prepare = async (
      url: string,
      applyCustomAttributesOnSpan: FetchCustomAttributeFunction
    ) => {
      const propagateTraceHeaderCorsUrls = [url];

      await prepareData(url, () => getData(url), {
        propagateTraceHeaderCorsUrls,
        applyCustomAttributesOnSpan,
      });
    };

    afterEach(() => {
      clearData();
    });

    it('applies attributes when the request is successful', async () => {
      await prepare(url, span => {
        span.setAttribute(CUSTOM_ATTRIBUTE_KEY, 'custom value');
      });
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      const attributes = span.attributes;

      assert.ok(attributes[CUSTOM_ATTRIBUTE_KEY] === 'custom value');
    });

    it('applies custom attributes when the request fails', async () => {
      await prepare(badUrl, span => {
        span.setAttribute(CUSTOM_ATTRIBUTE_KEY, 'custom value');
      });
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      const attributes = span.attributes;

      assert.ok(attributes[CUSTOM_ATTRIBUTE_KEY] === 'custom value');
    });

    it('has request and response objects in callback arguments', async () => {
      let request: any;
      let response: any;
      const applyCustomAttributes: FetchCustomAttributeFunction = (
        span,
        req,
        res
      ) => {
        request = req;
        response = res;
      };

      await prepare(url, applyCustomAttributes);
      assert.ok(request.method === 'GET');
      assert.ok(response.status === 200);
    });

    it('get response body from callback arguments response', async () => {
      let response: any;
      const applyCustomAttributes: FetchCustomAttributeFunction = async (
        span,
        req,
        res
      ) => {
        if (res instanceof Response) {
          response = res;
        }
      };

      await prepare(url, applyCustomAttributes);
      const rsp = await response.json();
      assert.strictEqual(rsp.isServerResponse, true);
    });
  });

  describe('when url is ignored', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = url;
      await prepareData(url, () => getData(url), {
        propagateTraceHeaderCorsUrls,
        ignoreUrls: [propagateTraceHeaderCorsUrls],
      });
    });

    afterEach(() => {
      clearData();
    });

    it('should NOT create any span', () => {
      assert.strictEqual(exportSpy.args.length, 0, "span shouldn't b exported");
    });

    it('should accept Request objects as argument (#2411)', async () => {
      const response = await window.fetch(new Request(url));
      assert.ok(response instanceof Response);

      const { isServerResponse } = await response.json();
      assert.strictEqual(isServerResponse, true);
    });
  });

  describe('when clearTimingResources is TRUE', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = url;
      await prepareData(url, () => getData(url), {
        propagateTraceHeaderCorsUrls,
        clearTimingResources: true,
      });
    });
    afterEach(() => {
      clearData();
    });
    it('should clear the resources', () => {
      assert.strictEqual(
        clearResourceTimingsSpy.args.length,
        1,
        "resources haven't been cleared"
      );
    });
  });

  describe('when request is NOT successful (wrong url)', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = badUrl;
      await prepareData(badUrl, () => getData(badUrl), {
        propagateTraceHeaderCorsUrls,
      });
    });
    afterEach(() => {
      clearData();
    });
    it('should create a span with correct root span', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(
        span.parentSpanId,
        rootSpan.spanContext().spanId,
        'parent span is not root span'
      );
    });
  });

  describe('when request is NOT successful (405)', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = url;
      await prepareData(url, () => getData(url, 'DELETE'), {
        propagateTraceHeaderCorsUrls,
      });
    });
    afterEach(() => {
      clearData();
    });

    it('should create a span with correct root span', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(
        span.parentSpanId,
        rootSpan.spanContext().spanId,
        'parent span is not root span'
      );
    });
  });

  describe('when PerformanceObserver is used by default', () => {
    beforeEach(async () => {
      // All above tests test it already but just in case
      // lets explicitly turn getEntriesByType off so we can be sure
      // that the perf entries come from the observer.
      await prepareData(url, () => getData(url), {}, false, true);
    });
    afterEach(() => {
      clearData();
    });
    it('should create both spans with network events', () => {
      const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
      const events = span.events;

      assert.strictEqual(
        exportSpy.args.length,
        2,
        `Wrong number of spans: ${exportSpy.args.length}`
      );

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
  });

  describe('when fetching with relative url', () => {
    beforeEach(async () => {
      await prepareData('/get', () => getData('/get'), {}, false, true);
    });
    afterEach(() => {
      clearData();
    });
    it('should create spans with network info', () => {
      // no prefetch span because mock observer uses location.origin as url when relative
      // and prefetch span finding compares url origins
      const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
      const events = span.events;

      assert.strictEqual(
        exportSpy.args.length,
        1,
        `Wrong number of spans: ${exportSpy.args.length}`
      );

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

  describe('when PerformanceObserver is undefined', () => {
    beforeEach(async () => {
      await prepareData(url, () => getData(url), {}, true, false);
    });

    afterEach(() => {
      clearData();
    });

    it('should fallback to getEntries', () => {
      const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
      const events = span.events;

      assert.strictEqual(
        exportSpy.args.length,
        2,
        `Wrong number of spans: ${exportSpy.args.length}`
      );
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
  });

  describe('when PerformanceObserver and performance.getEntriesByType are undefined', () => {
    beforeEach(async () => {
      await prepareData(url, () => getData(url), {}, true, true);
    });
    afterEach(() => {
      clearData();
    });
    it('should still capture fetch with basic attributes', () => {
      const span: tracing.ReadableSpan = exportSpy.args[0][0][0];
      const events = span.events;
      const attributes = span.attributes;
      const keys = Object.keys(attributes);

      assert.strictEqual(
        exportSpy.args.length,
        1,
        `Wrong number of spans: ${exportSpy.args.length}`
      );
      assert.strictEqual(
        exportSpy.args[0][0][0].name,
        'HTTP GET',
        'wrong span captured'
      );

      assert.strictEqual(events.length, 0, 'Should not have any events');

      // should still have basic attributes
      assert.strictEqual(
        attributes[keys[3]],
        200,
        `Missing basic attribute ${SEMATTRS_HTTP_STATUS_CODE}`
      );
    });
  });

  describe('when network events are ignored', () => {
    beforeEach(async () => {
      await prepareData(url, () => getData(url), {
        ignoreNetworkEvents: true,
      });
    });
    afterEach(() => {
      clearData();
    });
    it('should NOT add network events', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      const events = span.events;
      assert.strictEqual(events.length, 0, 'number of events is wrong');
    });

    it('should still add the CONTENT_LENGTH attribute', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      const attributes = span.attributes;
      const responseContentLength = attributes[
        SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
      ] as number;
      assert.strictEqual(
        responseContentLength,
        30,
        `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
      );
    });
  });
});
