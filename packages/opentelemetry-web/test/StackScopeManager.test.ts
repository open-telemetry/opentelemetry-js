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
import { StackScopeManager } from '../src';
import { Context } from '@opentelemetry/api';

describe('StackScopeManager', () => {
  let scopeManager: StackScopeManager;
  const key1 = Context.createKey('test key 1');

  beforeEach(() => {
    scopeManager = new StackScopeManager();
    scopeManager.enable();
  });

  afterEach(() => {
    scopeManager.disable();
  });

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert(scopeManager.enable() === scopeManager, 'should return this');
        assert(
          scopeManager.active() === Context.ROOT_CONTEXT,
          'should have root scope'
        );
      });
    });
  });

  describe('.disable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert(scopeManager.disable() === scopeManager, 'should return this');
        assert(
          scopeManager.active() === Context.ROOT_CONTEXT,
          'should have no scope'
        );
      });
    });
  });

  describe('.with()', () => {
    it('should run the callback (null as target)', done => {
      scopeManager.with(null, done);
    });

    it('should run the callback (object as target)', done => {
      const test = Context.ROOT_CONTEXT.setValue(key1, 1);
      scopeManager.with(test, () => {
        assert.strictEqual(scopeManager.active(), test, 'should have scope');
        return done();
      });
    });

    it('should run the callback (when disabled)', done => {
      scopeManager.disable();
      scopeManager.with(null, () => {
        scopeManager.enable();
        return done();
      });
    });

    it('should rethrow errors', done => {
      assert.throws(() => {
        scopeManager.with(null, () => {
          throw new Error('This should be rethrown');
        });
      });
      return done();
    });

    it('should finally restore an old scope', done => {
      const scope1 = Context.ROOT_CONTEXT.setValue(key1, 'scope1');
      const scope2 = Context.ROOT_CONTEXT.setValue(key1, 'scope2');
      const scope3 = Context.ROOT_CONTEXT.setValue(key1, 'scope3');
      scopeManager.with(scope1, () => {
        assert.strictEqual(scopeManager.active(), scope1);
        scopeManager.with(scope2, () => {
          assert.strictEqual(scopeManager.active(), scope2);
          scopeManager.with(scope3, () => {
            assert.strictEqual(scopeManager.active(), scope3);
          });
          assert.strictEqual(scopeManager.active(), scope2);
        });
        assert.strictEqual(scopeManager.active(), scope1);
        return done();
      });
      assert.strictEqual(scopeManager.active(), window);
    });

    it('should finally restore an old scope when scope is an object', done => {
      const scope1 = Context.ROOT_CONTEXT.setValue(key1, 1);
      const scope2 = Context.ROOT_CONTEXT.setValue(key1, 2);
      const scope3 = Context.ROOT_CONTEXT.setValue(key1, 3);
      scopeManager.with(scope1, () => {
        assert.strictEqual(scopeManager.active(), scope1);
        scopeManager.with(scope2, () => {
          assert.strictEqual(scopeManager.active(), scope2);
          scopeManager.with(scope3, () => {
            assert.strictEqual(scopeManager.active(), scope3);
          });
          assert.strictEqual(scopeManager.active(), scope2);
        });
        assert.strictEqual(scopeManager.active(), scope1);
        return done();
      });
      assert.strictEqual(scopeManager.active(), window);
    });
  });

  describe('.bind(function)', () => {
    it('should call the function with previously assigned scope', () => {
      class Obj {
        title: string;

        constructor(title: string) {
          this.title = title;
        }

        getTitle() {
          return (scopeManager.active().getValue(key1) as Obj).title;
        }
      }

      const obj1 = new Obj('a1');
      const ctx = Context.ROOT_CONTEXT.setValue(key1, obj1);
      obj1.title = 'a2';
      const obj2 = new Obj('b1');
      const wrapper: any = scopeManager.bind(obj2.getTitle, ctx);
      assert.ok(wrapper(), 'a2');
    });

    it('should return the same target (when enabled)', () => {
      const test = Context.ROOT_CONTEXT.setValue(key1, 1);
      assert.deepStrictEqual(scopeManager.bind(test), test);
    });

    it('should return the same target (when disabled)', () => {
      scopeManager.disable();
      const test = Context.ROOT_CONTEXT.setValue(key1, 1);
      assert.deepStrictEqual(scopeManager.bind(test), test);
      scopeManager.enable();
    });

    it('should return current scope (when enabled)', done => {
      const scope = Context.ROOT_CONTEXT.setValue(key1, 1);
      const fn: any = scopeManager.bind(() => {
        assert.strictEqual(scopeManager.active(), scope, 'should have scope');
        return done();
      }, scope);
      fn();
    });

    it('should return current scope (when disabled)', done => {
      scopeManager.disable();
      const scope = Context.ROOT_CONTEXT.setValue(key1, 1);
      const fn: any = scopeManager.bind(() => {
        assert.strictEqual(scopeManager.active(), scope, 'should have scope');
        return done();
      }, scope);
      fn();
    });
  });
});
