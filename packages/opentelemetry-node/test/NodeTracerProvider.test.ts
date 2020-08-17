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

import { context, TraceFlags } from '@opentelemetry/api';
import {
  AlwaysOnSampler,
  AlwaysOffSampler,
  NoopLogger,
  NoRecordingSpan,
  setActiveSpan,
} from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { Span } from '@opentelemetry/tracing';
import { Resource, TELEMETRY_SDK_RESOURCE } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as path from 'path';
import { ContextManager } from '@opentelemetry/context-base';
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
  });

  afterEach(() => {
    // clear require cache
    Object.keys(require.cache).forEach(key => delete require.cache[key]);
    provider.stop();
    contextManager.disable();
    context.disable();
  });

  describe('constructor', () => {
    it('should construct an instance with required only options', () => {
      provider = new NodeTracerProvider();
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with logger', () => {
      provider = new NodeTracerProvider({
        logger: new NoopLogger(),
      });
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with sampler', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should load a merge of user configured and default plugins and implictly enable non-default plugins', () => {
      provider = new NodeTracerProvider({
        logger: new NoopLogger(),
        plugins: {
          'simple-module': {
            path: '@opentelemetry/plugin-simple-module',
          },
          'supported-module': {
            path: '@opentelemetry/plugin-supported-module',
            enhancedDatabaseReporting: false,
            ignoreMethods: [],
            ignoreUrls: [],
          },
          'random-module': {
            enabled: false,
            path: '@opentelemetry/random-module',
          },
          http: {
            path: '@opentelemetry/plugin-http-module',
          },
        },
      });
      const plugins = provider['_pluginLoader']['_plugins'];
      assert.strictEqual(plugins.length, 0);
      require('simple-module');
      assert.strictEqual(plugins.length, 1);
      require('supported-module');
      assert.strictEqual(plugins.length, 2);
      require('random-module');
      assert.strictEqual(plugins.length, 2);
      require('http');
      assert.strictEqual(plugins.length, 3);
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      provider = new NodeTracerProvider({
        logger: new NoopLogger(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      provider = new NodeTracerProvider({
        logger: new NoopLogger(),
      });
      const span = provider.getTracer('default').startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling (AlwaysOffSampler)', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOffSampler(),
        logger: new NoopLogger(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.NONE);
      assert.strictEqual(span.isRecording(), false);
    });

    it('should start a recording span with always sampling (AlwaysOnSampler)', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
        logger: new NoopLogger(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should sample with AlwaysOnSampler if parent was not sampled', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
        logger: new NoopLogger(),
      });

      const sampledParent = provider
        .getTracer('default')
        .startSpan('not-sampled-span', {
          parent: {
            traceId: 'd4cda95b652f4a1592b449d5929fda1b',
            spanId: '6e0c63257de34c92',
            traceFlags: TraceFlags.NONE,
          },
        });
      assert.ok(sampledParent instanceof Span);
      assert.strictEqual(
        sampledParent.context().traceFlags,
        TraceFlags.SAMPLED
      );
      assert.strictEqual(sampledParent.isRecording(), true);

      const span = provider.getTracer('default').startSpan('child-span', {
        parent: sampledParent,
      });
      assert.ok(span instanceof Span);
      assert.strictEqual(span.context().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should assign resource to span', () => {
      provider = new NodeTracerProvider({
        logger: new NoopLogger(),
      });
      const span = provider.getTracer('default').startSpan('my-span') as Span;
      assert.ok(span);
      assert.ok(span.resource instanceof Resource);
      assert.equal(
        span.resource.attributes[TELEMETRY_SDK_RESOURCE.LANGUAGE],
        'nodejs'
      );
    });
  });

  describe('.getCurrentSpan()', () => {
    it('should return undefined with AsyncHooksContextManager when no span started', () => {
      provider = new NodeTracerProvider({});
      assert.deepStrictEqual(
        provider.getTracer('default').getCurrentSpan(),
        undefined
      );
    });
  });

  describe('.withSpan()', () => {
    it('should run context with AsyncHooksContextManager context manager', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      provider.getTracer('default').withSpan(span, () => {
        assert.deepStrictEqual(
          provider.getTracer('default').getCurrentSpan(),
          span
        );
        return done();
      });
      assert.deepStrictEqual(
        provider.getTracer('default').getCurrentSpan(),
        undefined
      );
    });

    it('should run context with AsyncHooksContextManager context manager with multiple spans', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      provider.getTracer('default').withSpan(span, () => {
        assert.deepStrictEqual(
          provider.getTracer('default').getCurrentSpan(),
          span
        );

        const span1 = provider.getTracer('default').startSpan('my-span1');

        provider.getTracer('default').withSpan(span1, () => {
          assert.deepStrictEqual(
            provider.getTracer('default').getCurrentSpan(),
            span1
          );
          assert.deepStrictEqual(
            span1.context().traceId,
            span.context().traceId
          );
          return done();
        });
      });
      // when span ended.
      // @todo: below check is not running.
      assert.deepStrictEqual(
        provider.getTracer('default').getCurrentSpan(),
        undefined
      );
    });

    it('should find correct context with promises', async () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span');
      await provider.getTracer('default').withSpan(span, async () => {
        for (let i = 0; i < 3; i++) {
          await sleep(5).then(() => {
            assert.deepStrictEqual(
              provider.getTracer('default').getCurrentSpan(),
              span
            );
          });
        }
      });
      assert.deepStrictEqual(
        provider.getTracer('default').getCurrentSpan(),
        undefined
      );
    });
  });

  describe('.bind()', () => {
    it('should bind context with AsyncHooksContextManager context manager', done => {
      const provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(
          provider.getTracer('default').getCurrentSpan(),
          span
        );
        return done();
      };
      const patchedFn = context.bind(fn, setActiveSpan(context.active(), span));
      return patchedFn();
    });
  });
});

describe('mergePlugins', () => {
  const defaultPlugins = {
    module1: {
      enabled: true,
      path: 'testpath',
    },
    module2: {
      enabled: true,
      path: 'testpath2',
    },
    module3: {
      enabled: true,
      path: 'testpath3',
    },
  };

  const userPlugins = {
    module2: {
      path: 'userpath',
    },
    module3: {
      enabled: false,
    },
    nonDefaultModule: {
      path: 'userpath2',
    },
  };

  const provider = new NodeTracerProvider();

  const mergedPlugins = provider['_mergePlugins'](defaultPlugins, userPlugins);

  it('should merge user and default configs', () => {
    assert.equal(mergedPlugins.module1.enabled, true);
    assert.equal(mergedPlugins.module1.path, 'testpath');
    assert.equal(mergedPlugins.module2.enabled, true);
    assert.equal(mergedPlugins.module2.path, 'userpath');
    assert.equal(mergedPlugins.module3.enabled, false);
    assert.equal(mergedPlugins.nonDefaultModule.enabled, true);
    assert.equal(mergedPlugins.nonDefaultModule.path, 'userpath2');
  });

  it('should should not mangle default config', () => {
    assert.equal(defaultPlugins.module2.path, 'testpath2');
    assert.equal(defaultPlugins.module3.enabled, true);
    assert.equal(defaultPlugins.module3.path, 'testpath3');
  });
});
