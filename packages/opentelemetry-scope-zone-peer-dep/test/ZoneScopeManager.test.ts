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

import 'zone.js';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { ZoneScopeManager } from '../src';

let clock: any;

class MockSpan {
  name = 'test';
}

describe('ZoneScopeManager', () => {
  let scopeManager: ZoneScopeManager;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    scopeManager = new ZoneScopeManager();
    scopeManager.enable();
  });

  afterEach(() => {
    clock.restore();
    scopeManager.disable();
  });

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert(scopeManager.enable() === scopeManager, 'should return this');
        assert(scopeManager.active() === window, 'should has root scope');
      });
    });
  });

  describe('.disable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert(scopeManager.disable() === scopeManager, 'should return this');
        assert(scopeManager.active() === undefined, 'should has no scope');
      });
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

    it('should finally restore an old scope, including the async task', done => {
      const scope1 = 'scope1';
      const scope2 = 'scope2';
      const scope3 = 'scope3';

      scopeManager.with(scope1, () => {
        assert.strictEqual(scopeManager.active(), 'scope1');
        scopeManager.with(scope2, () => {
          assert.strictEqual(scopeManager.active(), 'scope2');
          scopeManager.with(scope3, () => {
            assert.strictEqual(scopeManager.active(), 'scope3');
          });
          assert.strictEqual(scopeManager.active(), 'scope2');
        });
        assert.strictEqual(scopeManager.active(), 'scope1');
        setTimeout(() => {
          assert.strictEqual(scopeManager.active(), 'scope1');
          done();
        }, 500);
        clock.tick(500);
      });
      assert.strictEqual(scopeManager.active(), window);
    });

    it('should finally restore an old scope when scope is an object, including the async task', done => {
      const scope1 = { a: 1 };
      const scope2 = { a: 2 };
      const scope3 = { a: 3 };
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
        setTimeout(() => {
          assert.strictEqual(scopeManager.active(), scope1);
          done();
        }, 500);
        clock.tick(500);
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
          return this.title;
        }
      }

      const obj1 = new Obj('a1');
      obj1.title = 'a2';
      const obj2 = new Obj('b1');
      const wrapper: any = scopeManager.bind(obj2.getTitle, obj1);
      assert.ok(wrapper(), 'a2');
    });

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
      const fn: any = scopeManager.bind(() => {
        assert.strictEqual(scopeManager.active(), scope, 'should have scope');
        return done();
      }, scope);
      fn();
    });

    it('should return current scope (when disabled)', done => {
      scopeManager.disable();
      const scope = { a: 1 };
      const fn: any = scopeManager.bind(() => {
        assert.strictEqual(scopeManager.active(), scope, 'should have scope');
        return done();
      }, scope);
      fn();
    });

    it('should bind the target for click event', done => {
      const scope1 = { a: 1 };
      const element = document.createElement('div');

      scopeManager.bind(element, scope1);

      element.addEventListener('click', () => {
        assert.strictEqual(scopeManager.active(), scope1);
        setTimeout(() => {
          assert.strictEqual(scopeManager.active(), scope1);
          done();
        }, 500);
        clock.tick(500);
      });

      element.dispatchEvent(
        new CustomEvent('click', {
          bubbles: true,
          cancelable: false,
          composed: true,
        })
      );
    });

    it('should restore original events when user removes the click event', done => {
      // for this test block sinon as it doesn't work correctly in this particular example with zone

      clock.restore();
      const scope1 = new MockSpan();

      const element = document.createElement('div');
      const elementAddEventListener = element.addEventListener;
      const elementRemoveEventListener = element.removeEventListener;

      scopeManager.bind(element, scope1);

      function onClick(this: any) {
        assert.strictEqual(
          this,
          element,
          'event callback should have a proper scope'
        );
        assert.strictEqual(scopeManager.active(), scope1);
        setTimeout(() => {
          done();
        }, 50);
      }

      element.addEventListener('click', onClick);

      setTimeout(() => {
        assert.ok(
          element.addEventListener !== elementAddEventListener,
          'element should have patched version of addEventListener'
        );
        assert.ok(
          element.removeEventListener !== elementRemoveEventListener,
          'element should have patched version of removeEventListener'
        );

        element.removeEventListener('click', onClick);

        assert.ok(
          element.addEventListener === elementAddEventListener,
          'element should have original version of of addEventListener'
        );
        assert.ok(
          element.removeEventListener === elementRemoveEventListener,
          'element should have original version of removeEventListener'
        );
      }, 10);

      element.dispatchEvent(
        new CustomEvent('click', {
          bubbles: true,
          cancelable: false,
          composed: true,
        })
      );
    });
  });
});
