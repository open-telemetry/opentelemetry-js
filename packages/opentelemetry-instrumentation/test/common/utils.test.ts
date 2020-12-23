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
import { isWrapped, safeExecuteInTheMiddle } from '../../src';

describe('isWrapped', () => {
  describe('when function is wrapped', () => {
    it('should return true', () => {
      const obj: any = {
        wrapMe: function () {},
      };
      obj.wrapMe.__original = function () {};
      obj.wrapMe.__unwrap = function () {};
      obj.wrapMe.__wrapped = true;

      assert.deepStrictEqual(isWrapped(obj.wrapMe), true);
    });
  });
  describe('when function is NOT wrapped', () => {
    it('should return false', () => {
      const obj: any = {
        wrapMe: function () {},
      };
      obj.wrapMe.__unwrap = function () {};
      obj.wrapMe.__wrapped = true;

      assert.deepStrictEqual(isWrapped(obj.wrapMe), false);
    });
  });
});

describe('safeExecuteInTheMiddle', () => {
  it('should not throw error', () => {
    const error = new Error('test');
    safeExecuteInTheMiddle(
      () => {
        throw error;
      },
      err => {
        assert.deepStrictEqual(error, err);
      },
      true
    );
  });
  it('should throw error', () => {
    const error = new Error('test');
    try {
      safeExecuteInTheMiddle(
        () => {
          throw error;
        },
        err => {
          assert.deepStrictEqual(error, err);
        }
      );
    } catch (err) {
      assert.deepStrictEqual(error, err);
    }
  });
  it('should return result', () => {
    const result = safeExecuteInTheMiddle(
      () => {
        return 1;
      },
      (err, result) => {
        assert.deepStrictEqual(err, undefined);
        assert.deepStrictEqual(result, 1);
      }
    );
    assert.deepStrictEqual(result, 1);
  });
});
