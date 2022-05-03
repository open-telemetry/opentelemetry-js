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
import { ObservableResult } from '../src/ObservableResult';
import { commonAttributes, commonValues } from './util';

describe('ObservableResult', () => {
  describe('observe', () => {
    it('should observe', () => {
      const observableResult = new ObservableResult();
      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          observableResult.observe(value, attributes);
        }
      }
    });

    it('should deduplicate observations', () => {
      const observableResult = new ObservableResult();
      observableResult.observe(1, {});
      observableResult.observe(2, {});

      assert.strictEqual(observableResult.buffer.size, 1);
      assert(observableResult.buffer.has({}));
      assert.strictEqual(observableResult.buffer.get({}), 2);
    });
  });
});
