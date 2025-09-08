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
