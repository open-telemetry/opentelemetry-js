/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TraceFlags, context, trace } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { BasicTracerProvider } from '../../src';
import type { Tracer } from '../../src/Tracer';
import { TestStackContextManager } from '../common/export/TestStackContextManager';

describe('BasicTracerProvider - Node', () => {
  beforeEach(() => {
    // to avoid actually registering the TraceProvider and leaking env to other tests
    sinon.stub(trace, 'setGlobalTracerProvider');
    context.disable();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    describe('sampler', () => {
      describe('when sampler is defined via env', () => {
        beforeEach(() => {
          // ???
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
          const tracer = new BasicTracerProvider().getTracer('default');
          const span = tracer.startSpan('my-span');
          const context = span.spanContext();
          assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
          span.end();
        });
      });

      it('should not sample a trace when OTEL_TRACES_SAMPLER_ARG is out of range', () => {
        process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
        process.env.OTEL_TRACES_SAMPLER_ARG = '2';
        const tracer = new BasicTracerProvider().getTracer('default');
        const span = tracer.startSpan('my-span');
        const context = span.spanContext();
        assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
        span.end();
      });

      it('should not sample a trace when OTEL_TRACES_SAMPLER_ARG is 0', () => {
        process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
        process.env.OTEL_TRACES_SAMPLER_ARG = '0';
        const tracer = new BasicTracerProvider().getTracer('default');
        const span = tracer.startSpan('my-span');
        const context = span.spanContext();
        assert.strictEqual(context.traceFlags, TraceFlags.NONE);
        span.end();
      });
    });

    describe('spanLimits', () => {
      describe('when attribute value length limit is defined via env', () => {
        afterEach(function () {
          delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
          delete process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        });

        it('should have span attribute value length limit value same as general limit value', () => {
          process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '125';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 125);
        });
        it('should have span attribute value length limits as defined in env', () => {
          process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '125';
          process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT = '109';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 109);
        });
      });

      describe('when attribute count limit is defined via env', () => {
        afterEach(function () {
          delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
          delete process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT;
        });

        it('should have span attribute count limit value same as general limit value', () => {
          process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '20';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeCountLimit, 20);
        });
        it('should have span attribute count limits as defined in env', () => {
          process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '20';
          process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT = '35';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeCountLimit, 35);
        });
      });
    });
  });
});
