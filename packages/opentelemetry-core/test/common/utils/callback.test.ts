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
import * as sinon from 'sinon';
import { BindOnceFuture } from '../../../src';

describe('callback', () => {
  describe('BindOnceFuture', () => {
    it('should call once', async () => {
      const stub = sinon.stub();
      const that = {};
      const future = new BindOnceFuture(stub, that);

      await Promise.all([future.call(1), future.call(2)]);
      await future.call(3);
      await future.promise;

      assert.strictEqual(stub.callCount, 1);
      assert.deepStrictEqual(stub.firstCall.args, [1]);
      assert.deepStrictEqual(stub.firstCall.thisValue, that);

      assert.ok(future.isCalled);
    });

    it('should handle thrown errors', async () => {
      const stub = sinon.stub();
      stub.throws(new Error('foo'));
      const future = new BindOnceFuture(stub, undefined);

      await assert.rejects(future.call(), /foo/);
      await assert.rejects(future.call(), /foo/);
      await assert.rejects(future.promise, /foo/);
    });

    it('should handle rejections', async () => {
      const stub = sinon.stub();
      stub.rejects(new Error('foo'));
      const future = new BindOnceFuture(stub, undefined);

      await assert.rejects(future.call(), /foo/);
      await assert.rejects(future.call(), /foo/);
      await assert.rejects(future.promise, /foo/);
    });
  });
});
