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
import { getOtlpEncoder } from '../src/common/utils';
import { hexToBinary } from '../src/common/hex-to-binary';

const traceId = 'abcdef01234567890000000000000000';
const spanId = '12341234abcdabcd';

describe('common', () => {
  describe('toAnyValue', () => {
    it('serializes an array', () => {
      const anyValue = toAnyValue([
        1,
        'two',
        false,
        2.5,
        new Uint8Array([0, 1, 2]),
        { somekey: 'somevalue' },
      ]);
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

  describe('otlp encoder', () => {
    it('defaults to long timestamps and binary encoding given no options', () => {
      const encoder = getOtlpEncoder();
      assert.deepStrictEqual(encoder.encodeHrTime([1697978649, 99870675]), {
        low: 3352011219,
        high: 395341461,
      });
      assert.deepStrictEqual(
        encoder.encodeSpanContext(traceId),
        hexToBinary(traceId)
      );
      assert.deepStrictEqual(
        encoder.encodeOptionalSpanContext(spanId),
        hexToBinary(spanId)
      );
      assert.deepStrictEqual(
        encoder.encodeOptionalSpanContext(undefined),
        undefined
      );
    });

    it('defaults to long timestamps and base64 encoding given empty options', () => {
      const encoder = getOtlpEncoder({});
      assert.deepStrictEqual(encoder.encodeHrTime([1697978649, 99870675]), {
        low: 3352011219,
        high: 395341461,
      });
      assert.deepStrictEqual(
        encoder.encodeSpanContext(traceId),
        hexToBinary(traceId)
      );
      assert.deepStrictEqual(
        encoder.encodeOptionalSpanContext(spanId),
        hexToBinary(spanId)
      );
      assert.deepStrictEqual(
        encoder.encodeOptionalSpanContext(undefined),
        undefined
      );
    });

    it('can encode HrTime as string', () => {
      const encoder = getOtlpEncoder({ useLongBits: false });
      assert.deepStrictEqual(
        encoder.encodeHrTime([1697978649, 99870675]),
        '1697978649099870675'
      );
    });

    it('can encode span context as hex', () => {
      const encoder = getOtlpEncoder({ useHex: true });
      assert.deepStrictEqual(encoder.encodeSpanContext(traceId), traceId);
      assert.deepStrictEqual(encoder.encodeOptionalSpanContext(spanId), spanId);
      assert.deepStrictEqual(
        encoder.encodeOptionalSpanContext(undefined),
        undefined
      );
    });
  });
});
