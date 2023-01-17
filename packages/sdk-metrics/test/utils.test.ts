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

import * as sinon from 'sinon';
import * as assert from 'assert';
import {
  binarySearchLB,
  callWithTimeout,
  hashAttributes,
  TimeoutError,
} from '../src/utils';
import { assertRejects } from './test-utils';
import { MetricAttributes } from '@opentelemetry/api';

describe('utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('callWithTimeout', () => {
    it('should reject if given promise not settled before timeout', async () => {
      sinon.useFakeTimers();
      const promise = new Promise(() => {
        /** promise never settles */
      });
      assertRejects(callWithTimeout(promise, 100), TimeoutError);
    });
  });

  describe('hashAttributes', () => {
    it('should hash all types of attribute values', () => {
      const cases: [MetricAttributes, string][] = [
        [{ string: 'bar' }, '[["string","bar"]]'],
        [{ number: 1 }, '[["number",1]]'],
        [{ false: false, true: true }, '[["false",false],["true",true]]'],
        [
          { arrayOfString: ['foo', 'bar'] },
          '[["arrayOfString",["foo","bar"]]]',
        ],
        [{ arrayOfNumber: [1, 2] }, '[["arrayOfNumber",[1,2]]]'],
        [{ arrayOfBool: [false, true] }, '[["arrayOfBool",[false,true]]]'],
        [{ undefined: undefined }, '[["undefined",null]]'],
        [{ arrayOfHoles: [undefined, null] }, '[["arrayOfHoles",[null,null]]]'],
      ];

      for (const [idx, it] of cases.entries()) {
        assert.strictEqual(
          hashAttributes(it[0]),
          it[1],
          `cases[${idx}] failed`
        );
      }
    });
  });

  describe('binarySearchLB', () => {
    const tests = [
      /** [ arr, value, expected lb idx ] */
      [[0, 10, 100, 1000], -1, -1],
      [[0, 10, 100, 1000], 0, 0],
      [[0, 10, 100, 1000], 1, 0],
      [[0, 10, 100, 1000], 10, 1],
      [[0, 10, 100, 1000], 1000, 3],
      [[0, 10, 100, 1000], 1001, 3],

      [[0, 10, 100, 1000, 10_000], -1, -1],
      [[0, 10, 100, 1000, 10_000], 0, 0],
      [[0, 10, 100, 1000, 10_000], 10, 1],
      [[0, 10, 100, 1000, 10_000], 1001, 3],
      [[0, 10, 100, 1000, 10_000], 10_001, 4],
    ] as [number[], number, number][];

    for (const [idx, test] of tests.entries()) {
      it(`test idx(${idx}): find lb of ${test[1]} in [${test[0]}]`, () => {
        assert.strictEqual(binarySearchLB(test[0], test[1]), test[2]);
      });
    }
  });
});
