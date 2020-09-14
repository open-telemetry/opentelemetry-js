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
import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '../src';
import { EventEmitter } from 'events';
import { Context } from '@opentelemetry/context-base';

for (const contextManagerClass of [
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
]) {
  describe(contextManagerClass.name, () => {
    let contextManager:
      | AsyncHooksContextManager
      | AsyncLocalStorageContextManager;
    const key1 = Context.createKey('test key 1');

    before(function () {
      if (
        contextManagerClass.name === 'AsyncLocalStorageContextManager' &&
        (process.version.startsWith('v8.') ||
          process.version.startsWith('v10.'))
      ) {
        this.skip();
      }
    });

    beforeEach(() => {
      contextManager = new contextManagerClass();
      contextManager.enable();
    });

    afterEach(() => {
      contextManager.disable();
    });

    describe('.enable()', () => {
      it('should work', () => {
        assert.doesNotThrow(() => {
          contextManager = new contextManagerClass();
          assert(
            contextManager.enable() === contextManager,
            'should return this'
          );
        });
      });
    });

    describe('.disable()', () => {
      it('should work', () => {
        assert.doesNotThrow(() => {
          assert(
            contextManager.disable() === contextManager,
            'should return this'
          );
        });
        contextManager.enable();
      });
    });

    describe('.with()', () => {
      it('should run the callback (null as target)', done => {
        contextManager.with(Context.ROOT_CONTEXT, done);
      });

      it('should run the callback (object as target)', done => {
        const test = Context.ROOT_CONTEXT.setValue(key1, 1);
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
        contextManager.with(Context.ROOT_CONTEXT, () => {
          contextManager.enable();
          return done();
        });
      });

      it('should rethrow errors', done => {
        assert.throws(() => {
          contextManager.with(Context.ROOT_CONTEXT, () => {
            throw new Error('This should be rethrown');
          });
        });
        return done();
      });

      it('should finally restore an old context', done => {
        const ctx1 = Context.ROOT_CONTEXT.setValue(key1, 'ctx1');
        const ctx2 = Context.ROOT_CONTEXT.setValue(key1, 'ctx2');
        contextManager.with(ctx1, () => {
          assert.strictEqual(contextManager.active(), ctx1);
          contextManager.with(ctx2, () => {
            assert.strictEqual(contextManager.active(), ctx2);
          });
          assert.strictEqual(contextManager.active(), ctx1);
          return done();
        });
      });

      it('should finally restore an old context', done => {
        const ctx1 = Context.ROOT_CONTEXT.setValue(key1, 'ctx1');
        contextManager.with(ctx1, () => {
          assert.strictEqual(contextManager.active(), ctx1);
          setTimeout(() => {
            assert.strictEqual(contextManager.active(), ctx1);
            return done();
          });
        });
      });

      it('async function called from nested "with" sync function should return nested context', done => {
        const scope1 = '1' as any;
        const scope2 = '2' as any;

        const asyncFuncCalledDownstreamFromSync = async () => {
          await (async () => {})();
          assert.strictEqual(contextManager.active(), scope2);
          return done();
        };

        contextManager.with(scope1, () => {
          assert.strictEqual(contextManager.active(), scope1);
          contextManager.with(scope2, () =>
            asyncFuncCalledDownstreamFromSync()
          );
          assert.strictEqual(contextManager.active(), scope1);
        });
        assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
      });

      it('should not loose the context', done => {
        const scope1 = '1' as any;

        contextManager.with(scope1, async () => {
          assert.strictEqual(contextManager.active(), scope1);
          await new Promise(resolve => setTimeout(resolve, 100));
          assert.strictEqual(contextManager.active(), scope1);
          return done();
        });
        assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
      });

      it('should correctly restore context using async/await', async () => {
        const scope1 = '1' as any;
        const scope2 = '2' as any;
        const scope3 = '3' as any;
        const scope4 = '4' as any;

        await contextManager.with(scope1, async () => {
          assert.strictEqual(contextManager.active(), scope1);
          await contextManager.with(scope2, async () => {
            assert.strictEqual(contextManager.active(), scope2);
            await contextManager.with(scope3, async () => {
              assert.strictEqual(contextManager.active(), scope3);
              await contextManager.with(scope4, async () => {
                assert.strictEqual(contextManager.active(), scope4);
              });
              assert.strictEqual(contextManager.active(), scope3);
            });
            assert.strictEqual(contextManager.active(), scope2);
          });
          assert.strictEqual(contextManager.active(), scope1);
        });
        assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
      });

      it('should works with multiple concurrent operations', done => {
        const scope1 = '1' as any;
        const scope2 = '2' as any;
        const scope3 = '3' as any;
        const scope4 = '4' as any;
        let scope4Called = false;

        contextManager.with(scope1, async () => {
          assert.strictEqual(contextManager.active(), scope1);
          setTimeout(async () => {
            await contextManager.with(scope3, async () => {
              assert.strictEqual(contextManager.active(), scope3);
            });
            assert.strictEqual(contextManager.active(), scope1);
            assert.strictEqual(scope4Called, true);
            return done();
          }, 100);
          assert.strictEqual(contextManager.active(), scope1);
        });
        assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
        contextManager.with(scope2, async () => {
          assert.strictEqual(contextManager.active(), scope2);
          setTimeout(() => {
            contextManager.with(scope4, async () => {
              assert.strictEqual(contextManager.active(), scope4);
              scope4Called = true;
            });
            assert.strictEqual(contextManager.active(), scope2);
          }, 20);
          assert.strictEqual(contextManager.active(), scope2);
        });
        assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
      });

      it('should work with timers using the same timeout', done => {
        let cnt = 3;
        function countDown() {
          cnt--;
          if (cnt === 0) done();
          if (cnt < 0) throw new Error('too many calls to countDown()');
        }

        const time1 = 2;
        const time2 = time1 + 1;
        const rootCtx = contextManager.active();
        const innerCtx = rootCtx.setValue(Symbol('test'), 23);
        contextManager.with(innerCtx, () => {
          setTimeout(() => {
            assert.strictEqual(contextManager.active(), innerCtx);
            countDown();
          }, time1);
        });
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), rootCtx);
          countDown();
        }, time1);
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), rootCtx);
          countDown();
        }, time2);
      });
    });

    describe('.bind(function)', () => {
      it('should return the same target (when enabled)', () => {
        const test = { a: 1 };
        assert.deepStrictEqual(
          contextManager.bind(test, Context.ROOT_CONTEXT),
          test
        );
      });

      it('should return the same target (when disabled)', () => {
        contextManager.disable();
        const test = { a: 1 };
        assert.deepStrictEqual(
          contextManager.bind(test, Context.ROOT_CONTEXT),
          test
        );
        contextManager.enable();
      });

      it('should return current context (when enabled)', done => {
        const context = Context.ROOT_CONTEXT.setValue(key1, 1);
        const fn = contextManager.bind(() => {
          assert.strictEqual(
            contextManager.active(),
            context,
            'should have context'
          );
          return done();
        }, context);
        fn();
      });

      /**
       * Even if asynchooks is disabled, the context propagation will
       * still works but it might be lost after any async op.
       */
      it('should return current context (when disabled)', done => {
        contextManager.disable();
        const context = Context.ROOT_CONTEXT.setValue(key1, 1);
        const fn = contextManager.bind(() => {
          assert.strictEqual(
            contextManager.active(),
            context,
            'should have context'
          );
          return done();
        }, context);
        fn();
      });

      it('should fail to return current context with async op', done => {
        const context = Context.ROOT_CONTEXT.setValue(key1, 1);
        const fn = contextManager.bind(() => {
          assert.strictEqual(contextManager.active(), context);
          setTimeout(() => {
            assert.strictEqual(
              contextManager.active(),
              context,
              'should have no context'
            );
            return done();
          }, 100);
        }, context);
        fn();
      });
    });

    describe('.bind(event-emitter)', () => {
      it('should return the same target (when enabled)', () => {
        const ee = new EventEmitter();
        assert.deepStrictEqual(
          contextManager.bind(ee, Context.ROOT_CONTEXT),
          ee
        );
      });

      it('should return the same target (when disabled)', () => {
        const ee = new EventEmitter();
        contextManager.disable();
        assert.deepStrictEqual(
          contextManager.bind(ee, Context.ROOT_CONTEXT),
          ee
        );
      });

      it('should return current context and removeListener (when enabled)', done => {
        const ee = new EventEmitter();
        const context = Context.ROOT_CONTEXT.setValue(key1, 1);
        const patchedEe = contextManager.bind(ee, context);
        const handler = () => {
          assert.deepStrictEqual(contextManager.active(), context);
          patchedEe.removeListener('test', handler);
          assert.strictEqual(patchedEe.listeners('test').length, 0);
          return done();
        };
        patchedEe.on('test', handler);
        assert.strictEqual(patchedEe.listeners('test').length, 1);
        patchedEe.emit('test');
      });

      it('should return current context and removeAllListener (when enabled)', done => {
        const ee = new EventEmitter();
        const context = Context.ROOT_CONTEXT.setValue(key1, 1);
        const patchedEe = contextManager.bind(ee, context);
        const handler = () => {
          assert.deepStrictEqual(contextManager.active(), context);
          patchedEe.removeAllListeners('test');
          assert.strictEqual(patchedEe.listeners('test').length, 0);
          return done();
        };
        patchedEe.on('test', handler);
        assert.strictEqual(patchedEe.listeners('test').length, 1);
        patchedEe.emit('test');
      });

      /**
       * Even if asynchooks is disabled, the context propagation will
       * still works but it might be lost after any async op.
       */
      it('should return context (when disabled)', done => {
        contextManager.disable();
        const ee = new EventEmitter();
        const context = Context.ROOT_CONTEXT.setValue(key1, 1);
        const patchedEe = contextManager.bind(ee, context);
        const handler = () => {
          assert.deepStrictEqual(contextManager.active(), context);
          patchedEe.removeListener('test', handler);
          assert.strictEqual(patchedEe.listeners('test').length, 0);
          return done();
        };
        patchedEe.on('test', handler);
        assert.strictEqual(patchedEe.listeners('test').length, 1);
        patchedEe.emit('test');
      });

      it('should not return current context with async op', done => {
        const ee = new EventEmitter();
        const context = Context.ROOT_CONTEXT.setValue(key1, 1);
        const patchedEe = contextManager.bind(ee, context);
        const handler = () => {
          assert.deepStrictEqual(contextManager.active(), context);
          setImmediate(() => {
            assert.deepStrictEqual(contextManager.active(), context);
            patchedEe.removeAllListeners('test');
            assert.strictEqual(patchedEe.listeners('test').length, 0);
            return done();
          });
        };
        patchedEe.on('test', handler);
        assert.strictEqual(patchedEe.listeners('test').length, 1);
        patchedEe.emit('test');
      });
    });
  });
}
