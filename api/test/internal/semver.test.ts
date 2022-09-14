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
import {
  isCompatible,
  _makeCompatibilityCheck,
} from '../../src/internal/semver';
import { VERSION } from '../../src/version';

describe('semver', () => {
  it('should be compatible if versions are equal', () => {
    assert.ok(isCompatible(VERSION));
  });

  it('returns false if own version cannot be parsed', () => {
    const check = _makeCompatibilityCheck('this is not semver');
    assert.ok(!check('1.0.0'));
  });

  it('incompatible if other version cannot be parsed', () => {
    const check = _makeCompatibilityCheck('0.1.2');
    assert.ok(!check('this is not semver'));
  });

  describe('>= 1.0.0', () => {
    const globalVersion = '5.5.5';
    const vers: [string, boolean][] = [
      // same major/minor run should be compatible
      ['5.5.5', true],
      ['5.5.6', true],
      ['5.5.4', true],

      // prerelease version should not be compatible
      ['5.5.5-rc.0', false],

      // if our version has a minor version increase, we may try to call methods which don't exist on the global
      ['5.6.5', false],
      ['5.6.6', false],
      ['5.6.4', false],

      // if the global version is ahead of us by a minor revision, it has at least the methods we know about
      ['5.4.5', true],
      ['5.4.6', true],
      ['5.4.4', true],

      // major version mismatch is always incompatible
      ['6.5.5', false],
      ['6.5.6', false],
      ['6.5.4', false],
      ['6.6.5', false],
      ['6.6.6', false],
      ['6.6.4', false],
      ['6.4.5', false],
      ['6.4.6', false],
      ['6.4.4', false],
      ['4.5.5', false],
      ['4.5.6', false],
      ['4.5.4', false],
      ['4.6.5', false],
      ['4.6.6', false],
      ['4.6.4', false],
      ['4.4.5', false],
      ['4.4.6', false],
      ['4.4.4', false],
    ];

    test(globalVersion, vers);
  });

  describe('< 1.0.0', () => {
    const globalVersion = '0.5.5';
    const vers: [string, boolean][] = [
      // same minor/patch should be compatible
      ['0.5.5', true],

      // prerelease version should not be compatible
      ['0.5.5-rc.0', false],

      // if our version has a patch version increase, we may try to call methods which don't exist on the global
      ['0.5.6', false],

      // if the global version is ahead of us by a patch revision, it has at least the methods we know about
      ['0.5.4', true],

      // minor version mismatch is always incompatible
      ['0.6.5', false],
      ['0.6.6', false],
      ['0.6.4', false],
      ['0.4.5', false],
      ['0.4.6', false],
      ['0.4.4', false],

      // major version mismatch is always incompatible
      ['1.5.5', false],
      ['1.5.6', false],
      ['1.5.4', false],
      ['1.6.5', false],
      ['1.6.6', false],
      ['1.6.4', false],
      ['1.4.5', false],
      ['1.4.6', false],
      ['1.4.4', false],
    ];

    test(globalVersion, vers);
  });

  describe('global version is prerelease', () => {
    const globalVersion = '1.0.0-rc.3';
    const vers: [string, boolean][] = [
      // must match exactly
      ['1.0.0', false],
      ['1.0.0-rc.2', false],
      ['1.0.0-rc.4', false],

      ['1.0.0-rc.3', true],
    ];

    test(globalVersion, vers);
  });
});

function test(globalVersion: string, vers: [string, boolean][]) {
  describe(`global version is ${globalVersion}`, () => {
    for (const [version, compatible] of vers) {
      it(`API version ${version} ${
        compatible ? 'should' : 'should not'
      } be able to access global`, () => {
        const check = _makeCompatibilityCheck(version);
        assert.strictEqual(check(globalVersion), compatible);
      });
    }
  });
}
