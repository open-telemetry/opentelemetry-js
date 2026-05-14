/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { ProtobufWriter } from '../../src/common/protobuf/protobuf-writer';
import {
  writeAnyValue,
  writeKeyValue,
  writeHrTimeAsFixed64,
} from '../../src/common/protobuf/common-serializer';
import * as signals from '../generated/signals';
import type { AnyValue } from '@opentelemetry/api-logs';
import type { HrTime } from '@opentelemetry/api';
import { uint8ArrayToBase64 } from '../utils';

/**
 * Helper function to serialize an AnyValue and decode it using generated protobuf code.
 * Uses longs: Number, bytes: String as results differ across platforms otherwise.
 */
function serializeAndDecodeAnyValue(value: AnyValue): any {
  const writer = new ProtobufWriter();
  writeAnyValue(writer, value);
  const buffer = writer.finish();

  const decoded = signals.opentelemetry.proto.common.v1.AnyValue.decode(buffer);
  return signals.opentelemetry.proto.common.v1.AnyValue.toObject(decoded, {
    longs: Number,
    bytes: String,
  });
}

/**
 * Helper function to serialize a KeyValue and decode it using generated protobuf code.
 * Uses longs: Number, bytes: String as results differ across platforms otherwise.
 */
function serializeAndDecodeKeyValue(key: string, value: AnyValue): any {
  const writer = new ProtobufWriter();
  writeKeyValue(writer, key, value);
  const buffer = writer.finish();

  const decoded = signals.opentelemetry.proto.common.v1.KeyValue.decode(buffer);
  return signals.opentelemetry.proto.common.v1.KeyValue.toObject(decoded, {
    longs: Number,
    bytes: String,
  });
}

