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
import * as assert from 'assert';
import * as sinon from 'sinon';
import { BasicTracerConfig } from '@opentelemetry/tracing';
import { WebTracerConfig } from '../src';
import { StackScopeManager } from '../src/StackScopeManager';
import { WebTracer } from '../src/WebTracer';

class DummyPlugin extends BasePlugin<unknown> {
  patch() {}

  unpatch() {}
}

describe('WebTracer', () => {
  let tracer: WebTracer;
  describe('constructor', () => {
    let defaultOptions: WebTracerConfig;

    beforeEach(() => {
      defaultOptions = {
        scopeManager: new StackScopeManager(),
      };
    });

    it('should construct an instance with required only options', () => {
      tracer = new WebTracer(Object.assign({}, defaultOptions));
      assert.ok(tracer instanceof WebTracer);
    });

    it('should enable the scope manager', () => {
      let options: BasicTracerConfig;
      const scopeManager = new StackScopeManager();
      options = { scopeManager };

      const spy = sinon.spy(scopeManager, 'enable');
      tracer = new WebTracer(options);

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
      tracer = new WebTracer(options);

      assert.ok(spyEnable1.calledOnce === true);
      assert.ok(spyEnable2.calledOnce === true);
    });

    it('should work without default scope manager', () => {
      assert.doesNotThrow(() => {
        tracer = new WebTracer({});
      });
    });
  });
});
