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
  NoopLogger,
  TraceState,
  NoRecordingSpan,
} from '@opentelemetry/core';
import { BasicTracer } from '../src/BasicTracer';
import { NoopScopeManager } from '@opentelemetry/scope-base';
import { Span } from '../src/Span';
import { TraceOptions } from '@opentelemetry/types';

describe('BasicTracer', () => {
  describe('constructor', () => {
    it('should construct an instance with required only options', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with binary format', () => {
      const tracer = new BasicTracer({
        binaryFormat: new BinaryTraceContext(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with http text format', () => {
      const tracer = new BasicTracer({
        httpTextFormat: new HttpTraceContext(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with logger', () => {
      const tracer = new BasicTracer({
        logger: new NoopLogger(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with sampler', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
        sampler: ALWAYS_SAMPLER,
      });
      assert.ok(tracer instanceof BasicTracer);
    });

    it('should construct an instance with default attributes', () => {
      const tracer = new BasicTracer({
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
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span);
      assert.ok(span instanceof Span);
    });

    it('should start a span with name and options', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceOptions, TraceOptions.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
    });

    it('should start a span with name and parent spancontext', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      const state = new TraceState('a=1,b=2');
      const span = tracer.startSpan('my-span', {
        parent: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceState: state,
        },
      });
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.strictEqual(context.traceId, 'd4cda95b652f4a1592b449d5929fda1b');
      assert.strictEqual(context.traceOptions, TraceOptions.SAMPLED);
      assert.deepStrictEqual(context.traceState, state);
    });

    it('should start a span with name and parent span', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span');
      const childSpan = tracer.startSpan('child-span', {
        parent: span,
      });
      const context = childSpan.context();
      assert.strictEqual(context.traceId, span.context().traceId);
      assert.strictEqual(context.traceOptions, TraceOptions.SAMPLED);
    });

    it('should start a span with name and with invalid spancontext', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span', {
        parent: { traceId: '0', spanId: '0' },
      });
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceOptions, TraceOptions.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
    });

    it('should return a no recording span when never sampling', () => {
      const tracer = new BasicTracer({
        sampler: NEVER_SAMPLER,
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      const context = span.context();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceOptions, TraceOptions.UNSAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
    });

    // @todo: implement
    it('should start a Span with always sampling');

    // @todo: implement
    it('should set default attributes on span');
  });

  describe('.getCurrentSpan()', () => {
    it('should return null with NoopScopeManager', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      const currentSpan = tracer.getCurrentSpan();
      assert.deepStrictEqual(currentSpan, null);
    });
  });

  describe('.withSpan()', () => {
    it('should run scope with NoopScopeManager scope manager', done => {
      const tracer = new BasicTracer({
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
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer.getBinaryFormat() instanceof BinaryTraceContext);
    });
  });

  describe('.getHttpTextFormat()', () => {
    it('should get default HTTP text formatter', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(tracer.getHttpTextFormat() instanceof HttpTraceContext);
    });
  });
});
