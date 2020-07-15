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
import { NoopSpan, Sampler, SamplingDecision } from '@opentelemetry/api';
import { BasicTracerProvider, Tracer, Span } from '../src';
import {
  InstrumentationLibrary,
  NoopLogger,
  AlwaysOnSampler,
  AlwaysOffSampler,
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

  it('should create a Tracer instance', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider
    );
    assert.ok(tracer instanceof Tracer);
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
});
