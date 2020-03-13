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

import { context, TraceFlags } from '@opentelemetry/api';
import {
  ALWAYS_SAMPLER,
  NEVER_SAMPLER,
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
        sampler: ALWAYS_SAMPLER,
      });
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should load user configured plugins', () => {
      provider = new NodeTracerProvider({
        logger: new NoopLogger(),
        plugins: {
          'simple-module': {
            enabled: true,
            path: '@opentelemetry/plugin-simple-module',
          },
          'supported-module': {
            enabled: true,
            path: '@opentelemetry/plugin-supported-module',
            enhancedDatabaseReporting: false,
            ignoreMethods: [],
            ignoreUrls: [],
          },
        },
      });
      const pluginLoader = provider['_pluginLoader'];
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      require('simple-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 1);
      require('supported-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 2);
    });

    it('should construct an instance with default attributes', () => {
      provider = new NodeTracerProvider({
        defaultAttributes: {
          region: 'eu-west',
          asg: 'my-asg',
        },
      });
      assert.ok(provider instanceof NodeTracerProvider);
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

    it('should return a default span with no sampling', () => {
      provider = new NodeTracerProvider({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.NONE);
      assert.strictEqual(span.isRecording(), false);
    });

    // @todo: implement
    it('should start a Span with always sampling');

    it('should set default attributes on span', () => {
      const defaultAttributes = {
        foo: 'bar',
      };
      provider = new NodeTracerProvider({
        defaultAttributes,
      });

      const span = provider.getTracer('default').startSpan('my-span') as Span;
      assert.ok(span instanceof Span);
      assert.deepStrictEqual(span.attributes, defaultAttributes);
    });

    it('should assign resource to span', () => {
      provider = new NodeTracerProvider({
        logger: new NoopLogger(),
      });
      const span = provider.getTracer('default').startSpan('my-span') as Span;
      assert.ok(span);
      assert.ok(span.resource instanceof Resource);
      assert.equal(
        span.resource.labels[TELEMETRY_SDK_RESOURCE.LANGUAGE],
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