describe('common-serializer', function () {
  describe('writeAnyValue', function () {
    describe('string values', function () {
      it('serializes a string value', function () {
        const obj = serializeAndDecodeAnyValue('hello world');
        assert.strictEqual(obj.stringValue, 'hello world');
      });

      it('serializes an empty string', function () {
        const obj = serializeAndDecodeAnyValue('');
        assert.strictEqual(obj.stringValue, '');
      });

      it('serializes a string with special characters', function () {
        const obj = serializeAndDecodeAnyValue('hello\nworld\t"test"');
        assert.strictEqual(obj.stringValue, 'hello\nworld\t"test"');
      });

      it('serializes a string with unicode characters', function () {
        const obj = serializeAndDecodeAnyValue('你好世界 🌍');
        assert.strictEqual(obj.stringValue, '你好世界 🌍');
      });
    });

    describe('boolean values', function () {
      it('serializes true', function () {
        const obj = serializeAndDecodeAnyValue(true);
        assert.strictEqual(obj.boolValue, true);
      });

      it('serializes false', function () {
        const obj = serializeAndDecodeAnyValue(false);
        assert.strictEqual(obj.boolValue, false);
      });
    });

    describe('integer values', function () {
      it('serializes zero', function () {
        const obj = serializeAndDecodeAnyValue(0);
        assert.strictEqual(obj.intValue, 0);
      });

      it('serializes positive integers', function () {
        const obj = serializeAndDecodeAnyValue(42);
        assert.strictEqual(obj.intValue, 42);
      });

      it('serializes negative integers', function () {
        const obj = serializeAndDecodeAnyValue(-42);
        assert.strictEqual(obj.intValue, -42);
      });

      it('serializes large positive integers', function () {
        const obj = serializeAndDecodeAnyValue(1000000);
        assert.strictEqual(obj.intValue, 1000000);
      });

      it('serializes Number.MAX_SAFE_INTEGER - 1', function () {
        const obj = serializeAndDecodeAnyValue(Number.MAX_SAFE_INTEGER - 1);
        assert.strictEqual(obj.intValue, Number.MAX_SAFE_INTEGER - 1);
      });

      it('serializes Number.MAX_SAFE_INTEGER', function () {
        const obj = serializeAndDecodeAnyValue(Number.MAX_SAFE_INTEGER);
        assert.strictEqual(obj.intValue, Number.MAX_SAFE_INTEGER);
      });

      it('serializes Number.MIN_SAFE_INTEGER', function () {
        const obj = serializeAndDecodeAnyValue(Number.MIN_SAFE_INTEGER);
        assert.strictEqual(obj.intValue, Number.MIN_SAFE_INTEGER);
      });

      it('serializes integer value that requires carry logic', function () {
        const obj = serializeAndDecodeAnyValue(-4294967296 /* -2^32 */);
        assert.strictEqual(obj.intValue, -4294967296 /* -2^32 */);
      });

      // 2^53 is beyond MAX_SAFE_INTEGER but exactly representable in IEEE 754 and
      // still within the int64 range, so it must be encoded as int_value, not double.
      it('serializes integers beyond MAX_SAFE_INTEGER but within int64 range as int_value', function () {
        const largeInt = Number.MAX_SAFE_INTEGER + 1; // 2^53, exactly representable
        const obj = serializeAndDecodeAnyValue(largeInt);
        assert.strictEqual(obj.intValue, largeInt);
      });

      // -(2^63) is the int64 minimum and exactly representable as a double (power of two).
      it('serializes -(2^63) as int_value (int64 minimum, exactly representable)', function () {
        const int64Min = -(2 ** 63);
        const obj = serializeAndDecodeAnyValue(int64Min);
        assert.strictEqual(obj.intValue, int64Min);
      });

      // 2^63 exceeds the int64 maximum. 2^63 - 1 is not representable in IEEE 754
      // (it rounds up to 2^63), making 2^63 the first double past the int64 range.
      it('serializes 2^63 as double_value (exceeds int64 maximum)', function () {
        const overInt64Max = 2 ** 63;
        const obj = serializeAndDecodeAnyValue(overInt64Max);
        assert.strictEqual(obj.doubleValue, overInt64Max);
        assert.strictEqual(obj.intValue, undefined);
      });

      it('serializes -(2^64) as double_value (below int64 minimum)', function () {
        const belowInt64Min = -(2 ** 64);
        const obj = serializeAndDecodeAnyValue(belowInt64Min);
        assert.strictEqual(obj.doubleValue, belowInt64Min);
        assert.strictEqual(obj.intValue, undefined);
      });

      // 1e100 satisfies Number.isInteger() but is far outside the int64 range.
      it('serializes 1e100 as double_value (integer but exceeds int64 range)', function () {
        const obj = serializeAndDecodeAnyValue(1e100);
        assert.strictEqual(obj.doubleValue, 1e100);
        assert.strictEqual(obj.intValue, undefined);
      });

      it('serializes -1e100 as double_value (integer but exceeds int64 range)', function () {
        const obj = serializeAndDecodeAnyValue(-1e100);
        assert.strictEqual(obj.doubleValue, -1e100);
        assert.strictEqual(obj.intValue, undefined);
      });
    });

    describe('double values', function () {
      it('serializes floating point numbers', function () {
        const obj = serializeAndDecodeAnyValue(3.14);
        assert.strictEqual(obj.doubleValue, 3.14);
      });

      it('serializes small decimal numbers', function () {
        const obj = serializeAndDecodeAnyValue(0.1);
        assert.strictEqual(obj.doubleValue, 0.1);
      });

      it('serializes negative decimal numbers', function () {
        const obj = serializeAndDecodeAnyValue(-2.5);
        assert.strictEqual(obj.doubleValue, -2.5);
      });

      it('serializes very small numbers', function () {
        const obj = serializeAndDecodeAnyValue(1e-10);
        assert.strictEqual(obj.doubleValue, 1e-10);
      });

      it('serializes Number.MAX_VALUE', function () {
        const obj = serializeAndDecodeAnyValue(Number.MAX_VALUE);
        // Number.MAX_VALUE is larger than a 64-bit integer, so it should serialize as double
        assert.strictEqual(obj.doubleValue, Number.MAX_VALUE);
      });

      it('serializes Number.MIN_VALUE', function () {
        const obj = serializeAndDecodeAnyValue(Number.MIN_VALUE);
        assert.strictEqual(obj.doubleValue, Number.MIN_VALUE);
      });

      it('serializes Infinity', function () {
        const obj = serializeAndDecodeAnyValue(Infinity);
        assert.strictEqual(obj.doubleValue, Infinity);
      });

      it('serializes -Infinity', function () {
        const obj = serializeAndDecodeAnyValue(-Infinity);
        assert.strictEqual(obj.doubleValue, -Infinity);
      });

      it('serializes NaN', function () {
        const obj = serializeAndDecodeAnyValue(NaN);
        assert.strictEqual(obj.doubleValue, NaN);
      });
    });

    describe('bytes values', function () {
      it('serializes a Uint8Array', function () {
        const bytes = new Uint8Array([0, 1, 2, 3, 4]);
        const obj = serializeAndDecodeAnyValue(bytes);

        const expectedBase64 = uint8ArrayToBase64(bytes);
        assert.strictEqual(obj.bytesValue, expectedBase64);
      });

      it('serializes an empty Uint8Array', function () {
        const bytes = new Uint8Array([]);
        const obj = serializeAndDecodeAnyValue(bytes);

        const expectedBase64 = uint8ArrayToBase64(bytes);
        assert.strictEqual(obj.bytesValue, expectedBase64);
      });

      it('serializes a Uint8Array with all byte values', function () {
        const bytes = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
          bytes[i] = i;
        }
        const obj = serializeAndDecodeAnyValue(bytes);

        const expectedBase64 = uint8ArrayToBase64(bytes);
        assert.strictEqual(obj.bytesValue, expectedBase64);
      });
    });

    describe('array values', function () {
      it('serializes an empty array', function () {
        const obj = serializeAndDecodeAnyValue([]);

        // Empty arrays serialize with an arrayValue, but the values field is omitted when empty
        assert.deepStrictEqual(obj.arrayValue, {});
      });

      it('serializes an array with mixed types', function () {
        const obj = serializeAndDecodeAnyValue([
          1,
          'two',
          false,
          2.5,
          new Uint8Array([0, 1, 2]),
        ]);

        const expectedBase64 = uint8ArrayToBase64(new Uint8Array([0, 1, 2]));

        assert.deepStrictEqual(obj.arrayValue.values, [
          { intValue: 1 },
          { stringValue: 'two' },
          { boolValue: false },
          { doubleValue: 2.5 },
          { bytesValue: expectedBase64 },
        ]);
      });

      it('serializes nested arrays', function () {
        const obj = serializeAndDecodeAnyValue([1, [2, 3], [[4]]]);

        assert.deepStrictEqual(obj.arrayValue.values, [
          { intValue: 1 },
          {
            arrayValue: {
              values: [{ intValue: 2 }, { intValue: 3 }],
            },
          },
          {
            arrayValue: {
              values: [
                {
                  arrayValue: {
                    values: [{ intValue: 4 }],
                  },
                },
              ],
            },
          },
        ]);
      });

      it('serializes arrays with objects', function () {
        const obj = serializeAndDecodeAnyValue([
          { key: 'value' },
          { nested: { key: 'value' } },
        ]);

        assert.deepStrictEqual(obj.arrayValue.values, [
          {
            kvlistValue: {
              values: [
                {
                  key: 'key',
                  value: { stringValue: 'value' },
                },
              ],
            },
          },
          {
            kvlistValue: {
              values: [
                {
                  key: 'nested',
                  value: {
                    kvlistValue: {
                      values: [
                        {
                          key: 'key',
                          value: { stringValue: 'value' },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ]);
      });
    });

    describe('object/kvlist values', function () {
      it('serializes an empty object', function () {
        const obj = serializeAndDecodeAnyValue({});

        // Empty objects serialize with a kvlistValue, but the values field is omitted when empty
        assert.deepStrictEqual(obj.kvlistValue, {});
      });

      it('serializes a simple object', function () {
        const obj = serializeAndDecodeAnyValue({ key: 'value', number: 42 });

        assert.deepStrictEqual(obj.kvlistValue.values, [
          {
            key: 'key',
            value: { stringValue: 'value' },
          },
          {
            key: 'number',
            value: { intValue: 42 },
          },
        ]);
      });

      it('serializes nested objects', function () {
        const obj = serializeAndDecodeAnyValue({
          outer: {
            inner: {
              deepKey: 'deepValue',
            },
          },
        });

        assert.deepStrictEqual(obj.kvlistValue.values, [
          {
            key: 'outer',
            value: {
              kvlistValue: {
                values: [
                  {
                    key: 'inner',
                    value: {
                      kvlistValue: {
                        values: [
                          {
                            key: 'deepKey',
                            value: { stringValue: 'deepValue' },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ]);
      });

      it('serializes objects with special characters in keys', function () {
        const obj = serializeAndDecodeAnyValue({
          'key-with-dashes': 'value1',
          'key.with.dots': 'value2',
          'key with spaces': 'value3',
          key_with_underscores: 'value4',
        });

        assert.deepStrictEqual(obj.kvlistValue.values, [
          { key: 'key-with-dashes', value: { stringValue: 'value1' } },
          { key: 'key.with.dots', value: { stringValue: 'value2' } },
          { key: 'key with spaces', value: { stringValue: 'value3' } },
          { key: 'key_with_underscores', value: { stringValue: 'value4' } },
        ]);
      });

      it('serializes objects with mixed value types', function () {
        const obj = serializeAndDecodeAnyValue({
          stringVal: 'text',
          intVal: 123,
          doubleVal: 3.14,
          boolVal: true,
          arrayVal: [1, 2, 3],
          objectVal: { nested: 'value' },
        });

        assert.deepStrictEqual(obj.kvlistValue.values, [
          {
            key: 'stringVal',
            value: { stringValue: 'text' },
          },
          {
            key: 'intVal',
            value: { intValue: 123 },
          },
          {
            key: 'doubleVal',
            value: { doubleValue: 3.14 },
          },
          {
            key: 'boolVal',
            value: { boolValue: true },
          },
          {
            key: 'arrayVal',
            value: {
              arrayValue: {
                values: [{ intValue: 1 }, { intValue: 2 }, { intValue: 3 }],
              },
            },
          },
          {
            key: 'objectVal',
            value: {
              kvlistValue: {
                values: [
                  {
                    key: 'nested',
                    value: { stringValue: 'value' },
                  },
                ],
              },
            },
          },
        ]);
      });
    });

    describe('null and undefined handling', function () {
      it('handles null by writing nothing', function () {
        const writer = new ProtobufWriter();
        writeAnyValue(writer, null);
        const buffer = writer.finish();

        // Empty buffer or minimal message structure
        assert.ok(buffer.length === 0 || buffer.length < 5);
      });

      it('handles undefined by writing nothing', function () {
        const writer = new ProtobufWriter();
        writeAnyValue(writer, undefined);
        const buffer = writer.finish();

        // Empty buffer or minimal message structure
        assert.ok(buffer.length === 0 || buffer.length < 5);
      });

      it('handles null in arrays by writing nothing for that element', function () {
        const obj = serializeAndDecodeAnyValue([1, null, 3]);

        // Middle element should have no value set (empty AnyValue)
        assert.deepStrictEqual(obj.arrayValue.values, [
          { intValue: 1 },
          {}, // Empty AnyValue for null
          { intValue: 3 },
        ]);
      });

      it('handles undefined in objects by writing nothing for that value', function () {
        const obj = serializeAndDecodeAnyValue({
          key1: 'value1',
          key2: undefined,
          key3: 'value3',
        });

        assert.deepStrictEqual(obj.kvlistValue.values, [
          {
            key: 'key1',
            value: { stringValue: 'value1' },
          },
          {
            key: 'key2',
            value: {}, // Empty AnyValue for undefined
          },
          {
            key: 'key3',
            value: { stringValue: 'value3' },
          },
        ]);
      });
    });
  });

  describe('writeKeyValue', function () {
    it('serializes a key-value pair with string value', function () {
      const obj = serializeAndDecodeKeyValue('myKey', 'myValue');

      assert.deepStrictEqual(obj, {
        key: 'myKey',
        value: { stringValue: 'myValue' },
      });
    });

    it('serializes a key-value pair with integer value', function () {
      const obj = serializeAndDecodeKeyValue('count', 42);

      assert.deepStrictEqual(obj, {
        key: 'count',
        value: { intValue: 42 },
      });
    });

    it('serializes a key-value pair with double value', function () {
      const obj = serializeAndDecodeKeyValue('ratio', 3.14);

      assert.deepStrictEqual(obj, {
        key: 'ratio',
        value: { doubleValue: 3.14 },
      });
    });

    it('serializes a key-value pair with boolean value', function () {
      const obj = serializeAndDecodeKeyValue('enabled', true);

      assert.deepStrictEqual(obj, {
        key: 'enabled',
        value: { boolValue: true },
      });
    });

    it('serializes a key-value pair with array value', function () {
      const obj = serializeAndDecodeKeyValue('items', [1, 2, 3]);

      assert.deepStrictEqual(obj, {
        key: 'items',
        value: {
          arrayValue: {
            values: [{ intValue: 1 }, { intValue: 2 }, { intValue: 3 }],
          },
        },
      });
    });

    it('serializes a key-value pair with object value', function () {
      const obj = serializeAndDecodeKeyValue('metadata', { version: '1.0' });

      assert.deepStrictEqual(obj, {
        key: 'metadata',
        value: {
          kvlistValue: {
            values: [
              {
                key: 'version',
                value: { stringValue: '1.0' },
              },
            ],
          },
        },
      });
    });
  });

  describe('writeHrTimeAsFixed64', function () {
    /**
     * Reference implementation using BigInt for correctness verification.
     * Computes the fixed64 payload from total_nanos = seconds * 1e9 + nanos
     * as [low32, high32], wrapping modulo 2^64 like protobuf fixed64 does.
     */
    function expectedFixed64(hrTime: HrTime): [number, number] {
      const total =
        (BigInt(hrTime[0]) * 1_000_000_000n + BigInt(hrTime[1])) &
        0xffff_ffff_ffff_ffffn;
      return [
        Number(total & 0xffff_ffffn),
        Number((total >> 32n) & 0xffff_ffffn),
      ];
    }

    function serializeHrTime(hrTime: HrTime): [number, number] {
      const writer = new ProtobufWriter(16);
      writeHrTimeAsFixed64(writer, hrTime);
      const buf = writer.finish();
      // fixed64 is 8 bytes, little-endian: bytes 0-3 = low32, bytes 4-7 = high32
      const low = buf[0] | (buf[1] << 8) | (buf[2] << 16) | (buf[3] << 24);
      const high = buf[4] | (buf[5] << 8) | (buf[6] << 16) | (buf[7] << 24);
      return [low >>> 0, high >>> 0];
    }

    it('encodes [0, 0] (epoch)', function () {
      const hrTime: HrTime = [0, 0];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes [1, 0] (exactly 1 second)', function () {
      const hrTime: HrTime = [1, 0];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes [0, 1] (1 nanosecond)', function () {
      const hrTime: HrTime = [0, 1];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes [1, 999_999_999] (max nanos in a second)', function () {
      const hrTime: HrTime = [1, 999_999_999];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes a typical 2023 Unix timestamp [1_700_000_000, 0]', function () {
      const hrTime: HrTime = [1_700_000_000, 0];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes [1_700_000_000, 500_000_000]', function () {
      const hrTime: HrTime = [1_700_000_000, 500_000_000];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes [1_700_000_001, 999_999_999] (nanos cause carry into high word)', function () {
      const hrTime: HrTime = [1_700_000_001, 999_999_999];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    // Regression: values above ~9_007_199 seconds previously lost precision
    // because `seconds * 1e9` exceeded Number.MAX_SAFE_INTEGER.
    it('regression: encodes [5_100_000_153, 1] without precision loss', function () {
      const hrTime: HrTime = [5_100_000_153, 1];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('regression: encodes [5_300_000_159, 999_999_999] without precision loss', function () {
      const hrTime: HrTime = [5_300_000_159, 999_999_999];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('regression: encodes [9_007_200, 0] (just above old precision boundary)', function () {
      // 9_007_199 * 1e9 ≈ Number.MAX_SAFE_INTEGER; the old code lost precision here
      const hrTime: HrTime = [9_007_200, 0];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('regression: encodes [9_100_000_273, 0] without precision loss', function () {
      const hrTime: HrTime = [9_100_000_273, 0];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes the Year 2038 boundary [2_147_483_647, 999_999_999]', function () {
      const hrTime: HrTime = [2_147_483_647, 999_999_999];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes a large timestamp [10_000_000_000, 999_999_999]', function () {
      const hrTime: HrTime = [10_000_000_000, 999_999_999];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('encodes the largest HrTime that fits in fixed64 [18_446_744_073, 709_551_615]', function () {
      // July 4, 2554, at 23:59:59.999999999 UTC - the largest timestamp that can be represented in fixed64 nanoseconds since Unix epoch
      const hrTime: HrTime = [18_446_744_073, 709_551_615];
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });

    it('wraps without throwing once total nanoseconds exceeds fixed64 range [18_446_744_073, 709_551_616]', function () {
      const hrTime: HrTime = [18_446_744_073, 709_551_616];
      assert.deepStrictEqual(serializeHrTime(hrTime), [0, 0]);
      assert.deepStrictEqual(serializeHrTime(hrTime), expectedFixed64(hrTime));
    });
  });
});
