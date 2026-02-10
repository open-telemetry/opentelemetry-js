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
import { ProtobufSizeEstimator } from '../../src/common/protobuf/protobuf-size-estimator';
import { ProtobufWriter } from '../../src/common/protobuf/protobuf-writer';

describe('ProtobufSizeEstimator', function () {
  describe('size estimation accuracy', function () {
    it('should match ProtobufWriter size for writeVarint', function () {
      const testValues = [
        0,
        1,
        127, // max 1-byte varint
        128, // min 2-byte varint
        300,
        16383, // max 2-byte varint
        16384, // min 3-byte varint
        2097151, // max 3-byte varint
        2097152, // min 4-byte varint
        268435455, // max 4-byte varint
        268435456, // min 5-byte varint
        0xffffffff, // max 32-bit varint
      ];

      for (const value of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeVarint(value);
        estimator.writeVarint(value);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for writeFixed32', function () {
      const testValues = [0, 1, 255, 65535, 0x12345678, 0xffffffff];

      for (const value of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeFixed32(value);
        estimator.writeFixed32(value);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for writeFixed64', function () {
      const testValues = [
        { low: 0, high: 0 },
        { low: 1, high: 0 },
        { low: 0xffffffff, high: 0 },
        { low: 0, high: 0xffffffff },
        { low: 0xffffffff, high: 0xffffffff },
        { low: 0x12345678, high: 0x9abcdef0 },
      ];

      for (const { low, high } of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeFixed64(low, high);
        estimator.writeFixed64(low, high);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for writeDouble', function () {
      const testValues = [
        0.0,
        1.0,
        -1.0,
        3.14159,
        -3.14159,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ];

      for (const value of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeDouble(value);
        estimator.writeDouble(value);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for writeBytes', function () {
      const testValues = [
        new Uint8Array([]),
        new Uint8Array([0]),
        new Uint8Array([1, 2, 3]),
        new Uint8Array(127), // max 1-byte length varint
        new Uint8Array(128), // min 2-byte length varint
        new Uint8Array(255),
        new Uint8Array([0xff, 0xfe, 0xfd, 0xfc]),
      ];

      for (const bytes of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeBytes(bytes);
        estimator.writeBytes(bytes);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for writeString with ASCII', function () {
      const testValues = [
        '',
        'a',
        'hello',
        'Hello, World!',
        'a'.repeat(127), // max 1-byte length varint
        'a'.repeat(128), // min 2-byte length varint
        'The quick brown fox jumps over the lazy dog',
      ];

      for (const str of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeString(str);
        estimator.writeString(str);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for writeString with UTF-8', function () {
      const testValues = [
        'Hello 世界', // Mix of ASCII and multi-byte
        '日本語', // 3-byte UTF-8 chars
        '🚀', // 4-byte emoji
        '😀����😂', // Multiple emojis
        'Ñoño', // 2-byte UTF-8 chars
        '€100', // Euro sign (3 bytes)
        'Test 测试 🧪', // Mixed content
        '\u0001\u007f\u0080\u07ff\u0800\uffff', // Various UTF-8 ranges
      ];

      for (const str of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeString(str);
        estimator.writeString(str);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for writeTag', function () {
      const testValues = [
        { fieldNumber: 1, wireType: 0 },
        { fieldNumber: 1, wireType: 1 },
        { fieldNumber: 1, wireType: 2 },
        { fieldNumber: 1, wireType: 5 },
        { fieldNumber: 15, wireType: 0 }, // max 1-byte tag
        { fieldNumber: 16, wireType: 0 }, // min 2-byte tag
        { fieldNumber: 100, wireType: 2 },
        { fieldNumber: 2047, wireType: 0 }, // max 2-byte tag
        { fieldNumber: 2048, wireType: 0 }, // min 3-byte tag
      ];

      for (const { fieldNumber, wireType } of testValues) {
        const writer = new ProtobufWriter(1024);
        const estimator = new ProtobufSizeEstimator();

        writer.writeTag(fieldNumber, wireType);
        estimator.writeTag(fieldNumber, wireType);

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for length-delimited fields', function () {
      const testValues = [
        0, // empty
        1, // small
        127, // max 1-byte length
        128, // min 2-byte length
        300,
        16383, // max 2-byte length
        16384, // min 3-byte length
      ];

      for (const length of testValues) {
        const writer = new ProtobufWriter(32768);
        const estimator = new ProtobufSizeEstimator();

        const writerStartPos = writer.startLengthDelimited();
        const estimatorStartPos = estimator.startLengthDelimited();

        // Write some dummy data
        const dummyData = new Uint8Array(length);
        writer.writeBytes(dummyData);
        estimator.writeBytes(dummyData);

        const writerContentLength = writer.pos - writerStartPos - 1;
        const estimatorContentLength = estimator.pos - estimatorStartPos;

        writer.finishLengthDelimited(writerStartPos, writerContentLength);
        estimator.finishLengthDelimited(
          estimatorStartPos,
          estimatorContentLength
        );

        assert.strictEqual(estimator.pos, writer.pos);
      }
    });

    it('should match ProtobufWriter size for complex message', function () {
      const writer = new ProtobufWriter(1024);
      const estimator = new ProtobufSizeEstimator();

      // Simulate a complex protobuf message with various field types
      // field 1: varint
      writer.writeTag(1, 0);
      writer.writeVarint(12345);
      estimator.writeTag(1, 0);
      estimator.writeVarint(12345);

      // field 2: fixed64
      writer.writeTag(2, 1);
      writer.writeFixed64(0x12345678, 0x9abcdef0);
      estimator.writeTag(2, 1);
      estimator.writeFixed64(0x12345678, 0x9abcdef0);

      // field 3: length-delimited (string)
      writer.writeTag(3, 2);
      writer.writeString('Hello, World! 🌍');
      estimator.writeTag(3, 2);
      estimator.writeString('Hello, World! 🌍');

      // field 4: nested message
      writer.writeTag(4, 2);
      const writerNestedStart = writer.startLengthDelimited();
      estimator.writeTag(4, 2);
      const estimatorNestedStart = estimator.startLengthDelimited();

      // nested field 1: varint
      writer.writeTag(1, 0);
      writer.writeVarint(42);
      estimator.writeTag(1, 0);
      estimator.writeVarint(42);

      // nested field 2: bytes
      writer.writeTag(2, 2);
      writer.writeBytes(new Uint8Array([1, 2, 3, 4, 5]));
      estimator.writeTag(2, 2);
      estimator.writeBytes(new Uint8Array([1, 2, 3, 4, 5]));

      const writerNestedLength = writer.pos - writerNestedStart - 1;
      const estimatorNestedLength = estimator.pos - estimatorNestedStart;
      writer.finishLengthDelimited(writerNestedStart, writerNestedLength);
      estimator.finishLengthDelimited(
        estimatorNestedStart,
        estimatorNestedLength
      );

      // field 5: double
      writer.writeTag(5, 1);
      writer.writeDouble(3.14159);
      estimator.writeTag(5, 1);
      estimator.writeDouble(3.14159);

      // field 6: fixed32
      writer.writeTag(6, 5);
      writer.writeFixed32(0xdeadbeef);
      estimator.writeTag(6, 5);
      estimator.writeFixed32(0xdeadbeef);

      assert.strictEqual(estimator.pos, writer.pos);
    });
  });
});
