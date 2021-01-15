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
import { NoopContextManager } from '@opentelemetry/context-base';
import {
  _global,
  GLOBAL_CONTEXT_MANAGER_API_KEY,
} from '../../src/api/global-utils';

const api1 = require('../../src') as typeof import('../../src');

// clear cache and load a second instance of the api
for (const key of Object.keys(require.cache)) {
  delete require.cache[key];
}
const api2 = require('../../src') as typeof import('../../src');

describe('Global Utils', () => {
  // prove they are separate instances
  assert.notEqual(api1, api2);
  // that return separate noop instances to start
  assert.notStrictEqual(
    api1.context['_getContextManager'](),
    api2.context['_getContextManager']()
  );

  beforeEach(() => {
    api1.context.disable();
    api1.propagation.disable();
    api1.trace.disable();
  });

  it('should change the global context manager', () => {
    const original = api1.context['_getContextManager']();
    const newContextManager = new NoopContextManager();
    api1.context.setGlobalContextManager(newContextManager);
    assert.notStrictEqual(api1.context['_getContextManager'](), original);
    assert.strictEqual(api1.context['_getContextManager'](), newContextManager);
  });

  it('should load an instance from one which was set in the other', () => {
    api1.context.setGlobalContextManager(new NoopContextManager());
    assert.strictEqual(
      api1.context['_getContextManager'](),
      api2.context['_getContextManager']()
    );
  });

  it('should disable both if one is disabled', () => {
    const original = api1.context['_getContextManager']();

    api1.context.setGlobalContextManager(new NoopContextManager());

    assert.notStrictEqual(original, api1.context['_getContextManager']());
    api2.context.disable();
    assert.strictEqual(original, api1.context['_getContextManager']());
  });

  it('should return the module NoOp implementation if the version is a mismatch', () => {
    const original = api1.context['_getContextManager']();
    api1.context.setGlobalContextManager(new NoopContextManager());
    const afterSet = _global[GLOBAL_CONTEXT_MANAGER_API_KEY]!(-1);

    assert.strictEqual(original, afterSet);
  });
});
