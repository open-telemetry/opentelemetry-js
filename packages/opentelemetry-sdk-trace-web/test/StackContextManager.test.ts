/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContextKey, ROOT_CONTEXT } from '@opentelemetry/api';
import * as assert from 'assert';
import { StackContextManager } from '../src';

describe('StackContextManager', function () {
  let contextManager: StackContextManager;
  const key1 = createContextKey('test key 1');

  beforeEach(() => {
    contextManager = new StackContextManager();
    contextManager.enable();
  });

  afterEach(() => {
    contextManager.disable();
  });

  describe('.enable()', function () {
    it('should work', function () {
      assert.doesNotThrow(() => {
        assert.ok(
          contextManager.enable() === contextManager,
          'should return this'
        );
        assert.ok(
          contextManager.active() === ROOT_CONTEXT,
          'should have root context'
        );
      });
    });
  });

  describe('.disable()', function () {
    it('should work', function () {
      assert.doesNotThrow(() => {
        assert.ok(
          contextManager.disable() === contextManager,
          'should return this'
        );
        assert.ok(
          contextManager.active() === ROOT_CONTEXT,
          'should have no context'
        );
      });
    });
  });

  describe('.with()', function () {
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

    it('should finally restore an old context', done => {
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
        return done();
      });
      assert.strictEqual(contextManager.active(), globalThis);
    });

    it('should finally restore an old context when context is an object', done => {
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
        return done();
      });
      assert.strictEqual(contextManager.active(), globalThis);
    });

    it('should forward this, arguments and return value', function () {
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
  });

  describe('.bind(function)', function () {
    it('should call the function with previously assigned context', function () {
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

    it('should return the same target (when enabled)', function () {
      const test = ROOT_CONTEXT.setValue(key1, 1);
      assert.deepStrictEqual(
        contextManager.bind(contextManager.active(), test),
        test
      );
    });

    it('should return the same target (when disabled)', function () {
      contextManager.disable();
      const test = ROOT_CONTEXT.setValue(key1, 1);
      assert.deepStrictEqual(
        contextManager.bind(contextManager.active(), test),
        test
      );
      contextManager.enable();
    });

    it('should return current context (when enabled)', done => {
      const context = ROOT_CONTEXT.setValue(key1, 1);
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

    it('should return current context (when disabled)', done => {
      contextManager.disable();
      const context = ROOT_CONTEXT.setValue(key1, 1);
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
  });
});
