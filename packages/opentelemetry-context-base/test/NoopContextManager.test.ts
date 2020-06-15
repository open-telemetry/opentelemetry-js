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
import { NoopContextManager, Context } from '../src';

describe('NoopContextManager', () => {
  let contextManager: NoopContextManager;

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        contextManager = new NoopContextManager();
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
    it('should run the callback (Context.ROOT_CONTEXT as target)', done => {
      contextManager.with(Context.ROOT_CONTEXT, done);
    });

    it('should run the callback (object as target)', done => {
      const key = Context.createKey('test key 1');
      const test = Context.ROOT_CONTEXT.setValue(key, 1);
      contextManager.with(test, () => {
        assert.strictEqual(
          contextManager.active(),
          Context.ROOT_CONTEXT,
          'should not have context'
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
  });

  describe('.active()', () => {
    it('should always return Context.ROOT_CONTEXT (when enabled)', () => {
      assert.strictEqual(
        contextManager.active(),
        Context.ROOT_CONTEXT,
        'should not have context'
      );
    });

    it('should always return Context.ROOT_CONTEXT (when disabled)', () => {
      contextManager.disable();
      assert.strictEqual(
        contextManager.active(),
        Context.ROOT_CONTEXT,
        'should not have context'
      );
      contextManager.enable();
    });
  });

  describe('.bind()', () => {
    it('should return the same target (when enabled)', () => {
      const test = { a: 1 };
      assert.deepStrictEqual(contextManager.bind(test), test);
    });

    it('should return the same target (when disabled)', () => {
      contextManager.disable();
      const test = { a: 1 };
      assert.deepStrictEqual(contextManager.bind(test), test);
      contextManager.enable();
    });
  });
});
