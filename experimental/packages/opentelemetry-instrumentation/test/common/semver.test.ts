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

// These tests are added as mirror (to be sure that we are compatible)
// of the actual `semver` package `satisfies` tests here:
// https://github.com/npm/node-semver/blob/main/test/functions/satisfies.js

import * as assert from 'assert';

import { satisfies, SatisfiesOptions } from '../../src/semver';

const rangeInclude = require('./fixtures/semver-range-include.js');
const rangeExclude = require('./fixtures/semver-range-exclude.js');

describe('SemVer', () => {
  describe('satisfies', () => {
    it('when range is included', () => {
      rangeInclude.forEach(
        ([range, ver, options]: [string, string, SatisfiesOptions]) => {
          assert.ok(
            satisfies(ver, range, options),
            `${range} satisfied by ${ver}`
          );
        }
      );
    });
    it('when range is not included', () => {
      rangeExclude.forEach(
        ([range, ver, options]: [string, string, SatisfiesOptions]) => {
          assert.ok(
            !satisfies(ver, range, options),
            `${range} not satisfied by ${ver}`
          );
        }
      );
    });
    it('invalid ranges never satisfied (but do not throw)', () => {
      const cases = [
        ['blerg', '1.2.3'],
        ['git+https://user:password0123@github.com/foo', '123.0.0', true],
        ['^1.2.3', '2.0.0-pre'],
        ['0.x', undefined],
        ['*', undefined],
      ];
      cases.forEach(([range, ver]) => {
        assert.ok(
          !satisfies(ver as any, range as any),
          `${range} not satisfied because invalid`
        );
      });
    });
  });
});
