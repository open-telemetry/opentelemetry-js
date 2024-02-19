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
import { Writable } from 'stream';

import { SpanKind, SpanStatusCode, context, propagation, trace } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { UndiciInstrumentation } from '../src/undici';

import { MockPropagation } from './utils/mock-propagation';
import { MockServer } from './utils/mock-server';
import { assertSpan } from './utils/assertSpan';

const instrumentation = new UndiciInstrumentation();
instrumentation.enable();
instrumentation.disable();

import type { Dispatcher } from 'undici';
import * as undici from 'undici';

const protocol = 'http';
const hostname = 'localhost';
const mockServer = new MockServer();
const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
instrumentation.setTracerProvider(provider);


// Undici docs (https://github.com/nodejs/undici#garbage-collection) suggest
// that an undici response body should always be consumed.
async function consumeResponseBody(body: Dispatcher.ResponseData["body"]) {
  return new Promise((resolve) => {
    const devNull = new Writable({
      write(_chunk, _encoding, cb) {
        setImmediate(cb);
      },
    });
    body.pipe(devNull);
    body.on('end', resolve);
  });
}

describe('UndiciInstrumentation `undici` tests', function () {
  before(function (done) {
    propagation.setGlobalPropagator(new MockPropagation());
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
    mockServer.start(done);
    mockServer.mockListener((req, res) => {
      // There are some situations where there is no way to access headers
      // for trace propagation asserts like:
      // const resp = await fetch('http://host:port')
      // so we need to do the assertion here
      try {
        assert.ok(
          req.headers[MockPropagation.TRACE_CONTEXT_KEY],
          `trace propagation for ${MockPropagation.TRACE_CONTEXT_KEY} works`,
        );
        assert.ok(
          req.headers[MockPropagation.SPAN_CONTEXT_KEY],
          `trace propagation for ${MockPropagation.SPAN_CONTEXT_KEY} works`,  
        );
      } catch (assertErr) {
        // The exception will hang the server and the test so we set a header
        // back to the test to make an assertion
        res.setHeader('propagation-error', assertErr.message);
      }

      // Retur a valid response always
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.setHeader('foo-server', 'bar');
      res.write(JSON.stringify({ success: true }));
      res.end();
    });
  });

  after(function(done) {
    context.disable();
    propagation.disable();
    mockServer.mockListener(undefined);
    mockServer.stop(done);
  });

  beforeEach(function () {
    memoryExporter.reset();
  });

  describe('disable()', function () {
    it('should not create spans when disabled', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Disable via config
      instrumentation.setConfig({ enabled: false });

      const requestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const { headers, body } = await undici.request(requestUrl);
      await consumeResponseBody(body);

      assert.ok(
        headers['propagation-error'] != null,
        'propagation is not set if instrumentation disabled'
      );

      spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0, 'no spans are created');
    });
  });

  describe('enable()', function () {
    beforeEach(function () {
      instrumentation.enable();
      // Set configuration
      instrumentation.setConfig({
        enabled: true,
        ignoreRequestHook: (req) => {
          return req.path.indexOf('/ignore/path') !== -1;
        },
        requestHook: (span, req) => {
          // TODO: maybe an intermediate request with better API
          req.headers += 'x-requested-with: undici\r\n';
        },
        startSpanHook: (request) => {
          return {
            'test.hook.attribute': 'hook-value',
          };
        },
        headersToSpanAttributes: {
          requestHeaders: ['foo-client', 'x-requested-with'],
          responseHeaders: ['foo-server'],
        }
      });
    });
    afterEach(function () {
      // Empty configuration & disable
      instrumentation.setConfig({ enabled: false });
    });

    it('should ingore requests based on the result of ignoreRequestHook', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Do some requests
      const headers = {
        'user-agent': 'custom',
        'foo-client': 'bar'
      };

      const ignoreRequestUrl = `${protocol}://${hostname}:${mockServer.port}/ignore/path`;
      const ignoreResponse = await undici.request(ignoreRequestUrl, { headers });
      await consumeResponseBody(ignoreResponse.body);

      assert.ok(
        ignoreResponse.headers['propagation-error'],
        'propagation is not set for ignored requests'
      );

      spans = memoryExporter.getFinishedSpans();
      assert.ok(
        spans.length === 0,
        'ignoreRequestHook is filtering requests'
      );
    });

    it('should create valid spans for "request" method', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Do some requests
      const headers = {
        'user-agent': 'custom',
        'foo-client': 'bar'
      };

      const ignoreRequestUrl = `${protocol}://${hostname}:${mockServer.port}/ignore/path`;
      const ignoreResponse = await undici.request(ignoreRequestUrl, { headers });
      await consumeResponseBody(ignoreResponse.body);

      assert.ok(
        ignoreResponse.headers['propagation-error'],
        'propagation is not set for ignored requests'
      );

      const queryRequestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const queryResponse = await undici.request(queryRequestUrl, { headers });
      await consumeResponseBody(queryResponse.body);

      assert.ok(
        queryResponse.headers['propagation-error'] == null,
        'propagation is set for instrumented requests'
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: queryResponse.statusCode,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        reqHeaders: headers,
        resHeaders: queryResponse.headers,
      });
      assert.strictEqual(
        span.attributes['http.request.header.foo-client'],
        'bar',
        'request headers from fetch options are captured',
      );
      assert.strictEqual(
        span.attributes['http.request.header.x-requested-with'],
        'undici',
        'request headers from requestHook are captured',
      );
      assert.strictEqual(
        span.attributes['http.response.header.foo-server'],
        'bar',
        'response headers from the server are captured',
      );
      assert.strictEqual(
        span.attributes['test.hook.attribute'],
        'hook-value',
        'startSpanHook is called',
      );
    });

    it('should create valid spans for "fetch" method', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Do some requests
      const headers = {
        'user-agent': 'custom',
        'foo-client': 'bar'
      };
      const queryRequestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const queryResponse = await undici.fetch(queryRequestUrl, { headers });
      await queryResponse.text();

      assert.ok(
        queryResponse.headers.get('propagation-error') == null,
        'propagation is set for instrumented requests'
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: queryResponse.status,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        reqHeaders: headers,
        resHeaders: queryResponse.headers as Headers,
      });
      assert.strictEqual(
        span.attributes['http.request.header.foo-client'],
        'bar',
        'request headers from fetch options are captured',
      );
      assert.strictEqual(
        span.attributes['http.request.header.x-requested-with'],
        'undici',
        'request headers from requestHook are captured',
      );
      assert.strictEqual(
        span.attributes['http.response.header.foo-server'],
        'bar',
        'response headers from the server are captured',
      );
      assert.strictEqual(
        span.attributes['test.hook.attribute'],
        'hook-value',
        'startSpanHook is called',
      );
    });

    it('should create valid spans for "stream" method', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Do some requests
      const headers = {
        'user-agent': 'custom',
        'foo-client': 'bar'
      };
      // https://undici.nodejs.org/#/docs/api/Dispatcher?id=example-1-basic-get-stream-request
      const queryRequestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const queryResponse: Record<string, any> = {};
      const bufs: any[] = [];
      await undici.stream(
        queryRequestUrl,
        { opaque: { bufs }, headers } as any,
        ({ statusCode, headers, opaque }) => {
          queryResponse.statusCode = statusCode;
          queryResponse.headers = headers;
          return new Writable({
            write (chunk, encoding, callback) {
              (opaque as any).bufs.push(chunk)
              callback()
            }
          });
        }
      );

      assert.ok(
        queryResponse.headers['propagation-error'] == null,
        'propagation is set for instrumented requests'
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: queryResponse.statusCode,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        reqHeaders: headers,
        resHeaders: queryResponse.headers as Headers,
      });
      assert.strictEqual(
        span.attributes['http.request.header.foo-client'],
        'bar',
        'request headers from fetch options are captured',
      );
      assert.strictEqual(
        span.attributes['http.request.header.x-requested-with'],
        'undici',
        'request headers from requestHook are captured',
      );
      assert.strictEqual(
        span.attributes['http.response.header.foo-server'],
        'bar',
        'response headers from the server are captured',
      );
      assert.strictEqual(
        span.attributes['test.hook.attribute'],
        'hook-value',
        'startSpanHook is called',
      );
    });

    it('should create valid spans for "dispatch" method', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Do some requests
      const headers = {
        'user-agent': 'custom',
        'foo-client': 'bar'
      };

      const queryRequestUrl = `${protocol}://${hostname}:${mockServer.port}`;
      const queryResponse: Record<string, any> = {};
      const client = new undici.Client(queryRequestUrl);
      await new Promise((resolve, reject) => {
        client.dispatch(
          {
            path: '/?query=test',
            method: 'GET',
            headers,
          },
          {
            onHeaders: (statusCode, headers) => {
              queryResponse.statusCode = statusCode;
              queryResponse.headers = headers;
              return true; // unidici types require to return boolean
            },
            onError: reject,
            onComplete: resolve,
            // Although the types say these following handlers are optional they must
            // be defined to avoid a TypeError
            onConnect: () => undefined,
            onData: () => true,
          }
        );
      });

      assert.ok(
        queryResponse.headers['propagation-error'] == null,
        'propagation is set for instrumented requests'
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: queryResponse.statusCode,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        reqHeaders: headers,
        resHeaders: queryResponse.headers as Headers,
      });
      assert.strictEqual(
        span.attributes['http.request.header.foo-client'],
        'bar',
        'request headers from fetch options are captured',
      );
      assert.strictEqual(
        span.attributes['http.request.header.x-requested-with'],
        'undici',
        'request headers from requestHook are captured',
      );
      assert.strictEqual(
        span.attributes['http.response.header.foo-server'],
        'bar',
        'response headers from the server are captured',
      );
      assert.strictEqual(
        span.attributes['test.hook.attribute'],
        'hook-value',
        'startSpanHook is called',
      );
    });

    it('should create valid spans even if the configuration hooks fail', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Set the bad configuration
      instrumentation.setConfig({
        enabled: true,
        ignoreRequestHook: () => {
          throw new Error('ignoreRequestHook error');
        },
        applyCustomAttributesOnSpan: () => {
          throw new Error('ignoreRequestHook error');
        },
        requestHook: () => {
          throw new Error('requestHook error');
        },
        startSpanHook: () => {
          throw new Error('startSpanHook error');
        },
      })

      const requestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const { headers, statusCode, body } = await undici.request(requestUrl);
      await consumeResponseBody(body);

      assert.ok(
        headers['propagation-error'] == null,
        'propagation is set for instrumented requests'
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];

      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: statusCode,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        resHeaders: headers,
      });
    });

    it('should not create spans without parent if required in configuration', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      instrumentation.setConfig({
        enabled: true,
        requireParentforSpans: true,
      });

      const requestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const response = await undici.request(requestUrl);
      await consumeResponseBody(response.body);

      // TODO: here we're checking the propagation works even if the instrumentation
      // is not starting any span. Not 100% sure this is the behaviour we want
      assert.ok(
        response.headers['propagation-error'] == null,
        'propagation is set for instrumented requests'
      );

      spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0, 'no spans are created');
    });

    it('should create spans with parent if required in configuration', function (done) {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      instrumentation.setConfig({
        enabled: true,
        requireParentforSpans: true,
      });

      const tracer = provider.getTracer('default');
      const span = tracer.startSpan('parentSpan', {
        kind: SpanKind.INTERNAL,
      });

      context.with(trace.setSpan(context.active(), span), async () => {
        const requestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
        const response = await undici.request(requestUrl);
        await consumeResponseBody(response.body);

        span.end();
        // TODO: here we're checking the propagation works even if the instrumentation
        // is not starting any span. Not 100% sure this is the behaviour we want
        assert.ok(
          response.headers['propagation-error'] == null,
          'propagation is set for instrumented requests'
        );

        spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2, 'child span is created');
        assert.strictEqual(
          spans.filter(span => span.kind === SpanKind.CLIENT).length,
          1,
          'child span is created'
        );
        assert.strictEqual(
          spans.filter(span => span.kind === SpanKind.INTERNAL).length,
          1,
          'parent span is present'
        );

        done();
      });
    });


    it('should capture errors while doing request', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      let fetchError;
      try {
        const requestUrl = 'http://unexistent-host-name/path';
        await undici.request(requestUrl);
      } catch (err) {
        // Expected error
        fetchError = err;
      }

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'unexistent-host-name',
        httpMethod: 'GET',
        path: '/path',
        error: fetchError,
        noNetPeer: true, // do not check network attribs
        forceStatus: {
          code: SpanStatusCode.ERROR,
          message: 'getaddrinfo ENOTFOUND unexistent-host-name'
        }
      });
    });

    it('should capture error if undici request is aborted', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      let requestError;
      const controller = new AbortController();
      const requestUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const requestPromise = undici.request(requestUrl, { signal: controller.signal });
      controller.abort();
      try {
        await requestPromise;
      } catch (err) {
        // Expected error
        requestError = err;
      }

      // Let the error be published to diagnostics channel
      await new Promise((r) => setTimeout(r,5));

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        error: requestError,
        noNetPeer: true, // do not check network attribs
        forceStatus: {
          code: SpanStatusCode.ERROR,
          message: requestError.message
        }
      });
    });
  });
});
