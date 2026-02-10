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
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import {
  ProtobufWriter,
  GROWING_BUFFER_DEBUG_MESSAGE,
} from '../../src/common/protobuf/protobuf-writer';

// Use pbjs-generated test helper.
import * as testbed from '../generated/testbed';
import { toLongBits } from '../../src/common/utils';

describe('ProtobufWriter', function () {
  describe('round-trip with protobuf.js', function () {
    it('should write and read back complex message', function () {
      const writer = new ProtobufWriter(1024);

      // Note: one large test, to avoid having to have many .proto files
      // field 1: varint
      writer.writeTag(1, 0);
      writer.writeVarint(42);

      // field 2: string
      writer.writeTag(2, 2);
      writer.writeString('test');

      // field 3: nested message
      writer.writeTag(3, 2);
      const nestedPos = writer.startLengthDelimited();
      const nestedStartPos = writer.pos;
      writer.writeTag(1, 0);
      writer.writeVarint(100);
      writer.finishLengthDelimited(nestedPos, writer.pos - nestedStartPos);

      // Repeated int32 field4 (varint, multiple occurrences)
      const field4Values = [1, 2, 150, 0, -1, 2147483647, -2147483648];
      for (const v of field4Values) {
        writer.writeTag(4, 0);
        writer.writeVarint(v);
      }

      // Repeated string field5 (length-delimited)
      const field5Values = ['a', 'bb', 'ccc', 'x'.repeat(1000), '😀'];
      for (const s of field5Values) {
        writer.writeTag(5, 2);
        writer.writeString(s);
      }

      // Repeated bytes field6
      const field6Values = [
        new Uint8Array([1, 2]),
        new Uint8Array([3]),
        new Uint8Array(200).fill(0x7f),
        new Uint8Array([]),
      ];
      for (const b of field6Values) {
        writer.writeTag(6, 2);
        writer.writeBytes(b);
      }

      // Repeated nested messages field7
      const field7Values = [
        { field1: 10 },
        { field1: 20, field2: 'y'.repeat(300) }, // add long string to test length varint expansion
        { field1: 2147483647 },
        { field1: -2147483648 },
      ];
      field7Values.forEach(value => {
        writer.writeTag(7, 2);
        const nestedValueStart = writer.startLengthDelimited();
        const nestedValueStartPos = writer.pos;
        writer.writeTag(1, 0);
        writer.writeVarint(value.field1);
        if (value.field2 != null) {
          writer.writeTag(2, 2);
          writer.writeString(value.field2);
        }
        writer.finishLengthDelimited(
          nestedValueStart,
          writer.pos - nestedValueStartPos
        );
      });

      // Repeated fixed32 field8 (wire type 5)
      const field8Values = [0x11223344, 0x55667788, 0xffffffff, 0x00000000];
      for (const f32 of field8Values) {
        writer.writeTag(8, 5);
        writer.writeFixed32(f32);
      }

      // Repeated fixed64 field9 (wire type 1)
      const field9Expected = [
        361984551007945476n, // non-zero low and high words
        1013046106550635533n, // crosses 2^32 boundary
        42n, // fits in low 32 bits
        0n, // zero value
      ];

      const field9ExpectedWithProtobufJsPrecisionLoss = field9Expected.map(
        val => {
          // force precision loss that happens with protobuf.js in the browser.
          return Number(val);
        }
      );

      for (const b of field9Expected) {
        const bits = toLongBits(BigInt(b));
        writer.writeTag(9, 1);
        writer.writeFixed64(bits.low, bits.high);
      }

      // Repeated double field10 (wire type 1 - 64-bit IEEE 754)
      const field10Values = [
        0.0,
        -0.0,
        1.5,
        -1234.5678,
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ];
      for (const d of field10Values) {
        writer.writeTag(10, 1);
        writer.writeDouble(d);
      }

      const buffer = writer.finish();

      // Decode using generated protobuf types
      const decoded = testbed.TestMessage.toObject(
        testbed.TestMessage.decode(buffer),
        {
          // This is a protobuf.js quirk and incurs some precision loss that's taken into account in the expected data.
          // Using String here will incur the same precision loss on browser only, using Number to prevent having to
          // have different assertions for browser and Node.js.
          // We may have to change the expected values to match the input exactly if we ever switch
          // to another protobuf implementation for testing.
          longs: Number,
        }
      ) as testbed.ITestMessage;

      // field 1
      assert.strictEqual(decoded.field1, 42);

      // field 2
      assert.strictEqual(decoded.field2, 'test');

      // field 3 nested
      assert.ok(decoded.field3);
      assert.strictEqual(decoded.field3.field1, 100);

      // field4 repeated
      assert.deepStrictEqual(decoded.field4, field4Values);

      // field5 repeated
      assert.deepStrictEqual(decoded.field5, field5Values);

      // field6 repeated - decoded bytes may be Buffer/Uint8Array; compare contents
      assert.deepStrictEqual(
        decoded.field6?.map(item => new Uint8Array(item)), // protobuf.js loves to give us Buffers on Node.js, so convert to Uint8Array
        field6Values
      );

      // field7 nested repeated
      assert.deepStrictEqual(decoded.field7, field7Values);

      // field8 fixed32 repeated
      assert.deepStrictEqual(decoded.field8, field8Values);

      // field10 repeated double
      assert.deepStrictEqual(decoded.field10, field10Values);

      // field9 fixed64 repeated.
      assert.deepStrictEqual(
        decoded.field9,
        field9ExpectedWithProtobufJsPrecisionLoss
      );
    });
  });

  describe('buffer growth', function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should grow buffer when capacity is exceeded', function () {
      const diagStub = sandbox.stub(diag, 'debug');

      const writer = new ProtobufWriter(4);
      // Write more than 4 bytes
      writer.writeVarint(1);
      writer.writeVarint(2);
      writer.writeVarint(3);
      writer.writeVarint(4);
      writer.writeVarint(5);

      const buffer = writer.finish();
      assert.strictEqual(buffer.length, 5);

      sinon.assert.calledWith(diagStub, GROWING_BUFFER_DEBUG_MESSAGE);
    });

    it('should handle buffer growth during writeBytes', function () {
      const diagStub = sandbox.stub(diag, 'debug');

      const writer = new ProtobufWriter(4);
      const largeData = new Uint8Array(100);
      writer.writeBytes(largeData);

      const buffer = writer.finish();
      assert.strictEqual(buffer.length, 101);

      sinon.assert.calledWith(diagStub, GROWING_BUFFER_DEBUG_MESSAGE);
    });

    it('should handle buffer growth during writeString', function () {
      const diagStub = sandbox.stub(diag, 'debug');

      const writer = new ProtobufWriter(4);
      const longString = 'a'.repeat(100);
      writer.writeString(longString);

      const buffer = writer.finish();
      assert.strictEqual(buffer.length, 101);

      sinon.assert.calledWith(diagStub, GROWING_BUFFER_DEBUG_MESSAGE);
    });
  });

  describe('large sub-messages', function () {
    it('should not shift message on 1-byte varint length prefix', function () {
      const writer = new ProtobufWriter(4);
      const messageStart = writer.startLengthDelimited(); // reserve space
      writer.writeVarint(1);
      writer.writeVarint(2);
      writer.writeVarint(3);
      writer.finishLengthDelimited(messageStart, 3); // accurate length that fits in 1 byte, so no shifting needed
      const result = writer.finish();

      assert.deepStrictEqual(
        result,
        new Uint8Array([
          ...[3] /* varint encoding of 3 */,
          ...[1, 2, 3] /* message contents remain in-place */,
        ])
      );
    });

    // Note: the following tests pretend that the message is larger than it actually is
    // to avoid actually having to use such large messages. This keeps memory use acceptable
    // as otherwise we'd be using ~2GiB of memory for the largest test, which is not practical.

    it('should shift message on 2-byte varint length prefix', function () {
      const writer = new ProtobufWriter(4);
      const messageStart = writer.startLengthDelimited(); // reserve space
      writer.writeVarint(1);
      writer.writeVarint(2);
      writer.writeVarint(3);
      writer.finishLengthDelimited(messageStart, 128); // pretend message is 128 bytes to force 2-byte varint length
      const result = writer.finish();

      assert.deepStrictEqual(
        result,
        new Uint8Array([
          ...[128, 1] /* varint encoding of 128 */,
          ...[1, 2, 3] /* message contents properly shifted */,
        ])
      );
    });

    it('should shift message on 3-byte varint length prefix', function () {
      const writer = new ProtobufWriter(4);
      const messageStart = writer.startLengthDelimited(); // reserve space
      writer.writeVarint(1);
      writer.writeVarint(2);
      writer.writeVarint(3);
      writer.finishLengthDelimited(messageStart, Math.pow(2, 21) - 1); // pretend message is 2^21-1 bytes to force 3-byte varint length
      const result = writer.finish();

      assert.deepStrictEqual(
        result,
        new Uint8Array([
          ...[255, 255, 127] /* varint encoding of 2^21-1 */,
          ...[1, 2, 3] /* message contents properly shifted */,
        ])
      );
    });

    it('should shift message on 4-byte varint length prefix', function () {
      const writer = new ProtobufWriter(4);
      const messageStart = writer.startLengthDelimited(); // reserve space
      writer.writeVarint(1);
      writer.writeVarint(2);
      writer.writeVarint(3);
      writer.finishLengthDelimited(messageStart, Math.pow(2, 28) - 1); // pretend message is 2^28-1 bytes to force 4-byte varint length
      const result = writer.finish();

      assert.deepStrictEqual(
        result,
        new Uint8Array([
          ...[255, 255, 255, 127] /* varint encoding of 2^28-1 */,
          ...[1, 2, 3] /* message contents properly shifted */,
        ])
      );
    });

    it('should shift message on 5-byte varint length prefix', function () {
      const writer = new ProtobufWriter(4);
      const messageStart = writer.startLengthDelimited(); // reserve space
      writer.writeVarint(1);
      writer.writeVarint(2);
      writer.writeVarint(3);
      writer.finishLengthDelimited(messageStart, Math.pow(2, 31) - 1); // pretend message is 2^31-1 bytes to force 5-byte varint length
      const result = writer.finish();

      assert.deepStrictEqual(
        result,
        new Uint8Array([
          ...[255, 255, 255, 255, 7] /* varint encoding of 2^31-1 */,
          ...[1, 2, 3] /* message contents properly shifted */,
        ])
      );
    });
  });
});
