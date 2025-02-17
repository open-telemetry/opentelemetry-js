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
import { context, TraceFlags } from '@opentelemetry/api';
import * as assert from 'assert';
import { BasicTracerProvider } from '../../src';
import { TestStackContextManager } from '../common/export/TestStackContextManager';
import { Tracer } from '../../src/Tracer';

describe('Tracer', () => {
  const tracerProvider = new BasicTracerProvider();

  beforeEach(() => {
    const contextManager = new TestStackContextManager().enable();
    context.setGlobalContextManager(contextManager);
  });

  afterEach(() => {
    context.disable();
    delete process.env.OTEL_TRACES_SAMPLER;
    delete process.env.OTEL_TRACES_SAMPLER_ARG;
  });

  it('should sample a trace when OTEL_TRACES_SAMPLER_ARG is unset', () => {
    process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '';
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan('my-span');
    const context = span.spanContext();
    assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
    span.end();
  });

  it('should not sample a trace when OTEL_TRACES_SAMPLER_ARG is out of range', () => {
    process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '2';
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan('my-span');
    const context = span.spanContext();
    assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
    span.end();
  });

  it('should not sample a trace when OTEL_TRACES_SAMPLER_ARG is 0', () => {
    process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '0';
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan('my-span');
    const context = span.spanContext();
    assert.strictEqual(context.traceFlags, TraceFlags.NONE);
    span.end();
  });
});
