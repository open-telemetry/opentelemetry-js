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
import { parseRetryAfterToMills } from '../../src/is-export-retryable';

describe('parseRetryAfterToMills', function () {
  // now: 2023-01-20T00:00:00.000Z
  const tests = [
    [null, undefined],
    // duration
    ['-100', -1],
    ['1000', 1000 * 1000],
    // future timestamp
    ['Fri, 20 Jan 2023 00:00:01 GMT', 1000],
    // Past timestamp
    ['Fri, 19 Jan 2023 23:59:59 GMT', 0],
  ] as [string | null, number][];

  afterEach(() => {
    sinon.restore();
  });

  for (const [value, expect] of tests) {
    it(`test ${value}`, () => {
      sinon.useFakeTimers({
        now: new Date('2023-01-20T00:00:00.000Z'),
      });
      assert.strictEqual(parseRetryAfterToMills(value), expect);
    });
  }
});
