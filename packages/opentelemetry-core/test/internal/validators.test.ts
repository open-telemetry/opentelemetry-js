/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import { validateKey, validateValue } from '../../src/internal/validators';

describe('validators', () => {
  describe('validateKey', () => {
    it('returns true when key contain all allowed characters', () => {
      const allowedKeys = 'abcdefghijklmnopqrstuvwxyz0123456789-_*/';
      assert.ok(validateKey(allowedKeys));
    });

    it('returns false when invalid first key character', () => {
      assert.ok(!validateKey('1_key'));
    });

    it('returns false when invalid key characters', () => {
      assert.ok(!validateKey('kEy_1'));
    });

    it('returns false when invalid key size', () => {
      assert.ok(!validateKey('k'.repeat(257)));
    });
  });

  describe('validateValue', () => {
    it('returns false when value contain equal', () => {
      assert.ok(!validateValue('my_vakue=5'));
    });

    it('returns false when value contain equal', () => {
      assert.ok(!validateValue('first,second'));
    });

    it('returns false when value contain trailing spaces', () => {
      assert.ok(!validateValue('first '));
    });

    it('returns false when invalid value size', () => {
      assert.ok(!validateValue('k'.repeat(257)));
    });

    it('returns true when value is empty', () => {
      assert.ok(validateValue(''));
    });
  });
});
