/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
