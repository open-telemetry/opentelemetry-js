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

import { BasePlugin } from '@opentelemetry/core';
import * as assert from 'assert';
import { WebPluginManager } from '../src/WebPluginManager';
import * as sinon from 'sinon';

class DummyPlugin extends BasePlugin<unknown> {
  constructor() {
    super('dummy');
  }
  moduleName = 'dummy';

  patch() {}
  unpatch() {}
}

describe('WebTracerProvider', () => {
  describe('constructor', () => {
    it('should enable all plugins', () => {
      const dummyPlugin1 = new DummyPlugin();
      const dummyPlugin2 = new DummyPlugin();
      const spyEnable1 = sinon.spy(dummyPlugin1, 'enable');
      const spyEnable2 = sinon.spy(dummyPlugin2, 'enable');

      const plugins = [dummyPlugin1, dummyPlugin2];

      const options = { plugins };
      new WebPluginManager(options);

      assert.ok(spyEnable1.calledOnce === true);
      assert.ok(spyEnable2.calledOnce === true);
    });
  });
});
