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

import 'zone.js';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { ZoneContextManager } from '../src';
import { ROOT_CONTEXT, createContextKey } from '@opentelemetry/api';

let clock: any;

describe('ZoneContextManager', () => {
  let contextManager: ZoneContextManager;
  const key1 = createContextKey('test key 1');
  const key2 = createContextKey('test key 2');

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    contextManager = new ZoneContextManager();
    contextManager.enable();
  });

  afterEach(() => {
    clock.restore();
    contextManager.disable();
  });

  describe('.enable()', () => {
    it('should work', () => {
      const ctx = ROOT_CONTEXT.setValue(key1, 1);
      assert.doesNotThrow(() => {
        assert.ok(
          contextManager.enable() === contextManager,
          'should return this'
        );
        contextManager.with(ctx, () => {
          assert.ok(
            contextManager.active() === ctx,
            'should have root context'
          );
        });
      });
    });
  });

  describe('.disable()', () => {
    it('should work', () => {
      const ctx = ROOT_CONTEXT.setValue(key1, 1);
      assert.doesNotThrow(() => {
        assert.ok(
          contextManager.disable() === contextManager,
          'should return this'
        );
        contextManager.with(ctx, () => {
          assert.ok(
            contextManager.active() === ROOT_CONTEXT,
            'should have root context'
          );
        });
      });
    });
  });

  describe('.with()', () => {
    it('should run the callback (null as target)', done => {
      contextManager.with(null, done);
    });

    it('should run the callback (object as target)', done => {
      const test = ROOT_CONTEXT.setValue(key1, 1);
      contextManager.with(test, () => {
        assert.strictEqual(
          contextManager.active(),
          test,
          'should have context'
        );
        return done();
      });
    });

    it('should run the callback (when disabled)', done => {
      contextManager.disable();
      contextManager.with(null, () => {
        contextManager.enable();
        return done();
      });
    });

    it('should rethrow errors', done => {
      assert.throws(() => {
        contextManager.with(null, () => {
          throw new Error('This should be rethrown');
        });
      });
      return done();
    });

    it('should forward this, arguments and return value', () => {
      function fnWithThis(this: string, a: string, b: number): string {
        assert.strictEqual(this, 'that');
        assert.strictEqual(arguments.length, 2);
        assert.strictEqual(a, 'one');
        assert.strictEqual(b, 2);
        return 'done';
      }

      const res = contextManager.with(
        ROOT_CONTEXT,
        fnWithThis,
        'that',
        'one',
        2
      );
      assert.strictEqual(res, 'done');

      assert.strictEqual(
        contextManager.with(ROOT_CONTEXT, () => 3.14),
        3.14
      );
    });

    it('should finally restore an old context, including the async task', done => {
      const ctx1 = ROOT_CONTEXT.setValue(key1, 'ctx1');
      const ctx2 = ROOT_CONTEXT.setValue(key1, 'ctx2');
      const ctx3 = ROOT_CONTEXT.setValue(key1, 'ctx3');

      contextManager.with(ctx1, () => {
        assert.strictEqual(contextManager.active(), ctx1);
        contextManager.with(ctx2, () => {
          assert.strictEqual(contextManager.active(), ctx2);
          contextManager.with(ctx3, () => {
            assert.strictEqual(contextManager.active(), ctx3);
          });
          assert.strictEqual(contextManager.active(), ctx2);
        });
        assert.strictEqual(contextManager.active(), ctx1);
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), ctx1);
          done();
        }, 500);
        clock.tick(500);
      });
      assert.strictEqual(contextManager.active(), window);
    });

    it('should finally restore an old context when context is an object, including the async task', done => {
      const ctx1 = ROOT_CONTEXT.setValue(key1, 1);
      const ctx2 = ROOT_CONTEXT.setValue(key1, 2);
      const ctx3 = ROOT_CONTEXT.setValue(key1, 3);
      contextManager.with(ctx1, () => {
        assert.strictEqual(contextManager.active(), ctx1);
        contextManager.with(ctx2, () => {
          assert.strictEqual(contextManager.active(), ctx2);
          contextManager.with(ctx3, () => {
            assert.strictEqual(contextManager.active(), ctx3);
          });
          assert.strictEqual(contextManager.active(), ctx2);
        });
        assert.strictEqual(contextManager.active(), ctx1);
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), ctx1);
          done();
        }, 500);
        clock.tick(500);
      });
      assert.strictEqual(contextManager.active(), window);
    });
    it('should correctly return the contexts for 3 parallel actions', () => {
      const rootSpan = ROOT_CONTEXT.setValue(key1, 'root');
      contextManager.with(rootSpan, () => {
        assert.ok(
          contextManager.active().getValue(key1) === 'root',
          'Current span is rootSpan'
        );
        const concurrentSpan1 = ROOT_CONTEXT.setValue(key2, 'concurrentSpan1');
        const concurrentSpan2 = ROOT_CONTEXT.setValue(key2, 'concurrentSpan2');
        const concurrentSpan3 = ROOT_CONTEXT.setValue(key2, 'concurrentSpan3');

        contextManager.with(concurrentSpan1, () => {
          setTimeout(() => {
            assert.ok(
              contextManager.active().getValue(key2) === concurrentSpan1,
              'Current span is concurrentSpan1'
            );
          }, 10);
        });

        contextManager.with(concurrentSpan2, () => {
          setTimeout(() => {
            assert.ok(
              contextManager.active().getValue(key2) === concurrentSpan2,
              'Current span is concurrentSpan2'
            );
          }, 20);
        });

        contextManager.with(concurrentSpan3, () => {
          setTimeout(() => {
            assert.ok(
              contextManager.active().getValue(key2) === concurrentSpan3,
              'Current span is concurrentSpan3'
            );
          }, 30);
        });
      });
    });

    it('should fork new zone from active one', () => {
      const context = ROOT_CONTEXT;
      const rootZone = Zone.current;
      contextManager.with(context, () => {
        const zone1 = Zone.current;
        assert.ok(zone1.parent === rootZone);
        contextManager.with(context, () => {
          const zone2 = Zone.current;
          contextManager.with(context, () => {
            const zone3 = Zone.current;
            assert.ok(zone3.parent === zone2);
          });
          assert.ok(zone2.parent === zone1);
        });
      });
    });
  });

  describe('.bind(function)', () => {
    it('should call the function with previously assigned context', () => {
      class Obj {
        title: string;

        constructor(title: string) {
          this.title = title;
        }

        getTitle() {
          return (contextManager.active().getValue(key1) as Obj).title;
        }
      }

      const obj1 = new Obj('a1');
      const ctx = ROOT_CONTEXT.setValue(key1, obj1);
      obj1.title = 'a2';
      const obj2 = new Obj('b1');
      const wrapper: any = contextManager.bind(ctx, obj2.getTitle);
      assert.ok(wrapper(), 'a2');
    });

    it('should return the same target (when enabled)', () => {
      const test = { a: 1 };
      assert.deepStrictEqual(contextManager.bind(ROOT_CONTEXT, test), test);
    });

    it('should return the same target (when disabled)', () => {
      contextManager.disable();
      const test = { a: 1 };
      assert.deepStrictEqual(contextManager.bind(ROOT_CONTEXT, test), test);
      contextManager.enable();
    });

    it('should return current context (when enabled)', done => {
      const context = ROOT_CONTEXT.setValue(key1, { a: 1 });
      const fn: any = contextManager.bind(context, () => {
        assert.strictEqual(
          contextManager.active(),
          context,
          'should have context'
        );
        return done();
      });
      fn();
    });

    it('should return root context (when disabled)', done => {
      contextManager.disable();
      const context = ROOT_CONTEXT.setValue(key1, { a: 1 });
      const fn: any = contextManager.bind(context, () => {
        assert.strictEqual(
          contextManager.active(),
          ROOT_CONTEXT,
          'should have context'
        );
        return done();
      });
      fn();
    });

    it('should bind the the certain context to the target "addEventListener" function', done => {
      const ctx1 = ROOT_CONTEXT.setValue(key1, 1);
      const element = document.createElement('div');

      contextManager.bind(ctx1, element);

      element.addEventListener('click', () => {
        assert.strictEqual(contextManager.active(), ctx1);
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), ctx1);
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

    it('should preserve zone when creating new click event inside zone', done => {
      const ctx1 = ROOT_CONTEXT.setValue(key1, 1);
      const element = document.createElement('div');

      contextManager.bind(ctx1, element);

      element.addEventListener('click', () => {
        assert.strictEqual(contextManager.active(), ctx1);
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), ctx1);
          const element2 = document.createElement('div');

          element2.addEventListener('click', () => {
            assert.strictEqual(contextManager.active(), ctx1);
            setTimeout(() => {
              assert.strictEqual(contextManager.active(), ctx1);
              done();
            }, 500);
            clock.tick(500);
          });

          element2.dispatchEvent(
            new CustomEvent('click', {
              bubbles: true,
              cancelable: false,
              composed: true,
            })
          );
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
  });
});
