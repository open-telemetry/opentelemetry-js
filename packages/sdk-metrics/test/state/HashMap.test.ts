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
import { Attributes } from '@opentelemetry/api';
import { HashMap } from '../../src/state/HashMap';
import { hashAttributes } from '../../src/utils';

describe('HashMap', () => {
  describe('set & get', () => {
    it('should get and set with attributes', () => {
      const map = new HashMap<Attributes, number, string>(hashAttributes);
      const hash = hashAttributes({ foo: 'bar' });

      map.set({ foo: 'bar' }, 1);
      // get with pinned hash code
      assert.strictEqual(map.get({}, hash), 1);
      // get with attributes object.
      assert.strictEqual(map.get({ foo: 'bar' }), 1);

      map.set({}, 2, hash);
      // get with pinned hash code
      assert.strictEqual(map.get({}, hash), 2);
      // get with attributes object.
      assert.strictEqual(map.get({ foo: 'bar' }), 2);
    });
  });

  describe('has', () => {
    it('should return if the key exists in the value map', () => {
      const map = new HashMap<Attributes, number, string>(hashAttributes);
      const hash = hashAttributes({ foo: 'bar' });

      // with pinned hash code
      assert.strictEqual(map.has({}, hash), false);
      assert.strictEqual(map.has({ foo: 'bar' }, hash), false);

      map.set({ foo: 'bar' }, 1);
      // with pinned hash code
      assert.strictEqual(map.has({}, hash), true);
      // with attributes object.
      assert.strictEqual(map.has({ foo: 'bar' }), true);
    });
  });

  describe('entries', () => {
    it('iterating with entries', () => {
      const map = new HashMap<Attributes, number, string>(hashAttributes);
      map.set({ foo: '1' }, 1);
      map.set({ foo: '2' }, 2);
      map.set({ foo: '3' }, 3);
      map.set({ foo: '4' }, 4);

      const entries = Array.from(map.entries());
      assert.deepStrictEqual(entries, [
        [{ foo: '1' }, 1, hashAttributes({ foo: '1' })],
        [{ foo: '2' }, 2, hashAttributes({ foo: '2' })],
        [{ foo: '3' }, 3, hashAttributes({ foo: '3' })],
        [{ foo: '4' }, 4, hashAttributes({ foo: '4' })],
      ]);
    });
  });
});
