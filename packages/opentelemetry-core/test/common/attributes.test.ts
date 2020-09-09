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
import { isAttributeValue } from '../../src/common/attributes';

describe('attributes', () => {
  describe('#isAttributeValue', () => {
    it('should allow primitive values', () => {
      assert.ok(isAttributeValue(0));
      assert.ok(isAttributeValue(true));
      assert.ok(isAttributeValue('str'));
    });

    it('should allow nullish values', () => {
      assert.ok(isAttributeValue(null));
      assert.ok(isAttributeValue(undefined));
      // @ts-expect-error
      assert.ok(isAttributeValue());
    });

    it('should not allow objects', () => {
      assert.ok(!isAttributeValue({}));
    });

    it('should allow homogeneous arrays', () => {
      assert.ok(isAttributeValue([]));
      assert.ok(isAttributeValue([0, 1, 2]));
      assert.ok(isAttributeValue([true, false, true]));
      assert.ok(isAttributeValue(['str1', 'str2', 'str3']));
    });

    it('should allow homogeneous arrays with null values', () => {
      assert.ok(isAttributeValue([null]));
      assert.ok(isAttributeValue([0, null, 2]));
      assert.ok(isAttributeValue([true, null, true]));
      assert.ok(isAttributeValue(['str1', undefined, 'str3']));
    });

    it('should not allow heterogeneous arrays', () => {
      assert.ok(!isAttributeValue([0, false, 2]));
      assert.ok(!isAttributeValue([true, 'false', true]));
      assert.ok(!isAttributeValue(['str1', 2, 'str3']));
    });

    it('should not allow arrays of objects or nested arrays', () => {
      assert.ok(!isAttributeValue([{}]));
      assert.ok(!isAttributeValue([[]]));
    });
  });
});
