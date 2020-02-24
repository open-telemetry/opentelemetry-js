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
import { NoopScopeManager, Context } from '../src';

describe('NoopScopeManager', () => {
  let scopeManager: NoopScopeManager;

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        scopeManager = new NoopScopeManager();
        assert(scopeManager.enable() === scopeManager, 'should return this');
      });
    });
  });

  describe('.disable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert(scopeManager.disable() === scopeManager, 'should return this');
      });
      scopeManager.enable();
    });
  });

  describe('.with()', () => {
    it('should run the callback (Context.ROOT_CONTEXT as target)', done => {
      scopeManager.with(Context.ROOT_CONTEXT, done);
    });

    it('should run the callback (object as target)', done => {
      const key = Context.createKey('test key 1');
      const test = Context.ROOT_CONTEXT.setValue(key, 1);
      scopeManager.with(test, () => {
        assert.strictEqual(
          scopeManager.active(),
          Context.ROOT_CONTEXT,
          'should not have scope'
        );
        return done();
      });
    });

    it('should run the callback (when disabled)', done => {
      scopeManager.disable();
      scopeManager.with(Context.ROOT_CONTEXT, () => {
        scopeManager.enable();
        return done();
      });
    });
  });

  describe('.active()', () => {
    it('should always return Context.ROOT_CONTEXT (when enabled)', () => {
      assert.strictEqual(
        scopeManager.active(),
        Context.ROOT_CONTEXT,
        'should not have scope'
      );
    });

    it('should always return Context.ROOT_CONTEXT (when disabled)', () => {
      scopeManager.disable();
      assert.strictEqual(
        scopeManager.active(),
        Context.ROOT_CONTEXT,
        'should not have scope'
      );
      scopeManager.enable();
    });
  });

  describe('.bind()', () => {
    it('should return the same target (when enabled)', () => {
      const test = { a: 1 };
      assert.deepStrictEqual(scopeManager.bind(test), test);
    });

    it('should return the same target (when disabled)', () => {
      scopeManager.disable();
      const test = { a: 1 };
      assert.deepStrictEqual(scopeManager.bind(test), test);
      scopeManager.enable();
    });
  });
});
