/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { Deferred } from '../../../src/utils/promise';

describe('promise', () => {
  describe('Deferred', () => {
    it('should resolve', async () => {
      const deferred = new Deferred();
      deferred.resolve(1);
      deferred.resolve(2);
      deferred.reject(new Error('foo'));

      const ret = await deferred.promise;
      assert.strictEqual(ret, 1);
    });

    it('should reject', async () => {
      const deferred = new Deferred();
      deferred.reject(new Error('foo'));
      deferred.reject(new Error('bar'));

      await assert.rejects(deferred.promise, /foo/);
    });
  });
});
