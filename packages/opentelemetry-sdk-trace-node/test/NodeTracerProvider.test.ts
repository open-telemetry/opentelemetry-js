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
  context,
  ContextManager,
  ROOT_CONTEXT,
  trace,
  TraceFlags,
} from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  Span,
} from '@opentelemetry/sdk-trace-base';
import { ATTR_TELEMETRY_SDK_LANGUAGE } from '@opentelemetry/semantic-conventions';

import { NodeTracerProvider } from '../src/NodeTracerProvider';

const sleep = (time: number) =>
  new Promise(resolve => {
    return setTimeout(resolve, time);
  });

describe('NodeTracerProvider', function () {
  let provider: NodeTracerProvider;
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager();
    context.setGlobalContextManager(contextManager.enable());
  });

  afterEach(() => {
    contextManager.disable();
    context.disable();
  });

  describe('constructor', function () {
    it('should construct an instance with required only options', function () {
      provider = new NodeTracerProvider();
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with logger', function () {
      provider = new NodeTracerProvider();
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with sampler', function () {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });
      assert.ok(provider instanceof NodeTracerProvider);
    });
  });

  describe('.startSpan()', function () {
    it('should start a span with name only', function () {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', function () {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling (AlwaysOffSampler)', function () {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOffSampler(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.NONE);
      assert.strictEqual(span.isRecording(), false);
    });

    it('should start a recording span with always sampling (AlwaysOnSampler)', function () {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should sample with AlwaysOnSampler if parent was not sampled', function () {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });

      const sampledParent = provider.getTracer('default').startSpan(
        'not-sampled-span',
        {},
        trace.setSpanContext(ROOT_CONTEXT, {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        })
      );
      assert.strictEqual(
        sampledParent.spanContext().traceFlags,
        TraceFlags.SAMPLED
      );
      assert.strictEqual(sampledParent.isRecording(), true);

      const span = provider
        .getTracer('default')
        .startSpan(
          'child-span',
          {},
          trace.setSpan(ROOT_CONTEXT, sampledParent)
        );
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should assign resource to span', function () {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span') as Span;
      assert.ok(span);
      assert.ok(span.resource);
      assert.equal(
        span.resource.attributes[ATTR_TELEMETRY_SDK_LANGUAGE],
        'nodejs'
      );
    });
  });

  describe('.withSpan()', function () {
    it('should run context with AsyncHooksContextManager context manager', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      context.with(trace.setSpan(context.active(), span), () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), span);
        return done();
      });
      assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
    });

    it('should run context with AsyncHooksContextManager context manager with multiple spans', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      context.with(trace.setSpan(context.active(), span), () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), span);

        const span1 = provider.getTracer('default').startSpan('my-span1');

        context.with(trace.setSpan(context.active(), span1), () => {
          assert.deepStrictEqual(trace.getSpan(context.active()), span1);
          assert.deepStrictEqual(
            span1.spanContext().traceId,
            span.spanContext().traceId
          );
          return done();
        });
      });
      // when span ended.
      // @todo: below check is not running.
      assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
    });

    it('should find correct context with promises', async function () {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span');
      await context.with(trace.setSpan(context.active(), span), async () => {
        for (let i = 0; i < 3; i++) {
          await sleep(5).then(() => {
            assert.deepStrictEqual(trace.getSpan(context.active()), span);
          });
        }
      });
      assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
    });
  });

  describe('.bind()', function () {
    it('should bind context with AsyncHooksContextManager context manager', done => {
      const provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), span);
        return done();
      };
      const patchedFn = context.bind(trace.setSpan(context.active(), span), fn);
      return patchedFn();
    });
  });
});
