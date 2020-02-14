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

import {
  ALWAYS_SAMPLER,
  BinaryTraceContext,
  HttpTraceContext,
  NEVER_SAMPLER,
  NoopLogger,
  NoRecordingSpan,
  TraceState,
} from '@opentelemetry/core';
import { NoopScopeManager, ScopeManager } from '@opentelemetry/scope-base';
import { TraceFlags } from '@opentelemetry/api';
import * as assert from 'assert';
import { BasicTracerProvider, Span } from '../src';

describe('BasicTracerProvider', () => {
  describe('constructor', () => {
    it('should construct an instance without any options', () => {
      const provider = new BasicTracerProvider();
      assert.ok(provider instanceof BasicTracerProvider);
    });

    it('should construct an instance with binary format', () => {
      const provider = new BasicTracerProvider({
        binaryFormat: new BinaryTraceContext(),
      });
      assert.ok(provider instanceof BasicTracerProvider);
    });

    it('should construct an instance with http text format', () => {
      const provider = new BasicTracerProvider({
        httpTextFormat: new HttpTraceContext(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(provider instanceof BasicTracerProvider);
    });

    it('should construct an instance with logger', () => {
      const provider = new BasicTracerProvider({
        logger: new NoopLogger(),
        scopeManager: new NoopScopeManager(),
      });
      assert.ok(provider instanceof BasicTracerProvider);
    });

    it('should construct an instance with sampler', () => {
      const provider = new BasicTracerProvider({
        scopeManager: new NoopScopeManager(),
        sampler: ALWAYS_SAMPLER,
      });
      assert.ok(provider instanceof BasicTracerProvider);
    });

    it('should construct an instance with default trace params', () => {
      const tracer = new BasicTracerProvider({
        scopeManager: new NoopScopeManager(),
      }).getTracer('default');
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 32,
        numberOfEventsPerSpan: 128,
        numberOfLinksPerSpan: 32,
      });
    });

    it('should construct an instance with customized numberOfAttributesPerSpan trace params', () => {
      const tracer = new BasicTracerProvider({
        scopeManager: new NoopScopeManager(),
        traceParams: {
          numberOfAttributesPerSpan: 100,
        },
      }).getTracer('default');
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 100,
        numberOfEventsPerSpan: 128,
        numberOfLinksPerSpan: 32,
      });
    });

    it('should construct an instance with customized numberOfEventsPerSpan trace params', () => {
      const tracer = new BasicTracerProvider({
        scopeManager: new NoopScopeManager(),
        traceParams: {
          numberOfEventsPerSpan: 300,
        },
      }).getTracer('default');
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 32,
        numberOfEventsPerSpan: 300,
        numberOfLinksPerSpan: 32,
      });
    });

    it('should construct an instance with customized numberOfLinksPerSpan trace params', () => {
      const tracer = new BasicTracerProvider({
        scopeManager: new NoopScopeManager(),
        traceParams: {
          numberOfLinksPerSpan: 10,
        },
      }).getTracer('default');
      assert.deepStrictEqual(tracer.getActiveTraceParams(), {
        numberOfAttributesPerSpan: 32,
        numberOfEventsPerSpan: 128,
        numberOfLinksPerSpan: 10,
      });
    });

    it('should construct an instance with default attributes', () => {
      const tracer = new BasicTracerProvider({
        defaultAttributes: {
          region: 'eu-west',
          asg: 'my-asg',
        },
      });
      assert.ok(tracer instanceof BasicTracerProvider);
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(span);
      assert.ok(span instanceof Span);
    });

    it('should start a span with name and options', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.strictEqual(context.traceId.byteLength, 16);
      assert.strictEqual(context.spanId.byteLength, 8);
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
      span.end();
    });

    it('should start a span with defaultAttributes and spanoptions->attributes', () => {
      const tracer = new BasicTracerProvider({
        defaultAttributes: { foo: 'bar' },
      }).getTracer('default');
      const span = tracer.startSpan('my-span', {
        attributes: { foo: 'foo', bar: 'bar' },
      }) as Span;
      assert.deepStrictEqual(span.attributes, { bar: 'bar', foo: 'foo' });
      span.end();
    });

    it('should start a span with defaultAttributes and undefined spanoptions->attributes', () => {
      const tracer = new BasicTracerProvider({
        defaultAttributes: { foo: 'bar' },
      }).getTracer('default');
      const span = tracer.startSpan('my-span', {}) as Span;
      assert.deepStrictEqual(span.attributes, { foo: 'bar' });
      span.end();
    });

    it('should start a span with spanoptions->attributes', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {
        attributes: { foo: 'foo', bar: 'bar' },
      }) as Span;
      assert.deepStrictEqual(span.attributes, { foo: 'foo', bar: 'bar' });
      span.end();
    });

    it('should start a span with name and parent spancontext', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const state = new TraceState('a=1,b=2');
      const span = tracer.startSpan('my-span', {
        parent: {
          traceId: new Uint8Array([
            0xd4,
            0xcd,
            0xa9,
            0x5b,
            0x65,
            0x2f,
            0x4a,
            0x15,
            0x92,
            0xb4,
            0x49,
            0xd5,
            0x92,
            0x9f,
            0xda,
            0x1b,
          ]),
          spanId: new Uint8Array([
            0x6e,
            0x0c,
            0x63,
            0x25,
            0x7d,
            0xe3,
            0x4c,
            0x92,
          ]),
          traceState: state,
        },
      });
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.deepStrictEqual(
        context.traceId,
        new Uint8Array([
          0xd4,
          0xcd,
          0xa9,
          0x5b,
          0x65,
          0x2f,
          0x4a,
          0x15,
          0x92,
          0xb4,
          0x49,
          0xd5,
          0x92,
          0x9f,
          0xda,
          0x1b,
        ])
      );
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, state);
      span.end();
    });

    it('should start a span with name and parent span', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
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
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {
        parent: ('invalid-parent' as unknown) as undefined,
      }) as Span;
      assert.deepStrictEqual(span.parentSpanId, undefined);
    });

    it('should start a span with name and with invalid spancontext', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {
        parent: { traceId: new Uint8Array(16), spanId: new Uint8Array(8) },
      });
      assert.ok(span instanceof Span);
      const context = span.context();
      assert.strictEqual(context.traceId.byteLength, 16);
      assert.strictEqual(context.spanId.byteLength, 8);
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
    });

    it('should return a no recording span when never sampling', () => {
      const tracer = new BasicTracerProvider({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      }).getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      const context = span.context();
      assert.strictEqual(context.traceId.byteLength, 16);
      assert.strictEqual(context.spanId.byteLength, 8);
      assert.strictEqual(context.traceFlags, TraceFlags.UNSAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
      span.end();
    });

    it('should create real span when not sampled but recording events true', () => {
      const tracer = new BasicTracerProvider({
        sampler: NEVER_SAMPLER,
      }).getTracer('default');
      const span = tracer.startSpan('my-span', { isRecording: true });
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should not create real span when not sampled and recording events false', () => {
      const tracer = new BasicTracerProvider({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      }).getTracer('default');
      const span = tracer.startSpan('my-span', { isRecording: false });
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecording(), false);
    });

    it('should not create real span when not sampled and no recording events configured', () => {
      const tracer = new BasicTracerProvider({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      }).getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecording(), false);
    });

    it('should create real span when sampled and recording events true', () => {
      const tracer = new BasicTracerProvider({
        sampler: ALWAYS_SAMPLER,
        scopeManager: new NoopScopeManager(),
      }).getTracer('default');
      const span = tracer.startSpan('my-span', { isRecording: true });
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should set default attributes on span', () => {
      const defaultAttributes = {
        foo: 'bar',
      };
      const tracer = new BasicTracerProvider({
        scopeManager: new NoopScopeManager(),
        defaultAttributes,
      }).getTracer('default');

      const span = tracer.startSpan('my-span') as Span;
      assert.ok(span instanceof Span);
      assert.deepStrictEqual(span.attributes, defaultAttributes);
    });
  });

  describe('.getCurrentSpan()', () => {
    it('should return null with NoopScopeManager', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const currentSpan = tracer.getCurrentSpan();
      assert.deepStrictEqual(currentSpan, undefined);
    });

    it('should return current span when it exists', () => {
      const tracer = new BasicTracerProvider({
        scopeManager: {
          active: () => 'foo',
        } as ScopeManager,
      }).getTracer('default');
      assert.deepStrictEqual(tracer.getCurrentSpan(), 'foo');
    });
  });

  describe('.withSpan()', () => {
    it('should run scope with NoopScopeManager scope manager', done => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), undefined);
        return done();
      });
    });
  });

  describe('.bind()', () => {
    it('should bind scope with NoopScopeManager scope manager', done => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), undefined);
        return done();
      };
      const patchedFn = tracer.bind(fn, span);
      return patchedFn();
    });
  });

  describe('.getBinaryFormat()', () => {
    it('should get default binary formatter', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      assert.ok(tracer.getBinaryFormat() instanceof BinaryTraceContext);
    });
  });

  describe('.getHttpTextFormat()', () => {
    it('should get default HTTP text formatter', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      assert.ok(tracer.getHttpTextFormat() instanceof HttpTraceContext);
    });
  });
});
