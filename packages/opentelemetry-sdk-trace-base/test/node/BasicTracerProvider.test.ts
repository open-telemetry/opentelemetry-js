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

import { context, trace } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { BasicTracerProvider } from '../../src';
import { Tracer } from '../../src/Tracer';

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
        it('should have general attribute value length limits value as defined with env', () => {
          process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '115';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, 115);
          delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        });
        it('should have span attribute value length limit value same as general limit value', () => {
          process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '125';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const generalLimits = tracer.getGeneralLimits();
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, 125);
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 125);
          delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        });
        it('should have span and general attribute value length limits as defined in env', () => {
          process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '125';
          process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT = '109';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, 125);
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 109);
          delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
          delete process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        });
      });

      describe('when attribute count limit is defined via env', () => {
        it('should general attribute count limit as defined with env', () => {
          process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '25';
          const tracer = new BasicTracerProvider({}).getTracer(
            'default'
          ) as Tracer;
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeCountLimit, 25);
          delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
        });
        it('should have span attribute count limit value same as general limit value', () => {
          process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '20';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const generalLimits = tracer.getGeneralLimits();
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(generalLimits.attributeCountLimit, 20);
          assert.strictEqual(spanLimits.attributeCountLimit, 20);
          delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
        });
        it('should have span and general attribute count limits as defined in env', () => {
          process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '20';
          process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT = '35';
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeCountLimit, 20);
          assert.strictEqual(spanLimits.attributeCountLimit, 35);
          delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
          delete process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT;
        });
      });
    });
  });
});
