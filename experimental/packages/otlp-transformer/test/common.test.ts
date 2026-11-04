/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { toAnyValue } from '../src/common/internal';
import * as assert from 'assert';
import { JSON_ENCODER, PROTOBUF_ENCODER } from '../src/common/utils';

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

  describe('JSON_ENCODER.encodeUint8Array', () => {
    it('base64-encodes bytes', () => {
      assert.strictEqual(
        JSON_ENCODER.encodeUint8Array(new Uint8Array([0, 1, 2, 250, 255])),
        'AAEC+v8='
      );
    });

    it('encodes an empty array', () => {
      assert.strictEqual(JSON_ENCODER.encodeUint8Array(new Uint8Array()), '');
    });

    it('round-trips 100,000 bytes without a stack overflow', () => {
      const bytes = new Uint8Array(100_000);
      for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256;
      const decoded = atob(JSON_ENCODER.encodeUint8Array(bytes) as string);
      assert.strictEqual(decoded.length, bytes.length);
      assert.strictEqual(decoded.charCodeAt(99_999), 99_999 % 256);
    });
  });
});
