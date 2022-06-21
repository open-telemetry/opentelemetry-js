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
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

class DummySpanExporter implements tracing.SpanExporter {
  export(spans: any) {}

  shutdown() {
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

describe('fetch', () => {
  let contextManager: ZoneContextManager;
  let lastResponse: any | undefined;
  let webTracerWithZone: api.Tracer;
  let webTracerProviderWithZone: WebTracerProvider;
  let dummySpanExporter: DummySpanExporter;
  let exportSpy: any;
  let clearResourceTimingsSpy: any;
  let rootSpan: api.Span;
  let fakeNow = 0;
  let fetchInstrumentation: FetchInstrumentation;

  const url = 'http://localhost:8090/get';
  const badUrl = 'http://foo.bar.com/get';

  const clearData = () => {
    sinon.restore();
    lastResponse = undefined;
  };

  const prepareData = async (
    fileUrl: string,
    config: FetchInstrumentationConfig,
    method?: string,
    disablePerfObserver?: boolean,
    disableGetEntries?: boolean
  ) => {
    sinon.useFakeTimers();

    sinon.stub(core.otperformance, 'timeOrigin').value(0);
    sinon.stub(core.otperformance, 'now').callsFake(() => fakeNow);

    function fakeFetch(input: RequestInfo | Request, init: RequestInit = {}) {
      return new Promise((resolve, reject) => {
        const response: any = {
          args: {},
          url: fileUrl,
        };
        response.headers = Object.assign({}, init.headers);

        if (init instanceof Request) {
          // Passing request as 2nd argument causes missing body bug (#2411)
          response.status = 400;
          response.statusText = 'Bad Request (Request object as 2nd argument)';
          reject(new window.Response(JSON.stringify(response), response));
        } else if (init.method === 'DELETE') {
          response.status = 405;
          response.statusText = 'OK';
          resolve(new window.Response('foo', response));
        } else if ((input instanceof Request && input.url === url) || input === url) {
          response.status = 200;
          response.statusText = 'OK';
          resolve(new window.Response(JSON.stringify(response), response));
        } else {
          response.status = 404;
          response.statusText = 'Bad request';
          reject(new window.Response(JSON.stringify(response), response));
        }
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
    webTracerProviderWithZone = new WebTracerProvider();
    registerInstrumentations({
      tracerProvider: webTracerProviderWithZone,
      instrumentations: [fetchInstrumentation],
    });
    webTracerWithZone = webTracerProviderWithZone.getTracer('fetch-test');
    dummySpanExporter = new DummySpanExporter();
    exportSpy = sinon.stub(dummySpanExporter, 'export');
    clearResourceTimingsSpy = sinon.stub(performance, 'clearResourceTimings');
    webTracerProviderWithZone.addSpanProcessor(
      new tracing.SimpleSpanProcessor(dummySpanExporter)
    );

    // endSpan is called after the whole response body is read
    // this process is scheduled at the same time the fetch promise is resolved
    // due to this we can't rely on getData resolution to know that the span has ended
    let resolveEndSpan: (value: unknown) => void;
    const spanEnded = new Promise(r => resolveEndSpan = r);
    const readSpy = sinon.spy(window.ReadableStreamDefaultReader.prototype, 'read');
    const endSpanStub: sinon.SinonStub<any> = sinon.stub(FetchInstrumentation.prototype, '_endSpan' as any)
      .callsFake(async function (this: FetchInstrumentation, ...args: any[]) {
        resolveEndSpan({});
        return endSpanStub.wrappedMethod.apply(this, args);
      });

    rootSpan = webTracerWithZone.startSpan('root');
    await api.context.with(api.trace.setSpan(api.context.active(), rootSpan), async () => {
      fakeNow = 0;
      try {
        const responsePromise = getData(fileUrl, method);
        fakeNow = 300;
        const response = await responsePromise;

        // if the url is not ignored, body.read should be called by now
        // awaiting for the span to end
        if (readSpy.callCount > 0) await spanEnded;

        // this is a bit tricky as the only way to get all request headers from
        // fetch is to use json()
        lastResponse = await response.json();
        const headers: { [key: string]: string } = {};
        Object.keys(lastResponse.headers).forEach(key => {
          headers[key.toLowerCase()] = lastResponse.headers[key];
        });
        lastResponse.headers = headers;
      } catch (e) {
        lastResponse = undefined;
      }
      await sinon.clock.runAllAsync();
    });
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
      await prepareData(url, { propagateTraceHeaderCorsUrls });
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

      assert.ok(
        attributes[keys[0]] !== '',
        `attributes ${AttributeNames.COMPONENT} is not defined`
      );
      assert.strictEqual(
        attributes[keys[1]],
        'GET',
        `attributes ${SemanticAttributes.HTTP_METHOD} is wrong`
      );
      assert.strictEqual(
        attributes[keys[2]],
        url,
        `attributes ${SemanticAttributes.HTTP_URL} is wrong`
      );
      assert.strictEqual(
        attributes[keys[3]],
        200,
        `attributes ${SemanticAttributes.HTTP_STATUS_CODE} is wrong`
      );
      assert.ok(
        attributes[keys[4]] === 'OK' || attributes[keys[4]] === '',
        `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
      );
      assert.ok(
        (attributes[keys[5]] as string).indexOf('localhost') === 0,
        `attributes ${SemanticAttributes.HTTP_HOST} is wrong`
      );
      assert.ok(
        attributes[keys[6]] === 'http' || attributes[keys[6]] === 'https',
        `attributes ${SemanticAttributes.HTTP_SCHEME} is wrong`
      );
      assert.ok(
        attributes[keys[7]] !== '',
        `attributes ${SemanticAttributes.HTTP_USER_AGENT} is not defined`
      );
      assert.ok(
        (attributes[keys[8]] as number) > 0,
        `attributes ${SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
      );

      assert.strictEqual(keys.length, 9, 'number of attributes is wrong');
    });

    it('span should have correct events', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
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

    it('should set trace headers', () => {
      const span: api.Span = exportSpy.args[1][0][0];
      assert.strictEqual(
        lastResponse.headers[X_B3_TRACE_ID],
        span.spanContext().traceId,
        `trace header '${X_B3_TRACE_ID}' not set`
      );
      assert.strictEqual(
        lastResponse.headers[X_B3_SPAN_ID],
        span.spanContext().spanId,
        `trace header '${X_B3_SPAN_ID}' not set`
      );
      assert.strictEqual(
        lastResponse.headers[X_B3_SAMPLED],
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
        headers: new Headers({'foo': 'bar'})
      });
      window.fetch(r).catch(() => {});
      assert.ok(r.headers.get('foo') === 'bar');
    });

    it('should keep custom headers with url, untyped request object and typed headers object', () => {
      const url = 'url';
      const init = {
        headers: new Headers({'foo': 'bar'})
      };
      window.fetch(url, init).catch(() => {});
      assert.ok(init.headers.get('foo') === 'bar');
    });

    it('should keep custom headers with url, untyped request object and untyped headers object', () => {
      const url = 'url';
      const init = {
        headers: {'foo': 'bar'}
      };
      window.fetch(url, init).catch(() => {});
      assert.ok(init.headers['foo'] === 'bar');
    });

    it('should pass request object as first parameter to the original function (#2411)', () => {
      const r = new Request(url);
      return window.fetch(r).then(() => {
        assert.ok(true);
      }, (response: Response) => {
        assert.fail(response.statusText);
      });
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
        await prepareData(url, {});
      });
      afterEach(() => {
        sinon.restore();
      });

      it('should NOT set trace headers', () => {
        assert.strictEqual(
          lastResponse.headers[X_B3_TRACE_ID],
          undefined,
          `trace header '${X_B3_TRACE_ID}' should not be set`
        );
        assert.strictEqual(
          lastResponse.headers[X_B3_SPAN_ID],
          undefined,
          `trace header '${X_B3_SPAN_ID}' should not be set`
        );
        assert.strictEqual(
          lastResponse.headers[X_B3_SAMPLED],
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

  describe('applyCustomAttributesOnSpan option', () => {
    const prepare = async (
      url: string,
      applyCustomAttributesOnSpan: FetchCustomAttributeFunction,
    ) => {
      const propagateTraceHeaderCorsUrls = [url];

      await prepareData(url, {
        propagateTraceHeaderCorsUrls,
        applyCustomAttributesOnSpan,
      });
    };

    afterEach(() => {
      clearData();
    });

    it('applies attributes when the request is succesful', async () => {
      await prepare(
        url,
        span => {
          span.setAttribute(CUSTOM_ATTRIBUTE_KEY, 'custom value');
        },
      );
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      const attributes = span.attributes;

      assert.ok(attributes[CUSTOM_ATTRIBUTE_KEY] === 'custom value');
    });

    it('applies custom attributes when the request fails', async () => {
      await prepare(
        badUrl,
        span => {
          span.setAttribute(CUSTOM_ATTRIBUTE_KEY, 'custom value');
        },
      );
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
      assert.deepStrictEqual(rsp.args, {});
    });
  });

  describe('when url is ignored', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = url;
      await prepareData(url, {
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
    it('should pass request object as the first parameter to the original function (#2411)', () => {
      const r = new Request(url);
      return window.fetch(r).then(() => {
        assert.ok(true);
      }, (response: Response) => {
        assert.fail(response.statusText);
      });
    });
  });

  describe('when clearTimingResources is TRUE', () => {
    beforeEach(async () => {
      const propagateTraceHeaderCorsUrls = url;
      await prepareData(url, {
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
      await prepareData(badUrl, { propagateTraceHeaderCorsUrls });
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
      await prepareData(url, { propagateTraceHeaderCorsUrls }, 'DELETE');
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
      await prepareData(url, {}, undefined, false, true);
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

      assert.strictEqual(events.length, 9, 'number of events is wrong');

      assert.strictEqual(
        events[6].name,
        PTN.REQUEST_START,
        `event ${PTN.REQUEST_START} is not defined`
      );
    });
  });

  describe('when fetching with relative url', () => {
    beforeEach(async () => {
      await prepareData('/get', {}, undefined, false, true);
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

      assert.strictEqual(events.length, 9, 'number of events is wrong');
      assert.strictEqual(
        events[6].name,
        PTN.REQUEST_START,
        `event ${PTN.REQUEST_START} is not defined`
      );
    });
  });

  describe('when PerformanceObserver is undefined', () => {
    beforeEach(async () => {
      await prepareData(url, {}, undefined, true, false);
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
      assert.strictEqual(events.length, 9, 'number of events is wrong');
      assert.strictEqual(
        events[6].name,
        PTN.REQUEST_START,
        `event ${PTN.REQUEST_START} is not defined`
      );
    });
  });

  describe('when PerformanceObserver and performance.getEntriesByType are undefined', () => {
    beforeEach(async () => {
      await prepareData(url, {}, undefined, true, true);
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
        `Missing basic attribute ${SemanticAttributes.HTTP_STATUS_CODE}`
      );
    });
  });

  describe('when network events are ignored', () => {
    beforeEach(async () => {
      await prepareData(url, {
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
  });
});
