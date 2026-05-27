/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { context, trace } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { BasicTracerProvider } from '../../src';
import type { Tracer } from '../../src/Tracer';

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
