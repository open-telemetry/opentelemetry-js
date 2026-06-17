/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { context, TraceFlags } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { BasicTracerProvider } from '../../src/BasicTracerProvider-shim';

describe('Tracer', () => {
  beforeEach(() => {
    context.setGlobalContextManager(new AsyncLocalStorageContextManager());
  });

  afterEach(() => {
    context.disable();
    delete process.env.OTEL_TRACES_SAMPLER;
    delete process.env.OTEL_TRACES_SAMPLER_ARG;
  });

  it('should sample a trace when OTEL_TRACES_SAMPLER_ARG is unset', () => {
    process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '';
    const tracerProvider = new BasicTracerProvider();
    const tracer = tracerProvider.getTracer('default', '0.0.1');
    const span = tracer.startSpan('my-span');
    const context = span.spanContext();
    assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
    span.end();
  });

  it('should not sample a trace when OTEL_TRACES_SAMPLER_ARG is out of range', () => {
    process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '2';
    const tracerProvider = new BasicTracerProvider();
    const tracer = tracerProvider.getTracer('default', '0.0.1');
    const span = tracer.startSpan('my-span');
    const context = span.spanContext();
    assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
    span.end();
  });

  it('should not sample a trace when OTEL_TRACES_SAMPLER_ARG is 0', () => {
    process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '0';
    const tracerProvider = new BasicTracerProvider();
    const tracer = tracerProvider.getTracer('default', '0.0.1');
    const span = tracer.startSpan('my-span');
    const context = span.spanContext();
    assert.strictEqual(context.traceFlags, TraceFlags.NONE);
    span.end();
  });
});
