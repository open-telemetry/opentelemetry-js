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
  NoRecordingSpan,
} from '@opentelemetry/core';
import { NodeTracerRegistry } from '../src/NodeTracerRegistry';
import { TraceFlags } from '@opentelemetry/types';
import { Span } from '@opentelemetry/tracing';
import * as path from 'path';

const sleep = (time: number) =>
  new Promise(resolve => {
    return setTimeout(resolve, time);
  });

const INSTALLED_PLUGINS_PATH = path.join(
  __dirname,
  'instrumentation',
  'node_modules'
);

describe('NodeTracerRegistry', () => {
  let registry: NodeTracerRegistry;
  before(() => {
    module.paths.push(INSTALLED_PLUGINS_PATH);
  });

  afterEach(() => {
    // clear require cache
    Object.keys(require.cache).forEach(key => delete require.cache[key]);
    registry.stop();
  });

  describe('constructor', () => {
    it('should construct an instance with required only options', () => {
      registry = new NodeTracerRegistry();
      assert.ok(registry instanceof NodeTracerRegistry);
    });

    it('should construct an instance with binary format', () => {
      registry = new NodeTracerRegistry({
        binaryFormat: new BinaryTraceContext(),
      });
      assert.ok(registry instanceof NodeTracerRegistry);
    });

    it('should construct an instance with http text format', () => {
      registry = new NodeTracerRegistry({
        httpTextFormat: new HttpTraceContext(),
      });
      assert.ok(registry instanceof NodeTracerRegistry);
    });

    it('should construct an instance with logger', () => {
      registry = new NodeTracerRegistry({
        logger: new NoopLogger(),
      });
      assert.ok(registry instanceof NodeTracerRegistry);
    });

    it('should construct an instance with sampler', () => {
      registry = new NodeTracerRegistry({
        sampler: ALWAYS_SAMPLER,
      });
      assert.ok(registry instanceof NodeTracerRegistry);
    });

    it('should load user configured plugins', () => {
      registry = new NodeTracerRegistry({
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
      const pluginLoader = registry['_pluginLoader'];
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      require('simple-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 1);
      require('supported-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 2);
    });

    it('should construct an instance with default attributes', () => {
      registry = new NodeTracerRegistry({
        defaultAttributes: {
          region: 'eu-west',
          asg: 'my-asg',
        },
      });
      assert.ok(registry instanceof NodeTracerRegistry);
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      registry = new NodeTracerRegistry({
        logger: new NoopLogger(),
      });
      const span = registry.getTracer('default').startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      registry = new NodeTracerRegistry({
        logger: new NoopLogger(),
      });
      const span = registry.getTracer('default').startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling', () => {
      registry = new NodeTracerRegistry({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      });
      const span = registry.getTracer('default').startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecording(), false);
    });

    // @todo: implement
    it('should start a Span with always sampling');

    it('should set default attributes on span', () => {
      const defaultAttributes = {
        foo: 'bar',
      };
      registry = new NodeTracerRegistry({
        defaultAttributes,
      });

      const span = registry.getTracer('default').startSpan('my-span') as Span;
      assert.ok(span instanceof Span);
      assert.deepStrictEqual(span.attributes, defaultAttributes);
    });
  });

  describe('.getCurrentSpan()', () => {
    it('should return undefined with AsyncHooksScopeManager when no span started', () => {
      registry = new NodeTracerRegistry({});
      assert.deepStrictEqual(
        registry.getTracer('default').getCurrentSpan(),
        undefined
      );
    });
  });

  describe('.withSpan()', () => {
    it('should run scope with AsyncHooksScopeManager scope manager', done => {
      registry = new NodeTracerRegistry({});
      const span = registry.getTracer('default').startSpan('my-span');
      registry.getTracer('default').withSpan(span, () => {
        assert.deepStrictEqual(
          registry.getTracer('default').getCurrentSpan(),
          span
        );
        return done();
      });
      assert.deepStrictEqual(
        registry.getTracer('default').getCurrentSpan(),
        undefined
      );
    });

    it('should run scope with AsyncHooksScopeManager scope manager with multiple spans', done => {
      registry = new NodeTracerRegistry({});
      const span = registry.getTracer('default').startSpan('my-span');
      registry.getTracer('default').withSpan(span, () => {
        assert.deepStrictEqual(
          registry.getTracer('default').getCurrentSpan(),
          span
        );

        const span1 = registry
          .getTracer('default')
          .startSpan('my-span1', { parent: span });
        registry.getTracer('default').withSpan(span1, () => {
          assert.deepStrictEqual(
            registry.getTracer('default').getCurrentSpan(),
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
        registry.getTracer('default').getCurrentSpan(),
        undefined
      );
    });

    it('should find correct scope with promises', done => {
      registry = new NodeTracerRegistry({});
      const span = registry.getTracer('default').startSpan('my-span');
      registry.getTracer('default').withSpan(span, async () => {
        for (let i = 0; i < 3; i++) {
          await sleep(5).then(() => {
            assert.deepStrictEqual(
              registry.getTracer('default').getCurrentSpan(),
              span
            );
          });
        }
        return done();
      });
      assert.deepStrictEqual(
        registry.getTracer('default').getCurrentSpan(),
        undefined
      );
    });
  });

  describe('.bind()', () => {
    it('should bind scope with AsyncHooksScopeManager scope manager', done => {
      const registry = new NodeTracerRegistry({});
      const span = registry.getTracer('default').startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(
          registry.getTracer('default').getCurrentSpan(),
          span
        );
        return done();
      };
      const patchedFn = registry.getTracer('default').bind(fn, span);
      return patchedFn();
    });
  });

  describe('.getBinaryFormat()', () => {
    it('should get default binary formatter', () => {
      registry = new NodeTracerRegistry({});
      assert.ok(
        registry.getTracer('default').getBinaryFormat() instanceof
          BinaryTraceContext
      );
    });
  });

  describe('.getHttpTextFormat()', () => {
    it('should get default HTTP text formatter', () => {
      registry = new NodeTracerRegistry({});
      assert.ok(
        registry.getTracer('default').getHttpTextFormat() instanceof
          HttpTraceContext
      );
    });
  });
});
