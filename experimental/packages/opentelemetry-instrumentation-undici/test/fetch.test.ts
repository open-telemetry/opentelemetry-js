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

import { SpanKind, context, propagation } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import {
  InMemorySpanExporter,
  ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { UndiciInstrumentation } from '../src/undici';

import { MockServer } from './utils/mock-server';

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

// Simpler way to skip the while suite
// also `this` is not providing the skpi method inside tests
const shouldTest = typeof globalThis.fetch === 'function'
const describeFn = shouldTest ? describe : describe.skip;

describeFn('UndiciInstrumentation `fetch` tests', () => {
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
    // TODO: mock propagation and test it
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

      const fetchUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      const response = await fetch(fetchUrl);

      spans = memoryExporter.getFinishedSpans();
      const span = spans[0];

      assert.ok(span);
      assert.strictEqual(spans.length, 1);
      assertSpanAttribs(span, 'HTTP GET', {
        // TODO: I guess we want to have parity with HTTP insturmentation
        // - there are missing attributes
        // - also check if these current values make sense
        [SemanticAttributes.HTTP_URL]: `${protocol}://${hostname}:${mockServer.port}`,
        [SemanticAttributes.HTTP_METHOD]: 'GET',
        [SemanticAttributes.HTTP_STATUS_CODE]: response.status,
        [SemanticAttributes.HTTP_TARGET]: '/?query=test',
      });
    });
  });
});

function assertSpanAttribs(
  span: ReadableSpan,
  name: string,
  attribs: Record<string, any>
) {
  assert.strictEqual(span.spanContext().traceId.length, 32);
  assert.strictEqual(span.spanContext().spanId.length, 16);
  assert.strictEqual(span.kind, SpanKind.CLIENT);
  assert.strictEqual(span.name, name);

  for (const [key, value] of Object.entries(attribs)) {
    assert.strictEqual(
      span.attributes[key],
      value,
      `expected value "${value}" but got "${span.attributes[key]}" for attribute "${key}" `
    );
  }
}
