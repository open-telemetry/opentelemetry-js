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

import { toAnyValue } from '../src/common/internal';
import * as assert from 'assert';
import { PROTOBUF_ENCODER } from '../src/common/utils';

describe('common', () => {
  describe('toAnyValue', () => {
    it('serializes an array', () => {
      const anyValue = toAnyValue(
        [
          1,
          'two',
          false,
          2.5,
          new Uint8Array([0, 1, 2]),
          { somekey: 'somevalue' },
        ],
        PROTOBUF_ENCODER
      );
      assert.deepStrictEqual(anyValue, {
        arrayValue: {
          values: [
            {
              intValue: 1,
            },
            {
              stringValue: 'two',
            },
            {
              boolValue: false,
            },
            {
              doubleValue: 2.5,
            },
            {
              bytesValue: new Uint8Array([0, 1, 2]),
            },
            {
              kvlistValue: {
                values: [
                  {
                    key: 'somekey',
                    value: {
                      stringValue: 'somevalue',
                    },
                  },
                ],
              },
            },
          ],
        },
      });
    });
  });
});
