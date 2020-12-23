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

import { NoopLogger } from '@opentelemetry/core';
import { SpanKind, Span, context, propagation } from '@opentelemetry/api';
import {
  HttpAttribute,
  GeneralAttribute,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as http from 'http';
import { assertSpan } from '../utils/assertSpan';
import * as url from 'url';
import * as utils from '../utils/utils';
import { NodeTracerProvider } from '@opentelemetry/node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { HttpInstrumentation } from '../../src';

const logger = new NoopLogger();
const instrumentation = new HttpInstrumentation({ logger });
instrumentation.enable();
instrumentation.disable();

import * as https from 'https';
import { httpsRequest } from '../utils/httpsRequest';
import { DummyPropagation } from '../utils/DummyPropagation';

const protocol = 'https';
const serverPort = 42345;
const hostname = 'localhost';
const memoryExporter = new InMemorySpanExporter();

export const customAttributeFunction = (span: Span): void => {
  span.setAttribute('span kind', SpanKind.CLIENT);
};

describe('HttpsInstrumentation Integration tests', () => {
  beforeEach(() => {
    memoryExporter.reset();
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
  });

  afterEach(() => {
    context.disable();
  });

  describe('enable()', () => {
    before(function (done) {
      // mandatory
      if (process.env.CI) {
        done();
        return;
      }

      utils.checkInternet(isConnected => {
        if (!isConnected) {
          this.skip();
          // don't disturb people
        }
        done();
      });
    });
    const logger = new NoopLogger();
    const provider = new NodeTracerProvider({
      logger,
    });
    propagation.setGlobalPropagator(new DummyPropagation());
    provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    instrumentation.setTracerProvider(provider);
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(() => {
      const ignoreConfig = [
        `${protocol}://${hostname}:${serverPort}/ignored/string`,
        /\/ignored\/regexp$/i,
        (url: string) => url.endsWith('/ignored/function'),
      ];
      instrumentation.setConfig({
        ignoreIncomingPaths: ignoreConfig,
        ignoreOutgoingUrls: ignoreConfig,
        applyCustomAttributesOnSpan: customAttributeFunction,
      });
      instrumentation.enable();
    });

    after(() => {
      instrumentation.disable();
    });

    it('should create a rootSpan for GET requests and add propagation headers', async () => {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      const result = await httpsRequest.get(
        `${protocol}://google.fr/?query=test`
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      const validations = {
        hostname: 'google.fr',
        httpStatusCode: result.statusCode!,
        httpMethod: 'GET',
        pathname: '/',
        path: '/?query=test',
        resHeaders: result.resHeaders,
        reqHeaders: result.reqHeaders,
        component: 'https',
      };

      assert.strictEqual(spans.length, 1);
      assert.strictEqual(span.name, 'HTTPS GET');
      assertSpan(span, SpanKind.CLIENT, validations);
    });

    it('should create a rootSpan for GET requests and add propagation headers if URL is used', async () => {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      const result = await httpsRequest.get(
        new url.URL(`${protocol}://google.fr/?query=test`)
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      const validations = {
        hostname: 'google.fr',
        httpStatusCode: result.statusCode!,
        httpMethod: 'GET',
        pathname: '/',
        path: '/?query=test',
        resHeaders: result.resHeaders,
        reqHeaders: result.reqHeaders,
        component: 'https',
      };

      assert.strictEqual(spans.length, 1);
      assert.strictEqual(span.name, 'HTTPS GET');
      assertSpan(span, SpanKind.CLIENT, validations);
    });

    it('should create a valid rootSpan with propagation headers for GET requests if URL and options are used', async () => {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);

      const result = await httpsRequest.get(
        new url.URL(`${protocol}://google.fr/?query=test`),
        { headers: { 'x-foo': 'foo' } }
      );

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      const validations = {
        hostname: 'google.fr',
        httpStatusCode: result.statusCode!,
        httpMethod: 'GET',
        pathname: '/',
        path: '/?query=test',
        resHeaders: result.resHeaders,
        reqHeaders: result.reqHeaders,
        component: 'https',
      };

      assert.strictEqual(spans.length, 1);
      assert.strictEqual(span.name, 'HTTPS GET');
      assert.strictEqual(result.reqHeaders['x-foo'], 'foo');
      assert.strictEqual(span.attributes[HttpAttribute.HTTP_FLAVOR], '1.1');
      assert.strictEqual(
        span.attributes[GeneralAttribute.NET_TRANSPORT],
        GeneralAttribute.IP_TCP
      );
      assertSpan(span, SpanKind.CLIENT, validations);
    });

    it('custom attributes should show up on client spans', async () => {
      const result = await httpsRequest.get(`${protocol}://google.fr/`);
      const spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      const validations = {
        hostname: 'google.fr',
        httpStatusCode: result.statusCode!,
        httpMethod: 'GET',
        pathname: '/',
        resHeaders: result.resHeaders,
        reqHeaders: result.reqHeaders,
        component: 'https',
      };

      assert.strictEqual(spans.length, 1);
      assert.strictEqual(span.name, 'HTTPS GET');
      assert.strictEqual(span.attributes['span kind'], SpanKind.CLIENT);
      assertSpan(span, SpanKind.CLIENT, validations);
    });

    it('should create a span for GET requests and add propagation headers with Expect headers', async () => {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);
      const options = Object.assign(
        { headers: { Expect: '100-continue' } },
        url.parse(`${protocol}://google.fr/`)
      );

      const result = await httpsRequest.get(options);
      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];
      const validations = {
        hostname: 'google.fr',
        httpStatusCode: 301,
        httpMethod: 'GET',
        pathname: '/',
        resHeaders: result.resHeaders,
        reqHeaders: result.reqHeaders,
        component: 'https',
      };

      assert.strictEqual(spans.length, 1);
      assert.strictEqual(span.name, 'HTTPS GET');

      try {
        assertSpan(span, SpanKind.CLIENT, validations);
      } catch (error) {
        // temporary redirect is also correct
        validations.httpStatusCode = 307;
        assertSpan(span, SpanKind.CLIENT, validations);
      }
    });
    for (const headers of [
      { Expect: '100-continue', 'user-agent': 'https-instrumentation-test' },
      { 'user-agent': 'https-instrumentation-test' },
    ]) {
      it(`should create a span for GET requests and add propagation when using the following signature: get(url, options, callback) and following headers: ${JSON.stringify(
        headers
      )}`, done => {
        let validations: {
          hostname: string;
          httpStatusCode: number;
          httpMethod: string;
          pathname: string;
          reqHeaders: http.OutgoingHttpHeaders;
          resHeaders: http.IncomingHttpHeaders;
        };
        let data = '';
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 0);
        const options = { headers };
        const req = https.get(
          `${protocol}://google.fr/`,
          options,
          (resp: http.IncomingMessage) => {
            const res = (resp as unknown) as http.IncomingMessage & {
              req: http.IncomingMessage;
            };

            resp.on('data', chunk => {
              data += chunk;
            });
            resp.on('end', () => {
              validations = {
                hostname: 'google.fr',
                httpStatusCode: 301,
                httpMethod: 'GET',
                pathname: '/',
                resHeaders: resp.headers,
                /* tslint:disable:no-any */
                reqHeaders: (res.req as any).getHeaders
                  ? (res.req as any).getHeaders()
                  : (res.req as any)._headers,
                /* tslint:enable:no-any */
              };
            });
          }
        );

        req.on('close', () => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(spans[0].name, 'HTTPS GET');
          assert.ok(data);
          assert.ok(validations.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY]);
          assert.ok(validations.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY]);
          done();
        });
      });
    }
  });
});
