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
import {
  ALWAYS_SAMPLER,
  BinaryTraceContext,
  HttpTraceContext,
  NEVER_SAMPLER,
  NOOP_SPAN,
  NoopLogger,
} from '@opentelemetry/core';
import { BasicTracer } from '../src/BasicTracer';
import { NoopScopeManager } from '@opentelemetry/scope-base';
import { Span } from '../src/Span';

describe('BasicTracer', () => {
  let tracer: BasicTracer;
  beforeEach(() => {
    tracer = new BasicTracer();
  });

  describe('start', () => {
    it('should start an instance with required only options', () => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should start an instance with binary format', () => {
      tracer.start({
        binaryFormat: new BinaryTraceContext(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should start an instance with http text format', () => {
      tracer.start({
        httpTextFormat: new HttpTraceContext(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should start an instance with logger', () => {
      tracer.start({
        logger: new NoopLogger(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should start an instance with sampler', () => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
        sampler: ALWAYS_SAMPLER,
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should start an instance with default attributes', () => {
      tracer.start({
        defaultAttributes: {
          region: 'eu-west',
          asg: 'my-asg',
        },
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span);
      assert.ok(span instanceof Span);
    });

    it('should start a span with name and options', () => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
      assert.ok(span instanceof Span);
    });

    it('should return a default span with no sampling', () => {
      tracer.start({
        sampler: NEVER_SAMPLER,
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span');
      assert.deepStrictEqual(span, NOOP_SPAN);
    });

    // @todo: implement
    it('should start a Span with always sampling');

    // @todo: implement
    it('should set default attributes on span');
  });

  describe('.getCurrentSpan()', () => {
    it('should return null with NoopScopeManager', () => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
      });
      const currentSpan = tracer.getCurrentSpan();
      assert.deepStrictEqual(currentSpan, null);
    });
  });

  describe('.withSpan()', () => {
    it('should run scope with NoopScopeManager scope manager', done => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        return done();
      });
    });
  });

  describe('.recordSpanData()', () => {
    // @todo: implement
    it('should call exporters with span data');
  });

  describe('.getBinaryFormat()', () => {
    it('should get default binary formatter', () => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer.getBinaryFormat() instanceof BinaryTraceContext);
    });
  });

  describe('.getHttpTextFormat()', () => {
    it('should get default HTTP text formatter', () => {
      tracer.start({
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer.getHttpTextFormat() instanceof HttpTraceContext);
    });
  });
});
