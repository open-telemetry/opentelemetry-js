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
import { ZoneContextManager } from '@opentelemetry/context-zone';
import * as tracing from '@opentelemetry/tracing';
import {
  PerformanceTimingNames as PTN,
  WebTracerProvider,
} from '@opentelemetry/web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { FetchPlugin, FetchPluginConfig } from '../src';
import { AttributeNames } from '../src/enums/AttributeNames';

class DummySpanExporter implements tracing.SpanExporter {
  export(spans: any) {}

  shutdown() {}
}

const getData = (url: string, method?: string) =>
  fetch(url, {
    method: method || 'GET',
    headers: {
      foo: 'bar',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

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

function createMasterResource(resource = {}): PerformanceResourceTiming {
  const masterResource: any = createResource(resource);
  Object.keys(masterResource).forEach((key: string) => {
    if (typeof masterResource[key] === 'number') {
      masterResource[key] = masterResource[key] + 30;
    }
  });
  return masterResource;
}

describe('fetch', () => {
  let sandbox: sinon.SinonSandbox;
  let contextManager: ZoneContextManager;
  let lastResponse: any | undefined;
  let webTracerWithZone: api.Tracer;
  let webTracerProviderWithZone: WebTracerProvider;
  let dummySpanExporter: DummySpanExporter;
  let exportSpy: any;
  let clearResourceTimingsSpy: any;
  let rootSpan: api.Span;
  let fakeNow = 0;
  let fetchPlugin: FetchPlugin;

  const url = 'http://localhost:8090/get';
  const badUrl = 'http://foo.bar.com/get';

  const clearData = () => {
    sandbox.restore();
    lastResponse = undefined;
  };

  const prepareData = (
    done: any,
    fileUrl: string,
    config: FetchPluginConfig,
    method?: string
  ) => {
    sandbox = sinon.createSandbox();
    sandbox.useFakeTimers();

    sandbox.stub(core.otperformance, 'timeOrigin').value(0);
    sandbox.stub(core.otperformance, 'now').callsFake(() => fakeNow);

    function fakeFetch(input: RequestInfo, init: RequestInit = {}) {
      return new Promise((resolve, reject) => {
        const response: any = {
          args: {},
          url: fileUrl,
        };
        response.headers = Object.assign({}, init.headers);

        if (init.method === 'DELETE') {
          response.status = 405;
          response.statusText = 'OK';
          resolve(new window.Response('foo', response));
        } else if (input === url) {
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

    sandbox.stub(window, 'fetch').callsFake(fakeFetch as any);

    const resources: PerformanceResourceTiming[] = [];
    resources.push(
      createResource({
        name: fileUrl,
      }),
      createMasterResource({
        name: fileUrl,
      })
    );

    const spyEntries = sandbox.stub(performance, 'getEntriesByType');
    spyEntries.withArgs('resource').returns(resources);
    fetchPlugin = new FetchPlugin(config);
    webTracerProviderWithZone = new WebTracerProvider({
      logLevel: core.LogLevel.ERROR,
      plugins: [fetchPlugin],
    });
    webTracerWithZone = webTracerProviderWithZone.getTracer('fetch-test');
    dummySpanExporter = new DummySpanExporter();
    exportSpy = sandbox.stub(dummySpanExporter, 'export');
    clearResourceTimingsSpy = sandbox.stub(performance, 'clearResourceTimings');
    webTracerProviderWithZone.addSpanProcessor(
      new tracing.SimpleSpanProcessor(dummySpanExporter)
    );

    rootSpan = webTracerWithZone.startSpan('root');
    webTracerWithZone.withSpan(rootSpan, () => {
      fakeNow = 0;
      getData(fileUrl, method).then(
        response => {
          // this is a bit tricky as the only way to get all request headers from
          // fetch is to use json()
          response.json().then(
            json => {
              lastResponse = json;
              const headers: { [key: string]: string } = {};
              Object.keys(lastResponse.headers).forEach(key => {
                headers[key.toLowerCase()] = lastResponse.headers[key];
              });
              lastResponse.headers = headers;
              // OBSERVER_WAIT_TIME_MS
              sandbox.clock.tick(300);
              done();
            },
            () => {
              lastResponse = undefined;
              // OBSERVER_WAIT_TIME_MS
              sandbox.clock.tick(300);
              done();
            }
          );
        },
        () => {
          lastResponse = undefined;
          // OBSERVER_WAIT_TIME_MS
          sandbox.clock.tick(300);
          done();
        }
      );
      fakeNow = 300;
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
    api.propagation.setGlobalPropagator(new core.B3Propagator());
  });

  describe('when request is successful', () => {
    beforeEach(done => {
      const propagateTraceHeaderCorsUrls = [url];
      prepareData(done, url, { propagateTraceHeaderCorsUrls });
    });

    afterEach(() => {
      clearData();
    });

    it('should wrap methods', () => {
      assert.ok(core.isWrapped(window.fetch));
      fetchPlugin.patch();
      assert.ok(core.isWrapped(window.fetch));
    });

    it('should unwrap methods', () => {
      assert.ok(core.isWrapped(window.fetch));
      fetchPlugin.unpatch();
      assert.ok(!core.isWrapped(window.fetch));
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
      assert.ok(
        attributes[keys[4]] === 'OK' || attributes[keys[4]] === '',
        `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
      );
      assert.ok(
        (attributes[keys[5]] as string).indexOf('localhost') === 0,
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
      assert.ok(
        (attributes[keys[8]] as number) > 0,
        `attributes ${AttributeNames.HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
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

    it('should set trace headers', () => {
      const span: api.Span = exportSpy.args[1][0][0];
      assert.strictEqual(
        lastResponse.headers[core.X_B3_TRACE_ID],
        span.context().traceId,
        `trace header '${core.X_B3_TRACE_ID}' not set`
      );
      assert.strictEqual(
        lastResponse.headers[core.X_B3_SPAN_ID],
        span.context().spanId,
        `trace header '${core.X_B3_SPAN_ID}' not set`
      );
      assert.strictEqual(
        lastResponse.headers[core.X_B3_SAMPLED],
        String(span.context().traceFlags),
        `trace header '${core.X_B3_SAMPLED}' not set`
      );
    });

    it('should NOT clear the resources', () => {
      assert.strictEqual(
        clearResourceTimingsSpy.args.length,
        0,
        'resources have been cleared'
      );
    });

    describe('when propagateTraceHeaderCorsUrls does NOT MATCH', () => {
      beforeEach(done => {
        clearData();
        prepareData(done, url, {});
      });
      it('should NOT set trace headers', () => {
        assert.strictEqual(
          lastResponse.headers[core.X_B3_TRACE_ID],
          undefined,
          `trace header '${core.X_B3_TRACE_ID}' should not be set`
        );
        assert.strictEqual(
          lastResponse.headers[core.X_B3_SPAN_ID],
          undefined,
          `trace header '${core.X_B3_SPAN_ID}' should not be set`
        );
        assert.strictEqual(
          lastResponse.headers[core.X_B3_SAMPLED],
          undefined,
          `trace header '${core.X_B3_SAMPLED}' should not be set`
        );
      });
    });
  });

  describe('when url is ignored', () => {
    beforeEach(done => {
      const propagateTraceHeaderCorsUrls = url;
      prepareData(done, url, {
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
  });

  describe('when clearTimingResources is TRUE', () => {
    beforeEach(done => {
      const propagateTraceHeaderCorsUrls = url;
      prepareData(done, url, {
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
    beforeEach(done => {
      const propagateTraceHeaderCorsUrls = badUrl;
      prepareData(done, badUrl, { propagateTraceHeaderCorsUrls });
    });
    afterEach(() => {
      clearData();
    });
    it('should create a span with correct root span', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(
        span.parentSpanId,
        rootSpan.context().spanId,
        'parent span is not root span'
      );
    });
  });

  describe('when request is NOT successful (405)', () => {
    beforeEach(done => {
      const propagateTraceHeaderCorsUrls = url;
      prepareData(done, url, { propagateTraceHeaderCorsUrls }, 'DELETE');
    });
    afterEach(() => {
      clearData();
    });

    it('should create a span with correct root span', () => {
      const span: tracing.ReadableSpan = exportSpy.args[1][0][0];
      assert.strictEqual(
        span.parentSpanId,
        rootSpan.context().spanId,
        'parent span is not root span'
      );
    });
  });
});
