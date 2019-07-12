/**
 * Copyright 2019, OpenTelemetry Authors
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
import { BasicTracer } from '../src/BasicTracer';
import { ALWAYS_SAMPLER, NEVER_SAMPLER, NoopLogger } from '@opentelemetry/core';

describe('BasicTracer', () => {
  describe('constructor', () => {
    it('should construct an instance without options', () => {
      const tracer = new BasicTracer();
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with logger', () => {
      const tracer = new BasicTracer({ logger: new NoopLogger() });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with sampler', () => {
      const tracer = new BasicTracer({ sampler: ALWAYS_SAMPLER });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with scope manager');

    it('should construct an instance with propagation');

    it('should construct an instance with default attributes', () => {
      const tracer = new BasicTracer({
        defaultAttributes: {
          region: 'eu-west',
          asg: 'my-asg',
        },
      });
      assert.ok(tracer instanceof BasicTracer);
    });
  });

  describe('#startSpan', () => {
    it('should start a span with name only', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling', () => {
      const tracer = new BasicTracer({ sampler: NEVER_SAMPLER });
      const span = tracer.startSpan('my-span');
      assert.deepStrictEqual(span, BasicTracer.defaultSpan);
    });

    it('should start a Span with always sampling');

    it('should set default attributes on span');
  });

  describe('#getCurrentSpan', () => {
    it('should return default span without scope manager', () => {
      const tracer = new BasicTracer();
      const currentSpan = tracer.getCurrentSpan();
      assert.deepStrictEqual(currentSpan, BasicTracer.defaultSpan);
    });

    it('should return a span with scope manager');
  });

  describe('#withSpan', () => {
    it('should run scope without scope manager', done => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        return done();
      });
    });

    it('should run and set scope with scope manager');
  });

  describe('#recordSpanData', () => {
    it('should call exporters with span data');
  });

  describe('#getBinaryFormat', () => {
    it('should get binary formatter');
  });

  describe('#getHttpTextFormat', () => {
    it('should get HTTP text formatter');
  });
});
