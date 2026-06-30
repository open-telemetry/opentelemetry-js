/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Tracer as ApiTracer } from '@opentelemetry/api';
import { context, trace } from '@opentelemetry/api';
import type { SpanLimits } from '@opentelemetry/sdk-trace';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { BasicTracerProvider } from '../../src/BasicTracerProvider-shim';

function cheatSpanLimitsFromTracer(tracer: ApiTracer): SpanLimits {
  return (tracer as any)._spanLimits;
}

describe('BasicTracerProvider - Node', () => {
  beforeEach(() => {
    // to avoid actually registering the TracerProvider and leaking env to other tests
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

        it('should have attribute value length limits value as defined with env', () => {
          process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '115';
          const tracer = new BasicTracerProvider().getTracer('default');
          const spanLimits = cheatSpanLimitsFromTracer(tracer);
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 115);
        });
        it('should have span and general attribute value length limits as defined in env', () => {
          process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '125';
          process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT = '109';
          const tracer = new BasicTracerProvider().getTracer('default');
          const spanLimits = cheatSpanLimitsFromTracer(tracer);
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 109);
        });
      });

      describe('when attribute count limit is defined via env', () => {
        afterEach(function () {
          delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
          delete process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT;
        });

        it('should general attribute count limit as defined with env', () => {
          process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '25';
          const tracer = new BasicTracerProvider({}).getTracer('default');
          const spanLimits = cheatSpanLimitsFromTracer(tracer);
          assert.strictEqual(spanLimits.attributeCountLimit, 25);
        });
        it('should have span and general attribute count limits as defined in env', () => {
          process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '20';
          process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT = '35';
          const tracer = new BasicTracerProvider().getTracer('default');
          const spanLimits = cheatSpanLimitsFromTracer(tracer);
          assert.strictEqual(spanLimits.attributeCountLimit, 35);
        });
      });
    });
  });
});
