/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import { AsyncHooksScopeManager } from '../src';

describe('AsyncHooksScopeManager', () => {
  let scopeManager: AsyncHooksScopeManager;

  beforeEach(() => {
    scopeManager = new AsyncHooksScopeManager();
    scopeManager.enable();
  });

  afterEach(() => {
    scopeManager.disable();
  });

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        scopeManager = new AsyncHooksScopeManager();
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
    it('should run the callback (null as target)', done => {
      scopeManager.with(null, done);
    });

    it('should run the callback (object as target)', done => {
      const test = { a: 1 };
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
      const scope1 = 'scope1';
      const scope2 = 'scope2';
      scopeManager.with(scope1, () => {
        assert.strictEqual(scopeManager.active(), 'scope1');
        scopeManager.with(scope2, () => {
          assert.strictEqual(scopeManager.active(), 'scope2');
        });
        assert.strictEqual(scopeManager.active(), 'scope1');
        return done();
      });
    });
  });

  describe('.bind(function)', () => {
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

    it('should return current scope (when enabled)', done => {
      const scope = { a: 1 };
      const fn = scopeManager.bind(() => {
        assert.strictEqual(scopeManager.active(), scope, 'should have scope');
        return done();
      }, scope);
      fn();
    });

    /**
     * Even if asynchooks is disabled, the scope propagation will
     * still works but it might be lost after any async op.
     */
    it('should return current scope (when disabled)', done => {
      scopeManager.disable();
      const scope = { a: 1 };
      const fn = scopeManager.bind(() => {
        assert.strictEqual(scopeManager.active(), scope, 'should have scope');
        return done();
      }, scope);
      fn();
    });

    it('should fail to return current scope (when disabled + async op)', done => {
      scopeManager.disable();
      const scope = { a: 1 };
      const fn = scopeManager.bind(() => {
        setTimeout(() => {
          assert.strictEqual(
            scopeManager.active(),
            null,
            'should have no scope'
          );
          return done();
        }, 100);
      }, scope);
      fn();
    });

    it('should return current scope (when re-enabled + async op)', done => {
      scopeManager.enable();
      const scope = { a: 1 };
      const fn = scopeManager.bind(() => {
        setTimeout(() => {
          assert.strictEqual(scopeManager.active(), scope, 'should have scope');
          return done();
        }, 100);
      }, scope);
      fn();
    });
  });
});
