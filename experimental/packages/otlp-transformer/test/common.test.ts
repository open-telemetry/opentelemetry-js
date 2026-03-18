/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
