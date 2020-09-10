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
import { deepMerge } from '../../src/utils/deep-merge';

describe('deepMerge', () => {
  it('should deep merge two objects', () => {
    const target = { a: 1, b: 1, d: 1, e: [4, 5, 6], f: { g: 1, h: 2 } };
    const source = { a: 1, b: 2, c: 2, e: [1], f: { h: 1, i: 1 } };
    const expected = {
      a: 1,
      b: 2,
      c: 2,
      d: 1,
      e: [1],
      f: { g: 1, h: 1, i: 1 },
    };
    const merged = deepMerge(target, source);
    assert.deepEqual(merged, expected);
  });

  it('should replace array-props', () => {
    const target = { a: [4, 5, 6] };
    const source = { a: [1] };
    const expected = {
      a: [1],
    };
    const merged = deepMerge(target, source);
    assert.deepEqual(merged, expected);
  });

  it('should override a primitive target prop by a structural source prop', () => {
    const merged = deepMerge({ a: 1, b: 'c' }, { a: { b: 1 }, b: [{ d: 1 }] });
    assert.deepEqual(merged, { a: { b: 1 }, b: [{ d: 1 }] });
  });

  it('should nullify and undefine as per source props', () => {
    const target = { a: 1, b: 1, d: 1, e: [4, 5, 6], f: { g: 1, h: 2 } };
    const source = {
      a: null,
      b: undefined,
      c: 2,
      e: [1, null, undefined],
      f: { h: null, i: undefined },
    };
    const expected = {
      a: null,
      b: undefined,
      c: 2,
      d: 1,
      e: [1, null, undefined],
      f: { g: 1, h: null, i: undefined },
    };
    const merged = deepMerge(target, source);
    assert.deepEqual(merged, expected);
  });

  it('should respect the max depth', () => {
    assert.throws(() => {
      deepMerge(
        { a: { a: { a: { a: { a: { a: 1 } } } } } },
        { a: { a: { a: { a: { a: { a: 1 } } } } } },
        5
      );
    });
  });
});
