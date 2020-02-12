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

import { BasePlugin } from '@opentelemetry/core';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';
import { Tracer, TracerConfig } from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { WebTracerConfig } from '../src';
import { StackScopeManager } from '../src/StackScopeManager';
import { WebTracerProvider } from '../src/WebTracerProvider';

class DummyPlugin extends BasePlugin<unknown> {
  constructor() {
    super('dummy');
  }
  moduleName = 'dummy';

  patch() {}
  unpatch() {}
}

describe('WebTracer', () => {
  describe('constructor', () => {
    let defaultOptions: WebTracerConfig;

    beforeEach(() => {
      defaultOptions = {
        scopeManager: new StackScopeManager(),
      };
    });

    it('should construct an instance with required only options', () => {
      const tracer = new WebTracerProvider(
        Object.assign({}, defaultOptions)
      ).getTracer('default');
      assert.ok(tracer instanceof Tracer);
    });

    it('should enable the scope manager', () => {
      let options: TracerConfig;
      const scopeManager = new StackScopeManager();
      options = { scopeManager };

      const spy = sinon.spy(scopeManager, 'enable');
      new WebTracerProvider(options);

      assert.ok(spy.calledOnce === true);
    });

    it('should enable all plugins', () => {
      let options: WebTracerConfig;
      const dummyPlugin1 = new DummyPlugin();
      const dummyPlugin2 = new DummyPlugin();
      const spyEnable1 = sinon.spy(dummyPlugin1, 'enable');
      const spyEnable2 = sinon.spy(dummyPlugin2, 'enable');

      const scopeManager = new StackScopeManager();

      const plugins = [dummyPlugin1, dummyPlugin2];

      options = { plugins, scopeManager };
      new WebTracerProvider(options);

      assert.ok(spyEnable1.calledOnce === true);
      assert.ok(spyEnable2.calledOnce === true);
    });

    it('should work without default scope manager', () => {
      assert.doesNotThrow(() => {
        new WebTracerProvider({});
      });
    });

    describe('when scopeManager is "ZoneScopeManager"', () => {
      it('should correctly return the scopes for 2 parallel actions', () => {
        const webTracerWithZone = new WebTracerProvider({
          scopeManager: new ZoneScopeManager(),
        }).getTracer('default');

        const rootSpan = webTracerWithZone.startSpan('rootSpan');

        webTracerWithZone.withSpan(rootSpan, () => {
          assert.ok(
            webTracerWithZone.getCurrentSpan() === rootSpan,
            'Current span is rootSpan'
          );
          const concurrentSpan1 = webTracerWithZone.startSpan(
            'concurrentSpan1'
          );
          const concurrentSpan2 = webTracerWithZone.startSpan(
            'concurrentSpan2'
          );

          webTracerWithZone.withSpan(concurrentSpan1, () => {
            setTimeout(() => {
              assert.ok(
                webTracerWithZone.getCurrentSpan() === concurrentSpan1,
                'Current span is concurrentSpan1'
              );
            }, 10);
          });

          webTracerWithZone.withSpan(concurrentSpan2, () => {
            setTimeout(() => {
              assert.ok(
                webTracerWithZone.getCurrentSpan() === concurrentSpan2,
                'Current span is concurrentSpan2'
              );
            }, 20);
          });
        });
      });
    });
  });
});
