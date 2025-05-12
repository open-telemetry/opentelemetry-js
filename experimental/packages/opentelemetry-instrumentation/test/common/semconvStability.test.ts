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

import { inspect } from 'util';
import * as assert from 'assert';
import {
  SemconvStability,
  httpSemconvStabilityFromStr,
  databaseSemconvStabilityFromStr,
  messagingSemconvStabilityFromStr,
} from '../../src';

describe('httpSemconvStabilityFromStr', function () {
  const table = [
    { str: undefined, expected: SemconvStability.OLD },
    { str: '', expected: SemconvStability.OLD },
    { str: 'http', expected: SemconvStability.STABLE },
    { str: 'http/dup', expected: SemconvStability.DUPLICATE },
    { str: ', http/dup,bar', expected: SemconvStability.DUPLICATE },
    { str: ', http/dup\t ,blah', expected: SemconvStability.DUPLICATE },
    { str: 'database', expected: SemconvStability.OLD },
    { str: 'just,bogus,values', expected: SemconvStability.OLD },
  ];
  for (const { str, expected } of table) {
    it(`str: ${inspect(str)}`, function () {
      assert.strictEqual(httpSemconvStabilityFromStr(str), expected);
    });
  }
});

describe('databaseSemconvStabilityFromStr', function () {
  const table = [
    { str: undefined, expected: SemconvStability.OLD },
    { str: '', expected: SemconvStability.OLD },
    { str: 'database', expected: SemconvStability.STABLE },
    { str: 'database/dup', expected: SemconvStability.DUPLICATE },
    { str: ', database/dup,bar', expected: SemconvStability.DUPLICATE },
    { str: ', database/dup\t ,blah', expected: SemconvStability.DUPLICATE },
    { str: 'http', expected: SemconvStability.OLD },
    { str: 'just,bogus,values', expected: SemconvStability.OLD },
  ];
  for (const { str, expected } of table) {
    it(`str: ${inspect(str)}`, function () {
      assert.strictEqual(databaseSemconvStabilityFromStr(str), expected);
    });
  }
});

describe('messagingSemconvStabilityFromStr', function () {
  const table = [
    { str: undefined, expected: SemconvStability.OLD },
    { str: '', expected: SemconvStability.OLD },
    { str: 'messaging', expected: SemconvStability.STABLE },
    { str: 'messaging/dup', expected: SemconvStability.DUPLICATE },
    { str: ', messaging/dup,bar', expected: SemconvStability.DUPLICATE },
    { str: ', messaging/dup\t ,blah', expected: SemconvStability.DUPLICATE },
    { str: 'http', expected: SemconvStability.OLD },
    { str: 'just,bogus,values', expected: SemconvStability.OLD },
  ];
  for (const { str, expected } of table) {
    it(`str: ${inspect(str)}`, function () {
      assert.strictEqual(messagingSemconvStabilityFromStr(str), expected);
    });
  }
});
