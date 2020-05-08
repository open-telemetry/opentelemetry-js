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
import { AsyncHooksContextManager } from '../src';
import { EventEmitter } from 'events';
import { Context } from '@opentelemetry/context-base';

describe('AsyncHooksContextManager', () => {
  let contextManager: AsyncHooksContextManager;
  const key1 = Context.createKey('test key 1');

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager();
    contextManager.enable();
  });

  afterEach(() => {
    contextManager.disable();
  });

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        contextManager = new AsyncHooksContextManager();
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
  });

  describe('.withAsync()', () => {
    it('should run the callback', async () => {
      let done = false;
      await contextManager.withAsync(Context.ROOT_CONTEXT, async () => {
        done = true;
      });

      assert.ok(done);
    });

    it('should run the callback with active scope', async () => {
      const test = Context.ROOT_CONTEXT.setValue(key1, 1);
      await contextManager.withAsync(test, async () => {
        assert.strictEqual(contextManager.active(), test, 'should have scope');
      });
    });

    it('should run the callback (when disabled)', async () => {
      contextManager.disable();
      let done = false;
      await contextManager.withAsync(Context.ROOT_CONTEXT, async () => {
        done = true;
      });

      assert.ok(done);
    });

    it('should rethrow errors', async () => {
      contextManager.disable();
      let done = false;
      const err = new Error();

      try {
        await contextManager.withAsync(Context.ROOT_CONTEXT, async () => {
          throw err;
        });
      } catch (e) {
        assert.ok(e === err);
        done = true;
      }

      assert.ok(done);
    });

    it('should finally restore an old scope', async () => {
      const scope1 = '1' as any;
      const scope2 = '2' as any;
      let done = false;

      await contextManager.withAsync(scope1, async () => {
        assert.strictEqual(contextManager.active(), scope1);
        await contextManager.withAsync(scope2, async () => {
          assert.strictEqual(contextManager.active(), scope2);
          done = true;
        });
        assert.strictEqual(contextManager.active(), scope1);
      });

      assert.ok(done);
    });
  });

  describe('.withAsync/with()', () => {
    it('with() inside withAsync() should correctly restore context', async () => {
      const scope1 = '1' as any;
      const scope2 = '2' as any;
      let done = false;

      await contextManager.withAsync(scope1, async () => {
        assert.strictEqual(contextManager.active(), scope1);
        contextManager.with(scope2, () => {
          assert.strictEqual(contextManager.active(), scope2);
          done = true;
        });
        assert.strictEqual(contextManager.active(), scope1);
      });

      assert.ok(done);
    });

    it('withAsync() inside with() should correctly restore conxtext', done => {
      const scope1 = '1' as any;
      const scope2 = '2' as any;

      contextManager.with(scope1, async () => {
        assert.strictEqual(contextManager.active(), scope1);
        await contextManager.withAsync(scope2, async () => {
          assert.strictEqual(contextManager.active(), scope2);
        });
        assert.strictEqual(contextManager.active(), scope1);
        return done();
      });
      assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
    });

    it('not awaited withAsync() inside with() should not restore context', done => {
      const scope1 = '1' as any;
      const scope2 = '2' as any;
      let _done: boolean = false;

      contextManager.with(scope1, () => {
        assert.strictEqual(contextManager.active(), scope1);
        contextManager
          .withAsync(scope2, async () => {
            assert.strictEqual(contextManager.active(), scope2);
          })
          .then(() => {
            assert.strictEqual(contextManager.active(), scope1);
            _done = true;
          });
        // in this case the current scope is 2 since we
        // didnt waited the withAsync call
        assert.strictEqual(contextManager.active(), scope2);
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), scope1);
          assert(_done);
          return done();
        }, 100);
      });
      assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
    });

    it('withAsync() inside a setTimeout inside a with() should correctly restore context', done => {
      const scope1 = '1' as any;
      const scope2 = '2' as any;

      contextManager.with(scope1, () => {
        assert.strictEqual(contextManager.active(), scope1);
        setTimeout(() => {
          assert.strictEqual(contextManager.active(), scope1);
          contextManager
            .withAsync(scope2, async () => {
              assert.strictEqual(contextManager.active(), scope2);
            })
            .then(() => {
              assert.strictEqual(contextManager.active(), scope1);
              return done();
            });
        }, 5);
        assert.strictEqual(contextManager.active(), scope1);
      });
      assert.strictEqual(contextManager.active(), Context.ROOT_CONTEXT);
    });

    it('with() inside a setTimeout inside withAsync() should correctly restore context', done => {
      const scope1 = '1' as any;
      const scope2 = '2' as any;

      contextManager
        .withAsync(scope1, async () => {
          assert.strictEqual(contextManager.active(), scope1);
          setTimeout(() => {
            assert.strictEqual(contextManager.active(), scope1);
            contextManager.with(scope2, () => {
              assert.strictEqual(contextManager.active(), scope2);
              return done();
            });
          }, 5);
          assert.strictEqual(contextManager.active(), scope1);
        })
        .then(() => {
          assert.strictEqual(contextManager.active(), scope1);
        });
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

    it('should fail to return current context (when disabled + async op)', done => {
      contextManager.disable();
      const context = Context.ROOT_CONTEXT.setValue(key1, 1);
      const fn = contextManager.bind(() => {
        setTimeout(() => {
          assert.strictEqual(
            contextManager.active(),
            Context.ROOT_CONTEXT,
            'should have no context'
          );
          return done();
        }, 100);
      }, context);
      fn();
    });

    it('should return current context (when re-enabled + async op)', done => {
      contextManager.enable();
      const context = Context.ROOT_CONTEXT.setValue(key1, 1);
      const fn = contextManager.bind(() => {
        setTimeout(() => {
          assert.strictEqual(
            contextManager.active(),
            context,
            'should have context'
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
      assert.deepStrictEqual(contextManager.bind(ee, Context.ROOT_CONTEXT), ee);
    });

    it('should return the same target (when disabled)', () => {
      const ee = new EventEmitter();
      contextManager.disable();
      assert.deepStrictEqual(contextManager.bind(ee, Context.ROOT_CONTEXT), ee);
      contextManager.enable();
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
        contextManager.enable();
        return done();
      };
      patchedEe.on('test', handler);
      assert.strictEqual(patchedEe.listeners('test').length, 1);
      patchedEe.emit('test');
    });

    it('should not return current context (when disabled + async op)', done => {
      contextManager.disable();
      const ee = new EventEmitter();
      const context = Context.ROOT_CONTEXT.setValue(key1, 1);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
        setImmediate(() => {
          assert.deepStrictEqual(contextManager.active(), Context.ROOT_CONTEXT);
          patchedEe.removeAllListeners('test');
          assert.strictEqual(patchedEe.listeners('test').length, 0);
          return done();
        });
      };
      patchedEe.on('test', handler);
      assert.strictEqual(patchedEe.listeners('test').length, 1);
      patchedEe.emit('test');
    });

    it('should return current context (when enabled + async op)', done => {
      contextManager.enable();
      const ee = new EventEmitter();
      const context = Context.ROOT_CONTEXT.setValue(key1, 1);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
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
