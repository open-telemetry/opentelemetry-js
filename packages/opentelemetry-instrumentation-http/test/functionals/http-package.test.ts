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

import { context, SpanKind, Span, propagation } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NoopLogger } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as path from 'path';
import * as url from 'url';
import { HttpInstrumentation } from '../../src/http';
import { assertSpan } from '../utils/assertSpan';
import { DummyPropagation } from '../utils/DummyPropagation';

const logger = new NoopLogger();
const instrumentation = new HttpInstrumentation({ logger });
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import * as request from 'request-promise-native';
import * as superagent from 'superagent';
import * as got from 'got';
import * as nock from 'nock';
import axios, { AxiosResponse } from 'axios';

const memoryExporter = new InMemorySpanExporter();
const protocol = 'http';
const customAttributeFunction = (span: Span): void => {
  span.setAttribute('span kind', SpanKind.CLIENT);
};

describe('Packages', () => {
  beforeEach(() => {
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
  });

  afterEach(() => {
    context.disable();
  });
  describe('get', () => {
    const logger = new NoopLogger();
    const provider = new NodeTracerProvider({
      logger,
    });
    provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    instrumentation.setTracerProvider(provider);
    propagation.setGlobalPropagator(new DummyPropagation());
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(() => {
      instrumentation.setConfig({
        applyCustomAttributesOnSpan: customAttributeFunction,
      });
      instrumentation.enable();
    });

    after(() => {
      // back to normal
      nock.cleanAll();
      nock.enableNetConnect();
    });

    let resHeaders: http.IncomingHttpHeaders;
    [
      { name: 'axios', httpPackage: axios }, //keep first
      { name: 'superagent', httpPackage: superagent },
      { name: 'got', httpPackage: { get: (url: string) => got(url) } },
      {
        name: 'request',
        httpPackage: { get: (url: string) => request(url) },
      },
    ].forEach(({ name, httpPackage }) => {
      it(`should create a span for GET requests and add propagation headers by using ${name} package`, async () => {
        if (process.versions.node.startsWith('12') && name === 'got') {
          // got complains with nock and node version 12+
          // > RequestError: The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type function
          // so let's make a real call
          nock.cleanAll();
          nock.enableNetConnect();
        } else {
          nock.load(path.join(__dirname, '../', '/fixtures/google-http.json'));
        }

        const urlparsed = url.parse(
          `${protocol}://www.google.com/search?q=axios&oq=axios&aqs=chrome.0.69i59l2j0l3j69i60.811j0j7&sourceid=chrome&ie=UTF-8`
        );
        const result = await httpPackage.get(urlparsed.href!);
        if (!resHeaders) {
          const res = result as AxiosResponse<{}>;
          resHeaders = res.headers;
        }
        const spans = memoryExporter.getFinishedSpans();
        const span = spans[0];
        const validations = {
          hostname: urlparsed.hostname!,
          httpStatusCode: 200,
          httpMethod: 'GET',
          pathname: urlparsed.pathname!,
          path: urlparsed.path,
          resHeaders,
          component: 'http',
        };

        assert.strictEqual(spans.length, 1);
        assert.strictEqual(span.name, 'HTTP GET');

        switch (name) {
          case 'axios':
            assert.ok(
              result.request._headers[DummyPropagation.TRACE_CONTEXT_KEY]
            );
            assert.ok(
              result.request._headers[DummyPropagation.SPAN_CONTEXT_KEY]
            );
            break;
          case 'got':
          case 'superagent':
            break;
          default:
            break;
        }
        assert.strictEqual(span.attributes['span kind'], SpanKind.CLIENT);
        assertSpan(span, SpanKind.CLIENT, validations);
      });
    });
  });
});
