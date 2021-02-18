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

import {
  context,
  TraceFlags,
  setSpan,
  setSpanContext,
  getSpan,
  diag,
} from '@opentelemetry/api';
import { AlwaysOnSampler, AlwaysOffSampler } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { Span } from '@opentelemetry/tracing';
import { Resource, TELEMETRY_SDK_RESOURCE } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as path from 'path';
import { ContextManager, ROOT_CONTEXT } from '@opentelemetry/context-base';
import { NodeTracerProvider } from '../src/NodeTracerProvider';

const sleep = (time: number) =>
  new Promise(resolve => {
    return setTimeout(resolve, time);
  });

const INSTALLED_PLUGINS_PATH = path.join(
  __dirname,
  'instrumentation',
  'node_modules'
);

describe('NodeTracerProvider', () => {
  let provider: NodeTracerProvider;
  let contextManager: ContextManager;
  before(() => {
    module.paths.push(INSTALLED_PLUGINS_PATH);
  });

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager();
    context.setGlobalContextManager(contextManager.enable());
    // Set no logger so that sinon doesn't complain about TypeError: Attempted to wrap warn which is already wrapped
    diag.setLogger();
  });

  afterEach(() => {
    // clear require cache
    Object.keys(require.cache).forEach(key => delete require.cache[key]);
    contextManager.disable();
    context.disable();
  });

  describe('constructor', () => {
    beforeEach(() => {
      // Set no logger so that sinon doesn't complain about TypeError: Attempted to wrap warn which is already wrapped
      diag.setLogger();
    });

    it('should construct an instance with required only options', () => {
      provider = new NodeTracerProvider();
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with logger', () => {
      provider = new NodeTracerProvider();
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with sampler', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should show warning when plugins are defined', () => {
      const dummyPlugin1 = {};
      const spyWarn = sinon.spy(diag.getLogger(), 'warn');

      const plugins = [dummyPlugin1];
      const options = { plugins };
      provider = new NodeTracerProvider(options);

      assert.strictEqual(
        spyWarn.args[0][0],
        'plugins options was removed, please use "registerInstrumentations" to load plugins'
      );
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling (AlwaysOffSampler)', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOffSampler(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.strictEqual(span.context().traceFlags, TraceFlags.NONE);
      assert.strictEqual(span.isRecording(), false);
    });

    it('should start a recording span with always sampling (AlwaysOnSampler)', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should sample with AlwaysOnSampler if parent was not sampled', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });

      const sampledParent = provider.getTracer('default').startSpan(
        'not-sampled-span',
        {},
        setSpanContext(ROOT_CONTEXT, {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        })
      );
      assert.ok(sampledParent instanceof Span);
      assert.strictEqual(
        sampledParent.context().traceFlags,
        TraceFlags.SAMPLED
      );
      assert.strictEqual(sampledParent.isRecording(), true);

      const span = provider
        .getTracer('default')
        .startSpan('child-span', {}, setSpan(ROOT_CONTEXT, sampledParent));
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should assign resource to span', () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span') as Span;
      assert.ok(span);
      assert.ok(span.resource instanceof Resource);
      assert.equal(
        span.resource.attributes[TELEMETRY_SDK_RESOURCE.LANGUAGE],
        'nodejs'
      );
    });
  });

  describe('.withSpan()', () => {
    it('should run context with AsyncHooksContextManager context manager', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      context.with(setSpan(context.active(), span), () => {
        assert.deepStrictEqual(getSpan(context.active()), span);
        return done();
      });
      assert.deepStrictEqual(getSpan(context.active()), undefined);
    });

    it('should run context with AsyncHooksContextManager context manager with multiple spans', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      context.with(setSpan(context.active(), span), () => {
        assert.deepStrictEqual(getSpan(context.active()), span);

        const span1 = provider.getTracer('default').startSpan('my-span1');

        context.with(setSpan(context.active(), span1), () => {
          assert.deepStrictEqual(getSpan(context.active()), span1);
          assert.deepStrictEqual(
            span1.context().traceId,
            span.context().traceId
          );
          return done();
        });
      });
      // when span ended.
      // @todo: below check is not running.
      assert.deepStrictEqual(getSpan(context.active()), undefined);
    });

    it('should find correct context with promises', async () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span');
      await context.with(setSpan(context.active(), span), async () => {
        for (let i = 0; i < 3; i++) {
          await sleep(5).then(() => {
            assert.deepStrictEqual(getSpan(context.active()), span);
          });
        }
      });
      assert.deepStrictEqual(getSpan(context.active()), undefined);
    });
  });

  describe('.bind()', () => {
    it('should bind context with AsyncHooksContextManager context manager', done => {
      const provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(getSpan(context.active()), span);
        return done();
      };
      const patchedFn = context.bind(fn, setSpan(context.active(), span));
      return patchedFn();
    });
  });
});
