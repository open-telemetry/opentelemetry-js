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

import { context, getSpan, setSpan } from '@opentelemetry/api';
import { ContextManager } from '@opentelemetry/context-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { BasePlugin, NoopLogger } from '@opentelemetry/core';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource, TELEMETRY_SDK_RESOURCE } from '@opentelemetry/resources';
import { Span, Tracer } from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { WebTracerConfig } from '../src';
import { WebTracerProvider } from '../src/WebTracerProvider';

class DummyPlugin extends BasePlugin<unknown> {
  constructor() {
    super('dummy');
  }
  moduleName = 'dummy';

  patch() {}
  unpatch() {}
}

class DummyInstrumentation extends InstrumentationBase<unknown> {
  constructor() {
    super('dummy', '1');
  }
  enable() {}
  disable() {}
  init() {}
}

describe('WebTracerProvider', () => {
  describe('constructor', () => {
    let defaultOptions: WebTracerConfig;
    let contextManager: ContextManager;

    beforeEach(() => {
      defaultOptions = {};
      contextManager = new ZoneContextManager().enable();
      context.setGlobalContextManager(contextManager);
    });

    afterEach(() => {
      contextManager.disable();
      context.disable();
    });

    it('should construct an instance with required only options', () => {
      const tracer = new WebTracerProvider(
        Object.assign({}, defaultOptions)
      ).getTracer('default');
      assert.ok(tracer instanceof Tracer);
    });

    it('should enable all plugins', () => {
      const dummyPlugin1 = new DummyPlugin();
      const dummyPlugin2 = new DummyPlugin();
      const dummyPlugin3 = new DummyInstrumentation();
      const spyEnable1 = sinon.spy(dummyPlugin1, 'enable');
      const spyEnable2 = sinon.spy(dummyPlugin2, 'enable');
      const spyEnable3 = sinon.spy(dummyPlugin3, 'enable');
      const spySetTracerProvider = sinon.spy(dummyPlugin3, 'setTracerProvider');

      const plugins = [dummyPlugin1, dummyPlugin2, dummyPlugin3];

      const options = { plugins };
      new WebTracerProvider(options);

      assert.ok(spyEnable1.calledOnce === true);
      assert.ok(spyEnable2.calledOnce === true);
      assert.ok(spyEnable3.calledOnce === true);
      assert.ok(spySetTracerProvider.calledOnce === true);
    });

    it('should work without default context manager', () => {
      assert.doesNotThrow(() => {
        new WebTracerProvider({});
      });
    });

    it('should throw error when context manager is passed in constructor', () => {
      let error = '';
      try {
        new WebTracerProvider({
          contextManager: new ZoneContextManager(),
        } as any);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(
        error,
        'contextManager should be defined in' +
          ' register method not in constructor'
      );
    });

    it('should throw error when propagator is passed in constructor', () => {
      let error = '';
      try {
        new WebTracerProvider({
          propagator: new B3Propagator(),
        } as any);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(
        error,
        'propagator should be defined in register' +
          ' method not in constructor'
      );
    });

    describe('when contextManager is "ZoneContextManager"', () => {
      it('should correctly return the contexts for 2 parallel actions', done => {
        const webTracerWithZone = new WebTracerProvider().getTracer('default');

        const rootSpan = webTracerWithZone.startSpan('rootSpan');

        context.with(setSpan(context.active(), rootSpan), () => {
          assert.ok(
            getSpan(context.active()) === rootSpan,
            'Current span is rootSpan'
          );
          const concurrentSpan1 = webTracerWithZone.startSpan(
            'concurrentSpan1'
          );
          const concurrentSpan2 = webTracerWithZone.startSpan(
            'concurrentSpan2'
          );

          context.with(setSpan(context.active(), concurrentSpan1), () => {
            setTimeout(() => {
              assert.ok(
                getSpan(context.active()) === concurrentSpan1,
                'Current span is concurrentSpan1'
              );
            }, 10);
          });

          context.with(setSpan(context.active(), concurrentSpan2), () => {
            setTimeout(() => {
              assert.ok(
                getSpan(context.active()) === concurrentSpan2,
                'Current span is concurrentSpan2'
              );
              done();
            }, 20);
          });
        });
      });
    });

    describe('.startSpan()', () => {
      it('should assign resource to span', () => {
        const provider = new WebTracerProvider({
          logger: new NoopLogger(),
        });
        const span = provider.getTracer('default').startSpan('my-span') as Span;
        assert.ok(span);
        assert.ok(span.resource instanceof Resource);
        assert.equal(
          span.resource.attributes[TELEMETRY_SDK_RESOURCE.LANGUAGE],
          'webjs'
        );
      });
    });
  });
});
