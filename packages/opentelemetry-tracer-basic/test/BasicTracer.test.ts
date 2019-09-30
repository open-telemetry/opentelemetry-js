/*!
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
import { TraceFlags } from '@opentelemetry/types';
import { BasicTracer } from '../src/BasicTracer';
import { NoopScopeManager, ScopeManager } from '@opentelemetry/scope-base';
import { Span } from '../src/Span';

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

    it('should construct an instance with default trace params', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
      });
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 32,
        numberOfEventsPerSpan: 128,
        numberOfLinksPerSpan: 32,
      });
    });

    it('should construct an instance with customized numberOfAttributesPerSpan trace params', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
        traceParams: {
          numberOfAttributesPerSpan: 100,
        },
      });
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 100,
        numberOfEventsPerSpan: 128,
        numberOfLinksPerSpan: 32,
      });
    });

    it('should construct an instance with customized numberOfEventsPerSpan trace params', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
        traceParams: {
          numberOfEventsPerSpan: 300,
        },
      });
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 32,
        numberOfEventsPerSpan: 300,
        numberOfLinksPerSpan: 32,
      });
    });

    it('should construct an instance with customized numberOfLinksPerSpan trace params', () => {
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
        traceParams: {
          numberOfLinksPerSpan: 10,
        },
      });
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 32,
        numberOfEventsPerSpan: 128,
        numberOfLinksPerSpan: 10,
      });
    });

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

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span');
      assert.ok(span);
      assert.ok(span instanceof Span);
    });

    it('should start a span with name and options', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
      span.end();
    });

    it('should start a span with defaultAttributes and spanoptions->attributes', () => {
      const tracer = new BasicTracer({
        defaultAttributes: { foo: 'bar' },
      });
      const span = tracer.startSpan('my-span', {
        attributes: { foo: 'foo', bar: 'bar' },
      }) as Span;
      assert.deepStrictEqual(span.attributes, { bar: 'bar', foo: 'foo' });
      span.end();
    });

    it('should start a span with defaultAttributes and undefined spanoptions->attributes', () => {
      const tracer = new BasicTracer({
        defaultAttributes: { foo: 'bar' },
      });
      const span = tracer.startSpan('my-span', {}) as Span;
      assert.deepStrictEqual(span.attributes, { foo: 'bar' });
      span.end();
    });

    it('should start a span with spanoptions->attributes', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span', {
        attributes: { foo: 'foo', bar: 'bar' },
      }) as Span;
      assert.deepStrictEqual(span.attributes, { foo: 'foo', bar: 'bar' });
      span.end();
    });

    it('should start a span with name and parent spancontext', () => {
      const tracer = new BasicTracer();
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
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, state);
      span.end();
    });

    it('should start a span with name and parent span', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span');
      const childSpan = tracer.startSpan('child-span', {
        parent: span,
      });
      const context = childSpan.context();
      assert.strictEqual(context.traceId, span.context().traceId);
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      span.end();
      childSpan.end();
    });

    it('should start a span with name and with invalid parent span', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span', {
        parent: ('invalid-parent' as unknown) as undefined,
      }) as Span;
      assert.deepStrictEqual(span.parentSpanId, undefined);
    });

    it('should start a span with name and with invalid spancontext', () => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span', {
        parent: { traceId: '0', spanId: '0' },
      });
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
    });

    it('should return a no recording span when never sampling', () => {
      const tracer = new BasicTracer({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      const context = span.context();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceFlags, TraceFlags.UNSAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
      span.end();
    });

    it('should create real span when not sampled but recording events true', () => {
      const tracer = new BasicTracer({
        sampler: NEVER_SAMPLER,
      });
      const span = tracer.startSpan('my-span', { isRecordingEvents: true });
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecordingEvents(), true);
    });

    it('should not create real span when not sampled and recording events false', () => {
      const tracer = new BasicTracer({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span', { isRecordingEvents: false });
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecordingEvents(), false);
    });

    it('should not create real span when not sampled and no recording events configured', () => {
      const tracer = new BasicTracer({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecordingEvents(), false);
    });

    it('should create real span when sampled and recording events true', () => {
      const tracer = new BasicTracer({
        sampler: ALWAYS_SAMPLER,
        scopeManager: new NoopScopeManager(),
      });
      const span = tracer.startSpan('my-span', { isRecordingEvents: true });
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecordingEvents(), true);
    });

    it('should set default attributes on span', () => {
      const defaultAttributes = {
        foo: 'bar',
      };
      const tracer = new BasicTracer({
        scopeManager: new NoopScopeManager(),
        defaultAttributes,
      });

      const span = tracer.startSpan('my-span') as Span;
      assert.ok(span instanceof Span);
      assert.deepStrictEqual(span.attributes, defaultAttributes);
    });
  });

  describe('.getCurrentSpan()', () => {
    it('should return null with NoopScopeManager', () => {
      const tracer = new BasicTracer();
      const currentSpan = tracer.getCurrentSpan();
      assert.deepStrictEqual(currentSpan, null);
    });

    it('should return current span when it exists', () => {
      const tracer = new BasicTracer({
        scopeManager: {
          active: () => 'foo',
        } as ScopeManager,
      });
      assert.deepStrictEqual(tracer.getCurrentSpan(), 'foo');
    });
  });

  describe('.withSpan()', () => {
    it('should run scope with NoopScopeManager scope manager', done => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), null);
        return done();
      });
    });
  });

  describe('.bind()', () => {
    it('should bind scope with NoopScopeManager scope manager', done => {
      const tracer = new BasicTracer();
      const span = tracer.startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), null);
        return done();
      };
      const patchedFn = tracer.bind(fn, span);
      return patchedFn();
    });
  });

  describe('.getBinaryFormat()', () => {
    it('should get default binary formatter', () => {
      const tracer = new BasicTracer();
      assert.ok(tracer.getBinaryFormat() instanceof BinaryTraceContext);
    });
  });

  describe('.getHttpTextFormat()', () => {
    it('should get default HTTP text formatter', () => {
      const tracer = new BasicTracer();
      assert.ok(tracer.getHttpTextFormat() instanceof HttpTraceContext);
    });
  });
});
