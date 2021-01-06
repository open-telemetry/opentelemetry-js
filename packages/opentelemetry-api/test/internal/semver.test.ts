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

describe('Version Compatibility', () => {
  it('should be compatible if versions are equal', () => {
    assert.ok(isCompatible(VERSION));
  });

  describe('throws if own version cannot be parsed', () => {
    assert.throws(() => {
      _makeCompatibilityCheck('this is not semver');
    });
  });

  describe('incompatible if other version cannot be parsed', () => {
    const check = _makeCompatibilityCheck('0.1.2');
    assert.ok(!check('this is not semver'));
  });

  describe('>= 1.x', () => {
    it('should be compatible if major and minor versions are equal', () => {
      const check = _makeCompatibilityCheck('1.2.3');
      assert.ok(check('1.2.2'));
      assert.ok(check('1.2.2-alpha'));
      assert.ok(check('1.2.4'));
      assert.ok(check('1.2.4-alpha'));
    });

    it('should be compatible if major versions are equal and minor version is lesser', () => {
      const check = _makeCompatibilityCheck('1.2.3');
      assert.ok(check('1.1.2'));
      assert.ok(check('1.1.2-alpha'));
      assert.ok(check('1.1.4'));
      assert.ok(check('1.1.4-alpha'));
    });

    it('should be incompatible if major versions do not match', () => {
      const check = _makeCompatibilityCheck('3.3.3');
      assert.ok(!check('0.3.3'));
      assert.ok(!check('0.3.3'));
    });

    it('should be incompatible if major versions match but other minor version is greater than our minor version', () => {
      const check = _makeCompatibilityCheck('1.2.3');
      assert.ok(!check('1.3.3-alpha'));
      assert.ok(!check('1.3.3'));
    });
  });

  describe('0.x', () => {
    it('should be compatible if minor and patch versions are equal', () => {
      const check = _makeCompatibilityCheck('0.1.2');
      assert.ok(check('0.1.2'));
      assert.ok(check('0.1.2-alpha'));
    });

    it('should be compatible if minor versions are equal and patch version is lesser', () => {
      const check = _makeCompatibilityCheck('0.1.2');
      assert.ok(check('0.1.1'));
      assert.ok(check('0.1.1-alpha'));
    });

    it('should be incompatible if minor versions do not match', () => {
      const check = _makeCompatibilityCheck('0.3.3');
      assert.ok(!check('0.2.3'));
      assert.ok(!check('0.4.3'));
    });

    it('should be incompatible if minor versions do not match', () => {
      const check = _makeCompatibilityCheck('0.3.3');
      assert.ok(!check('0.2.3'));
      assert.ok(!check('0.4.3'));
    });

    it('should be incompatible if minor versions match but other patch version is greater than our patch version', () => {
      const check = _makeCompatibilityCheck('0.3.3');
      assert.ok(!check('0.3.4-alpha'));
      assert.ok(!check('0.3.4'));
    });
  });
});
