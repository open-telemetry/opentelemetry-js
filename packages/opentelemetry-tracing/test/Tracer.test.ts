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
import {
  NoopSpan,
  Sampler,
  SamplingDecision,
  Context,
  NOOP_SPAN,
  TraceFlags,
} from '@opentelemetry/api';
import { BasicTracerProvider, Tracer, Span } from '../src';
import {
  InstrumentationLibrary,
  NoopLogger,
  AlwaysOnSampler,
  AlwaysOffSampler,
  suppressInstrumentation,
} from '@opentelemetry/core';

describe('Tracer', () => {
  const tracerProvider = new BasicTracerProvider({
    logger: new NoopLogger(),
  });

  class TestSampler implements Sampler {
    shouldSample() {
      return {
        decision: SamplingDecision.RECORD_AND_SAMPLED,
        attributes: {
          testAttribute: 'foobar',
        },
      };
    }
  }

  afterEach(() => {
    if (typeof process !== 'undefined' && process.release.name === 'node') {
      delete process.env.OTEL_SAMPLING_PROBABILITY;
    }
  });

  it('should create a Tracer instance', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider
    );
    assert.ok(tracer instanceof Tracer);
  });

  it('should use an AlwaysOnSampler by default', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider
    );
    assert.strictEqual(tracer['_sampler'].toString(), 'AlwaysOnSampler');
  });

  it('should respect NO_RECORD sampling result', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new AlwaysOffSampler() },
      tracerProvider
    );
    const span = tracer.startSpan('span1');
    assert.ok(span instanceof NoopSpan);
    span.end();
  });

  it('should respect RECORD_AND_SAMPLE sampling result', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new AlwaysOnSampler() },
      tracerProvider
    );
    const span = tracer.startSpan('span2');
    assert.ok(!(span instanceof NoopSpan));
    span.end();
  });

  it('should start a span with attributes in sampling result', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new TestSampler() },
      tracerProvider
    );
    const span = tracer.startSpan('span3');
    assert.strictEqual((span as Span).attributes.testAttribute, 'foobar');
    span.end();
  });

  it('should have an instrumentationLibrary', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider
    );

    const lib: InstrumentationLibrary = tracer.instrumentationLibrary;

    assert.strictEqual(lib.name, 'default');
    assert.strictEqual(lib.version, '0.0.1');
  });

  describe('when suppressInstrumentation true', () => {
    const context = suppressInstrumentation(Context.ROOT_CONTEXT);

    it('should return cached no-op span ', done => {
      const tracer = new Tracer(
        { name: 'default', version: '0.0.1' },
        { sampler: new TestSampler() },
        tracerProvider
      );

      const span = tracer.startSpan('span3', undefined, context);

      assert.equal(span, NOOP_SPAN);
      span.end();

      done();
    });
  });

  if (typeof process !== 'undefined' && process.release.name === 'node') {
    it('should sample a trace when OTEL_SAMPLING_PROBABILITY is invalid', () => {
      process.env.OTEL_SAMPLING_PROBABILITY = 'invalid value';
      const tracer = new Tracer(
        { name: 'default', version: '0.0.1' },
        {},
        tracerProvider
      );
      const span = tracer.startSpan('my-span');
      const context = span.context();
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      span.end();
    });
  }

  if (typeof process !== 'undefined' && process.release.name === 'node') {
    it('should sample a trace when OTEL_SAMPLING_PROBABILITY is greater than 1', () => {
      process.env.OTEL_SAMPLING_PROBABILITY = '2';
      const tracer = new Tracer(
        { name: 'default', version: '0.0.1' },
        {},
        tracerProvider
      );
      const span = tracer.startSpan('my-span');
      const context = span.context();
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      span.end();
    });
  }

  if (typeof process !== 'undefined' && process.release.name === 'node') {
    it('should not sample a trace when OTEL_SAMPLING_PROBABILITY is 0', () => {
      process.env.OTEL_SAMPLING_PROBABILITY = '0';
      const tracer = new Tracer(
        { name: 'default', version: '0.0.1' },
        {},
        tracerProvider
      );
      const span = tracer.startSpan('my-span');
      const context = span.context();
      assert.strictEqual(context.traceFlags, TraceFlags.NONE);
      span.end();
    });
  }

  if (typeof process !== 'undefined' && process.release.name === 'node') {
    it('should not sample a trace when OTEL_SAMPLING_PROBABILITY is less than 0', () => {
      process.env.OTEL_SAMPLING_PROBABILITY = '-1';
      const tracer = new Tracer(
        { name: 'default', version: '0.0.1' },
        {},
        tracerProvider
      );
      const span = tracer.startSpan('my-span');
      const context = span.context();
      assert.strictEqual(context.traceFlags, TraceFlags.NONE);
      span.end();
    });
  }
});
