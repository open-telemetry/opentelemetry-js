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

import { context, propagation } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { UndiciInstrumentation } from '../src/undici';

import { MockServer } from './utils/mock-server';
import { assertSpan } from './utils/assertSpan';

const instrumentation = new UndiciInstrumentation();
instrumentation.enable();
instrumentation.disable();

const protocol = 'http';
const hostname = 'localhost';
const mockServer = new MockServer();
const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
instrumentation.setTracerProvider(provider);

describe('UndiciInstrumentation `fetch` tests', function () {
  before(function (done) {
    // Do not test if the `fetch` global API is not available
    // This applies to nodejs < v18 or nodejs < v16.15 wihtout the flag
    // `--experimental-global-fetch` set
    // https://nodejs.org/api/globals.html#fetch
    if (typeof globalThis.fetch !== 'function') {
      this.skip();
    }
    
    // TODO: mock propagation and test it
    // propagation.setGlobalPropagator(new DummyPropagation());
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
    mockServer.start(done);
    mockServer.mockListener((req, res) => {
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

      const fetchUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      await fetch(fetchUrl);

      spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0, 'no spans are created');
    });
  });

  describe('enable()', function () {
    beforeEach(function () {
      instrumentation.enable();
    });
    afterEach(function () {
      instrumentation.disable();
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

      const fetchUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const response = await fetch(fetchUrl);

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];

      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      // console.dir(span, { depth: 9 });
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: response.status,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        resHeaders: response.headers,
      });
    });

    it('should create valid spans with empty configuration', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      // Empty configuration
      instrumentation.setConfig({ enabled: true });

      const fetchUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const response = await fetch(fetchUrl);

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];

      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: response.status,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        resHeaders: response.headers,
      });
    });

    it('should create valid spans with the given configuration', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

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

      // Do some requests
      await fetch(`${protocol}://${hostname}:${mockServer.port}/ignore/path`);
      const reqInit = {
        headers: new Headers({
          'user-agent': 'custom',
          'foo-client': 'bar'
        }),
      };
      const response = await fetch(`${protocol}://${hostname}:${mockServer.port}/?query=test`, reqInit);

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      // TODO: remove this when test finished
      // console.dir(span, { depth: 9 });
      assert.ok(span, 'a span is present');
      assert.strictEqual(spans.length, 1);
      assertSpan(span, {
        hostname: 'localhost',
        httpStatusCode: response.status,
        httpMethod: 'GET',
        path: '/',
        query:'?query=test',
        reqHeaders: reqInit.headers,
        resHeaders: response.headers,
      });
      console.log(span.attributes)
      assert.strictEqual(
        span.attributes['http.request.header.foo-client'],
        'bar',
        'request headers from fetch options are captured',
      );
      assert.strictEqual(
        span.attributes['http.request.header.x-requested-with'],
        'bar',
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

    it('should not create spans without parent if configured', async function () {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      instrumentation.setConfig({
        enabled: true,
        requireParentforSpans: true,
      });

      const fetchUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      await fetch(fetchUrl);

      spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0, 'no spans are created');
    });
  });
});
