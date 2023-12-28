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
import * as http from 'http';
import * as url from 'url';

import { SpanKind, Span, context, propagation } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { UndiciInstrumentation } from '../src/undici';

import { MockServer } from './utils/mock-server'


const instrumentation = new UndiciInstrumentation();
instrumentation.enable();
instrumentation.disable();


const protocol = 'http';
const serverPort = 32345;
const hostname = 'localhost';
const mockServer = new MockServer();
const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
instrumentation.setTracerProvider(provider);

describe('UndiciInstrumentation `fetch` tests', () => {
  before(done => {
    mockServer.start(done);
  });

  after(done => {
    mockServer.stop(done);
  });

  beforeEach(() => {
    memoryExporter.reset();
  });

  before(() => {
    // propagation.setGlobalPropagator(new DummyPropagation());
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
  });

  after(() => {
    context.disable();
    propagation.disable();
  });

  describe('enable()', () => {
    before(() => {
      instrumentation.enable();
    });
    after(() => {
      instrumentation.disable();
    });

    it('should create a rootSpan for GET requests and add propagation headers', async () => {
      let spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);
  
      const response = await fetch(
        `${protocol}://localhost:${mockServer.port}/?query=test`
      );
  
      spans = memoryExporter.getFinishedSpans();
      // const span = spans.find(s => s.kind === SpanKind.CLIENT);
      const span = spans[0];
      assert.ok(span);
      const validations = {
        hostname: 'localhost',
        httpStatusCode: response.status,
        httpMethod: 'GET',
        pathname: '/',
        path: '/?query=test',
        resHeaders: response.headers,
        reqHeaders: {},
        component: 'http',
      };
  
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(span.name, 'HTTP GET');
      // console.log(span)
      // assertSpan(span, SpanKind.CLIENT, validations);
    });
  });
});
