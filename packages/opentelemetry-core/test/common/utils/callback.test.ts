/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
