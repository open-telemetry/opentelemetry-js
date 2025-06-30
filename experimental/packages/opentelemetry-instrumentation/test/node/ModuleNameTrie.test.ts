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
import { Hooked } from '../../src/platform/node/RequireInTheMiddleSingleton';
import { ModuleNameTrie } from '../../src/platform/node/ModuleNameTrie';

describe('ModuleNameTrie', function () {
  describe('search', function () {
    const trie = new ModuleNameTrie();
    const inserts = [
      { moduleName: 'a', onRequire: () => {} },
      { moduleName: 'a/b', onRequire: () => {} },
      { moduleName: 'a', onRequire: () => {} },
      { moduleName: 'a/c', onRequire: () => {} },
      { moduleName: 'd', onRequire: () => {} },
    ] as Hooked[];
    inserts.forEach(trie.insert.bind(trie));

    it('should return a list of exact matches (no results)', function () {
      assert.deepEqual(trie.search('e'), []);
    });

    it('should return a list of exact matches (one result)', function () {
      assert.deepEqual(trie.search('d'), [inserts[4]]);
    });

    it('should return a list of exact matches (more than one result)', function () {
      assert.deepEqual(trie.search('a'), [inserts[0], inserts[2]]);
    });

    describe('maintainInsertionOrder = false', function () {
      it('should return a list of matches in prefix order', function () {
        assert.deepEqual(trie.search('a/b'), [
          inserts[0],
          inserts[2],
          inserts[1],
        ]);
      });
    });

    describe('maintainInsertionOrder = true', function () {
      it('should return a list of matches in insertion order', function () {
        assert.deepEqual(trie.search('a/b', { maintainInsertionOrder: true }), [
          inserts[0],
          inserts[1],
          inserts[2],
        ]);
      });
    });

    describe('fullOnly = false', function () {
      it('should return a list of matches for prefixes', function () {
        assert.deepEqual(trie.search('a/b'), [
          inserts[0],
          inserts[2],
          inserts[1],
        ]);
      });
    });

    describe('fullOnly = true', function () {
      it('should return a list of matches for full values only', function () {
        assert.deepEqual(trie.search('a', { fullOnly: true }), [
          inserts[0],
          inserts[2],
        ]);
        assert.deepEqual(trie.search('a/b', { fullOnly: true }), [inserts[1]]);
        assert.deepEqual(trie.search('e', { fullOnly: true }), []);
        assert.deepEqual(trie.search('a/b/e', { fullOnly: true }), []);
      });
    });
  });
});
