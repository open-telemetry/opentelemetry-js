/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Attributes,
  Context,
  ContextManager,
  Link,
  SpanKind,
} from '@opentelemetry/api';
import { context } from '@opentelemetry/api';
import type { Sampler, SamplingResult } from '@opentelemetry/sdk-trace-base';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SamplingDecision,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { HttpInstrumentation } from '../../src/http';
import { httpRequest } from '../utils/httpRequest';

class CapturingSampler implements Sampler {
  public capturedAttributes: Attributes | undefined;

  shouldSample(
    _context: Context,
    _traceId: string,
    _spanName: string,
    _spanKind: SpanKind,
    attributes: Attributes,
    _links: Link[]
  ): SamplingResult {
    this.capturedAttributes = attributes;
    return { decision: SamplingDecision.RECORD_AND_SAMPLED };
  }

  toString(): string {
    return 'CapturingSampler';
  }
}

const sampler = new CapturingSampler();

const instrumentation = new HttpInstrumentation({
  headersToSpanAttributes: {
    server: { requestHeaders: ['x-custom-header'] },
  },
});
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

const memoryExporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider({
  sampler,
  spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
});
instrumentation.setTracerProvider(provider);

describe('HttpInstrumentation sampler integration', () => {
  const PORT = 22399;
  let server: http.Server;
  let contextManager: ContextManager;

  before(async () => {
    instrumentation.enable();
    server = http.createServer((_req, res) => {
      res.writeHead(200);
      res.end();
    });
    await new Promise<void>(resolve => server.listen(PORT, resolve));
  });

  after(done => {
    instrumentation.disable();
    server.close(done);
  });

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager();
    context.setGlobalContextManager(contextManager);
    memoryExporter.reset();
    sampler.capturedAttributes = undefined;
  });

  afterEach(() => {
    context.disable();
  });

  it('provides http.request.header.* attributes to shouldSample', async () => {
    await httpRequest.get(`http://localhost:${PORT}/`, {
      headers: { 'x-custom-header': 'test-value' },
    });

    assert.deepStrictEqual(
      sampler.capturedAttributes?.['http.request.header.x_custom_header'],
      ['test-value']
    );
  });
});
