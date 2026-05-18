/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { ProtobufReader } from '../../src/common/protobuf/protobuf-reader';
import { ProtobufWriter } from '../../src/common/protobuf/protobuf-writer';

import * as testbed from '../generated/testbed';

describe('ProtobufReader', function () {
  describe('isAtEnd()', function () {
    it('returns true immediately for an empty buffer', function () {
      assert.ok(new ProtobufReader(new Uint8Array(0)).isAtEnd());
    });

    it('returns false when bytes remain', function () {
      assert.ok(!new ProtobufReader(new Uint8Array([0x01])).isAtEnd());
    });

    it('returns true after all bytes are consumed', function () {
      const reader = new ProtobufReader(new Uint8Array([0x01, 0x7f]));
      reader.readVarint(); // consume first byte
      assert.ok(!reader.isAtEnd());
      reader.readVarint(); // consume second byte
      assert.ok(reader.isAtEnd());
    });
  });

  describe('readVarint()', function () {
    function decodeVarint(value: number): number {
      const writer = new ProtobufWriter(16);
      writer.writeVarint(value);
      const bytes = writer.finish();
      return new ProtobufReader(new Uint8Array(bytes)).readVarint();
    }

    it('decodes 0', function () {
      assert.strictEqual(decodeVarint(0), 0);
    });

    it('decodes 1', function () {
      assert.strictEqual(decodeVarint(1), 1);
    });

    it('decodes 127 (max single-byte varint)', function () {
      assert.strictEqual(decodeVarint(127), 127);
    });

    it('decodes 128 (first two-byte varint)', function () {
      // 128 = 0b10000000 → low 7 bits = 0, continuation, next group = 1
      assert.strictEqual(decodeVarint(128), 128);
    });

    it('decodes 300 (two-byte mid-range)', function () {
      // 300 = 0x12c → low 7 bits = 0x2c | 0x80 = 0xac, next group = 0x02
      assert.strictEqual(decodeVarint(300), 300);
    });

    it('decodes 2^14 = 16384 (three-byte boundary)', function () {
      assert.strictEqual(decodeVarint(16384), 16384);
    });

    it('decodes 2^21 = 2097152 (four-byte boundary)', function () {
      assert.strictEqual(decodeVarint(2097152), 2097152);
    });

    it('decodes 2^28 = 268435456 (five-byte boundary)', function () {
      assert.strictEqual(decodeVarint(268435456), 268435456);
    });

    it('decodes 2^32 = 4294967296 (exceeds 32-bit unsigned range)', function () {
      // Encoding: groups of 7 bits LSB-first.
      // 2^32 sits entirely in group 4 (bits 28-34): value=16, byte=0x10 (no continuation)
      assert.strictEqual(decodeVarint(4294967296), 4294967296);
    });

    it('decodes 2^35 = 34359738368 (six-byte varint)', function () {
      // Bit 35 is set, falls into group 5 (bits 35-41): value=1, byte=0x01
      assert.strictEqual(decodeVarint(34359738368), 34359738368);
    });

    it('decodes 2^53 = 9007199254740992 (Number.MAX_SAFE_INTEGER boundary)', function () {
      // Bit 53 is set, falls into group 7 (bits 49-55): value=16, byte=0x10
      assert.strictEqual(decodeVarint(9007199254740992), 9007199254740992);
    });

    it('advances pos by the number of bytes consumed', function () {
      // [0x80, 0x01] = 128 (2 bytes), [0x7f] = 127 (1 byte)
      const writer = new ProtobufWriter(16);
      writer.writeVarint(128);
      writer.writeVarint(127);
      const reader = new ProtobufReader(writer.finish());
      assert.strictEqual(reader.pos, 0);
      reader.readVarint();
      assert.strictEqual(reader.pos, 2);
      reader.readVarint();
      assert.strictEqual(reader.pos, 3);
    });
  });

  describe('readTag()', function () {
    function decodeTag(input: { fieldNumber: number; wireType: number }): {
      fieldNumber: number;
      wireType: number;
    } {
      const writer = new ProtobufWriter(8);
      writer.writeTag(input.fieldNumber, input.wireType);
      return new ProtobufReader(writer.finish()).readTag();
    }

    it('decodes field 1, wire type 0 (varint)', function () {
      const { fieldNumber, wireType } = decodeTag({
        fieldNumber: 1,
        wireType: 0,
      });
      assert.strictEqual(fieldNumber, 1);
      assert.strictEqual(wireType, 0);
    });

    it('decodes field 2, wire type 2 (length-delimited)', function () {
      const { fieldNumber, wireType } = decodeTag({
        fieldNumber: 2,
        wireType: 2,
      });
      assert.strictEqual(fieldNumber, 2);
      assert.strictEqual(wireType, 2);
    });

    it('decodes field 8, wire type 5 (fixed32)', function () {
      const { fieldNumber, wireType } = decodeTag({
        fieldNumber: 8,
        wireType: 5,
      });
      assert.strictEqual(fieldNumber, 8);
      assert.strictEqual(wireType, 5);
    });

    it('decodes field 9, wire type 1 (fixed64)', function () {
      const { fieldNumber, wireType } = decodeTag({
        fieldNumber: 9,
        wireType: 1,
      });
      assert.strictEqual(fieldNumber, 9);
      assert.strictEqual(wireType, 1);
    });

    it('decodes field 16, wire type 0 (two-byte tag varint)', function () {
      const { fieldNumber, wireType } = decodeTag({
        fieldNumber: 16,
        wireType: 0,
      });
      assert.strictEqual(fieldNumber, 16);
      assert.strictEqual(wireType, 0);
    });

    it('advances pos by the size of the tag varint', function () {
      const writer = new ProtobufWriter(16);
      writer.writeTag(1, 0); // field 1 wire 0
      writer.writeTag(16, 0); // field 16 wire 0 (2-byte tag)
      const reader = new ProtobufReader(writer.finish());
      reader.readTag();
      assert.strictEqual(reader.pos, 1);
      reader.readTag();
      assert.strictEqual(reader.pos, 3);
    });
  });

  describe('readString()', function () {
    it('reads an empty string (length prefix 0x00)', function () {
      const writer = new ProtobufWriter(8);
      writer.writeString('');
      const reader = new ProtobufReader(writer.finish());
      assert.strictEqual(reader.readString(), '');
      assert.ok(reader.isAtEnd());
    });

    it('reads a short ASCII string', function () {
      // 'test' → length 4, bytes 0x74 0x65 0x73 0x74
      const writer = new ProtobufWriter(16);
      writer.writeString('test');
      const reader = new ProtobufReader(writer.finish());
      assert.strictEqual(reader.readString(), 'test');
      assert.ok(reader.isAtEnd());
    });

    it('reads a multi-byte UTF-8 string (emoji)', function () {
      const text = '😀'; // U+1F600, 4 bytes in UTF-8
      const writer = new ProtobufWriter(16);
      writer.writeString(text);
      const reader = new ProtobufReader(writer.finish());
      assert.strictEqual(reader.readString(), text);
    });

    it('advances pos past the length prefix and string data', function () {
      // [length=4, 't','e','s','t', sentinel=0x01]
      const writer = new ProtobufWriter(16);
      writer.writeString('test');
      writer.writeVarint(1);
      const reader = new ProtobufReader(writer.finish());
      reader.readString();
      assert.strictEqual(reader.pos, 5);
      assert.strictEqual(reader.readVarint(), 1);
    });
  });

  describe('readBytes()', function () {
    it('reads an empty byte slice (length prefix 0x00)', function () {
      const reader = new ProtobufReader(new Uint8Array([0x00]));
      assert.deepStrictEqual(reader.readBytes(), new Uint8Array([]));
      assert.ok(reader.isAtEnd());
    });

    it('reads a non-empty byte slice', function () {
      const reader = new ProtobufReader(
        new Uint8Array([0x03, 0x01, 0x02, 0x03])
      );
      assert.deepStrictEqual(
        reader.readBytes(),
        new Uint8Array([0x01, 0x02, 0x03])
      );
      assert.ok(reader.isAtEnd());
    });

    it('returns a view into the same buffer (no copy necessary)', function () {
      const original = new Uint8Array([0x02, 0xaa, 0xbb]);
      const result = new ProtobufReader(original).readBytes();
      // The subarray should share the underlying ArrayBuffer
      assert.strictEqual(result.buffer, original.buffer);
    });

    it('advances pos past the length prefix and data bytes', function () {
      // [length=2, 0xaa, 0xbb, sentinel=0x07]
      const reader = new ProtobufReader(
        new Uint8Array([0x02, 0xaa, 0xbb, 0x07])
      );
      reader.readBytes();
      assert.strictEqual(reader.pos, 3);
      assert.strictEqual(reader.readVarint(), 7);
    });
  });

  describe('skip()', function () {
    it('wire type 0 (varint): skips a multi-byte varint', function () {
      // [0xac, 0x02] = 300 (2 bytes), followed by sentinel 0x07
      const reader = new ProtobufReader(new Uint8Array([0xac, 0x02, 0x07]));
      reader.skip(0);
      assert.strictEqual(reader.pos, 2);
      assert.strictEqual(reader.readVarint(), 7);
    });

    it('wire type 1 (fixed64): skips exactly 8 bytes', function () {
      const buf = new Uint8Array(9);
      buf[8] = 0x2a; // sentinel
      const reader = new ProtobufReader(buf);
      reader.skip(1);
      assert.strictEqual(reader.pos, 8);
      assert.strictEqual(reader.readVarint(), 0x2a);
    });

    it('wire type 2 (length-delimited): skips length prefix + data', function () {
      // [length=3, 0x01, 0x02, 0x03, sentinel=0x2a]
      const reader = new ProtobufReader(
        new Uint8Array([0x03, 0x01, 0x02, 0x03, 0x2a])
      );
      reader.skip(2);
      assert.strictEqual(reader.pos, 4);
      assert.strictEqual(reader.readVarint(), 0x2a);
    });

    it('wire type 5 (fixed32): skips exactly 4 bytes', function () {
      const buf = new Uint8Array(5);
      buf[4] = 0x2a; // sentinel
      const reader = new ProtobufReader(buf);
      reader.skip(5);
      assert.strictEqual(reader.pos, 4);
      assert.strictEqual(reader.readVarint(), 0x2a);
    });

    it('wire type 3 (start-group): throws because groups are not supported', function () {
      // start-group key for field 1: (1 << 3) | 3 = 0x0B
      const bytes = new Uint8Array([0x0b, 0x10, 0x03, 0x0c]);
      const reader = new ProtobufReader(bytes);

      const { fieldNumber, wireType } = reader.readTag();
      assert.strictEqual(fieldNumber, 1);
      assert.strictEqual(wireType, 3);

      assert.throws(() => reader.skip(wireType), /Unknown wire type 3/);
    });

    it('wire type 4 (end-group): throws because groups are not supported', function () {
      // end-group key for field 1: (1 << 3) | 4 = 0x0C
      const reader = new ProtobufReader(new Uint8Array([0x0c]));

      const { wireType } = reader.readTag();
      assert.strictEqual(wireType, 4);

      assert.throws(() => reader.skip(wireType), /Unknown wire type 4/);
    });

    it('unknown tag (invalid wire type): skip throws and does not consume subsequent bytes', function () {
      // Construct a tag with field 1 and invalid wire type 7: (1 << 3) | 7 = 0x0f
      // Append a sentinel byte after the tag so we can verify it wasn't consumed.
      const bytes = new Uint8Array([0x0f, 0x2a]);
      const reader = new ProtobufReader(bytes);

      const { fieldNumber, wireType } = reader.readTag();
      assert.strictEqual(fieldNumber, 1);
      assert.strictEqual(wireType, 7);

      // skip should throw for unknown wire type
      assert.throws(() => reader.skip(wireType));

      // position should not have advanced past the tag-varint (only readTag consumed it)
      assert.strictEqual(reader.pos, 1);
      // sentinel should still be present
      assert.strictEqual(reader.readVarint(), 0x2a);
    });

    it('skips consecutive fields of different wire types', function () {
      // varint 300 (2 bytes) + length-delimited [0x01,0x02] (3 bytes) + fixed32 zeros (4 bytes) = 9 bytes, sentinel
      const reader = new ProtobufReader(
        new Uint8Array([
          0xac,
          0x02, // wire 0: varint 300
          0x02,
          0x01,
          0x02, // wire 2: 2-byte payload
          0x00,
          0x00,
          0x00,
          0x00, // wire 5: fixed32 zeros
          0x05, // sentinel varint
        ])
      );
      reader.skip(0); // skip varint
      reader.skip(2); // skip length-delimited
      reader.skip(5); // skip fixed32
      assert.strictEqual(reader.readVarint(), 5);
    });
  });

  describe('round-trip with testbed.proto', function () {
    // Full decoded message for testbed.TestMessage (used in round-trip tests).
    //
    // Fields 1–7 are fully decoded using ProtobufReader.
    // Fields 8 (fixed32, wire type 5), 9 (fixed64, wire type 1), and
    // 10 (double, wire type 1) are explicitly skipped via reader.skip() so
    // that the round-trip tests also check forward-compatible skipping.
    interface DecodedTestMessage {
      field1?: number;
      field2?: string;
      field3?: { field1?: number; field2?: string };
      field4: number[];
      field5: string[];
      field6: Uint8Array[];
      field7: { field1?: number; field2?: string }[];
      /** field numbers that were encountered but skipped (8, 9, 10) */
      skippedFields: number[];
    }

    function decodeNested(bytes: Uint8Array): {
      field1?: number;
      field2?: string;
    } {
      const reader = new ProtobufReader(bytes);
      const out: { field1?: number; field2?: string } = {};
      while (!reader.isAtEnd()) {
        const { fieldNumber, wireType } = reader.readTag();
        if (fieldNumber === 1) out.field1 = reader.readVarint();
        else if (fieldNumber === 2) out.field2 = reader.readString();
        else reader.skip(wireType);
      }
      return out;
    }

    function decodeTestMessage(data: Uint8Array): DecodedTestMessage {
      // Wrap in a plain Uint8Array so that readBytes() always returns a plain
      // Uint8Array subarray rather than a Node.js Buffer slice. protobuf.js
      // finish() may return a Buffer on Node.js, and Buffer !== Uint8Array in
      // assert.deepStrictEqual even when the byte contents are identical.
      const reader = new ProtobufReader(new Uint8Array(data));
      const out: DecodedTestMessage = {
        field4: [],
        field5: [],
        field6: [],
        field7: [],
        skippedFields: [],
      };

      while (!reader.isAtEnd()) {
        const { fieldNumber, wireType } = reader.readTag();
        switch (fieldNumber) {
          case 1:
            out.field1 = reader.readVarint();
            break;
          case 2:
            out.field2 = reader.readString();
            break;
          case 3:
            out.field3 = decodeNested(reader.readBytes());
            break;
          case 4:
            if (wireType === 2) {
              // packed varint: proto3 default for repeated scalars
              const packed = new ProtobufReader(reader.readBytes());
              while (!packed.isAtEnd()) {
                out.field4.push(packed.readVarint());
              }
            } else {
              // non-packed (wire type 0)
              out.field4.push(reader.readVarint());
            }
            break;
          case 5:
            out.field5.push(reader.readString());
            break;
          case 6:
            out.field6.push(reader.readBytes());
            break;
          case 7:
            out.field7.push(decodeNested(reader.readBytes()));
            break;
          default:
            // fields 8 (wire 5), 9 (wire 1), 10 (wire 1) land here
            out.skippedFields.push(fieldNumber);
            reader.skip(wireType);
            break;
        }
      }

      return out;
    }

    it('decodes scalar int32 (field1) and string (field2)', function () {
      const encoded = testbed.TestMessage.encode({
        field1: 42,
        field2: 'hello world',
      }).finish();

      const decoded = decodeTestMessage(encoded);
      assert.strictEqual(decoded.field1, 42);
      assert.strictEqual(decoded.field2, 'hello world');
    });

    it('decodes a nested message (field3)', function () {
      const encoded = testbed.TestMessage.encode({
        field3: { field1: 100, field2: 'nested' },
      }).finish();

      const { field3 } = decodeTestMessage(encoded);
      assert.ok(field3, 'field3 should be present');
      assert.strictEqual(field3.field1, 100);
      assert.strictEqual(field3.field2, 'nested');
    });

    it('decodes a nested message that has only field1 (field2 absent)', function () {
      const encoded = testbed.TestMessage.encode({
        field3: { field1: 7 },
      }).finish();

      const { field3 } = decodeTestMessage(encoded);
      assert.ok(field3);
      assert.strictEqual(field3.field1, 7);
      assert.strictEqual(field3.field2, undefined);
    });

    it('decodes repeated int32 (field4)', function () {
      const values = [0, 1, 127, 128, 300, 268435456];
      const encoded = testbed.TestMessage.encode({ field4: values }).finish();
      assert.deepStrictEqual(decodeTestMessage(encoded).field4, values);
    });

    it('decodes repeated string (field5) including empty string and emoji', function () {
      const values = ['', 'foo', 'bar baz', '😀'];
      const encoded = testbed.TestMessage.encode({ field5: values }).finish();
      assert.deepStrictEqual(decodeTestMessage(encoded).field5, values);
    });

    it('decodes repeated bytes (field6) including an empty slice', function () {
      const values = [
        new Uint8Array([0x01, 0x02, 0x03]),
        new Uint8Array([]),
        new Uint8Array([0xff, 0x00, 0xab]),
      ];
      const encoded = testbed.TestMessage.encode({ field6: values }).finish();
      const decoded = decodeTestMessage(encoded).field6;
      assert.strictEqual(decoded.length, values.length);
      for (let i = 0; i < values.length; i++) {
        assert.deepStrictEqual(decoded[i], values[i]);
      }
    });

    it('decodes repeated nested messages (field7)', function () {
      const encoded = testbed.TestMessage.encode({
        field7: [
          { field1: 10, field2: 'x' },
          { field1: 20 }, // field2 absent
        ],
      }).finish();

      const { field7 } = decodeTestMessage(encoded);
      assert.strictEqual(field7.length, 2);
      assert.deepStrictEqual(field7[0], { field1: 10, field2: 'x' });
      assert.deepStrictEqual(field7[1], { field1: 20 });
    });

    it('skips fixed32 (field8, packed wire type 2) without corrupting adjacent fields', function () {
      const encoded = testbed.TestMessage.encode({
        field1: 7,
        field8: [0x11223344, 0x55667788],
      }).finish();

      const decoded = decodeTestMessage(encoded);
      assert.strictEqual(decoded.field1, 7);
      // proto3 uses packed encoding for repeated scalars → one length-delimited
      // tag covers all values, so field8 appears exactly once in skippedFields
      assert.deepStrictEqual(decoded.skippedFields, [8]);
    });

    it('skips fixed64 (field9, packed wire type 2) without corrupting adjacent fields', function () {
      const encoded = testbed.TestMessage.encode({
        field2: 'after skip',
        field9: [42, 0],
      }).finish();

      const decoded = decodeTestMessage(encoded);
      assert.strictEqual(decoded.field2, 'after skip');
      // packed: both values share one tag occurrence
      assert.deepStrictEqual(decoded.skippedFields, [9]);
    });

    it('skips double (field10, packed wire type 2) without corrupting adjacent fields', function () {
      const encoded = testbed.TestMessage.encode({
        field2: 'sentinel',
        field10: [1.5, -0.5, 0.0],
      }).finish();

      const decoded = decodeTestMessage(encoded);
      assert.strictEqual(decoded.field2, 'sentinel');
      // packed: all three values share one tag occurrence
      assert.deepStrictEqual(decoded.skippedFields, [10]);
    });

    it('handles the full TestMessage with all fields populated', function () {
      const inputField6 = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([]),
        new Uint8Array([0xff]),
      ];

      const encoded = testbed.TestMessage.encode({
        field1: 42,
        field2: 'hello world',
        field3: { field1: 100, field2: 'nested string' },
        field4: [0, 1, 127, 128, 300],
        field5: ['foo', '', '😀'],
        field6: inputField6,
        field7: [{ field1: 10, field2: 'x' }, { field1: 20 }],
        field8: [0x11223344],
        field9: [42],
        field10: [1.5],
      }).finish();

      const decoded = decodeTestMessage(encoded);

      assert.strictEqual(decoded.field1, 42);
      assert.strictEqual(decoded.field2, 'hello world');
      assert.ok(decoded.field3);
      assert.strictEqual(decoded.field3.field1, 100);
      assert.strictEqual(decoded.field3.field2, 'nested string');
      assert.deepStrictEqual(decoded.field4, [0, 1, 127, 128, 300]);
      assert.deepStrictEqual(decoded.field5, ['foo', '', '😀']);
      assert.strictEqual(decoded.field6.length, inputField6.length);
      for (let i = 0; i < inputField6.length; i++) {
        assert.deepStrictEqual(decoded.field6[i], inputField6[i]);
      }
      assert.deepStrictEqual(decoded.field7, [
        { field1: 10, field2: 'x' },
        { field1: 20 },
      ]);
      // fields 8, 9, 10 reached and skipped, 1 occurrence each
      assert.deepStrictEqual(
        decoded.skippedFields.sort((a, b) => a - b),
        [8, 9, 10]
      );
    });

    it('returns empty result for an empty buffer (zero-length message)', function () {
      const decoded = decodeTestMessage(new Uint8Array(0));
      assert.strictEqual(decoded.field1, undefined);
      assert.strictEqual(decoded.field2, undefined);
      assert.strictEqual(decoded.field3, undefined);
      assert.deepStrictEqual(decoded.field4, []);
      assert.deepStrictEqual(decoded.field5, []);
      assert.deepStrictEqual(decoded.field6, []);
      assert.deepStrictEqual(decoded.field7, []);
      assert.deepStrictEqual(decoded.skippedFields, []);
    });
  });

  describe('truncated buffer handling', function () {
    describe('readVarint()', function () {
      it('throws on empty buffer', function () {
        const reader = new ProtobufReader(new Uint8Array(0));
        assert.throws(
          () => reader.readVarint(),
          /Truncated buffer: unexpected end of data while reading varint/
        );
      });

      it('throws when varint continuation bit set but no more bytes', function () {
        // 0x80 has the continuation bit set, indicating more bytes follow
        const reader = new ProtobufReader(new Uint8Array([0x80]));
        assert.throws(
          () => reader.readVarint(),
          /Truncated buffer: unexpected end of data while reading varint/
        );
      });

      it('throws on multi-byte varint truncated mid-sequence', function () {
        // A valid 3-byte varint would be [0x80, 0x80, 0x01]
        // Truncate after 2 bytes (both have continuation bit set)
        const reader = new ProtobufReader(new Uint8Array([0x80, 0x80]));
        assert.throws(
          () => reader.readVarint(),
          /Truncated buffer: unexpected end of data while reading varint/
        );
      });
    });

    describe('readBytes()', function () {
      it('throws when length exceeds remaining buffer', function () {
        // Varint 10 (0x0a) says 10 bytes follow, but only 3 are available
        const reader = new ProtobufReader(
          new Uint8Array([0x0a, 0x01, 0x02, 0x03])
        );
        assert.throws(
          () => reader.readBytes(),
          /Truncated buffer: expected 10 bytes at position 1, but only 3 available/
        );
      });

      it('throws when length exceeds buffer with zero remaining bytes', function () {
        // Varint 5 (0x05) says 5 bytes follow, but none are available
        const reader = new ProtobufReader(new Uint8Array([0x05]));
        assert.throws(
          () => reader.readBytes(),
          /Truncated buffer: expected 5 bytes at position 1, but only 0 available/
        );
      });

      it('succeeds when length matches remaining buffer exactly', function () {
        // Varint 3 (0x03) says 3 bytes follow, and exactly 3 are available
        const reader = new ProtobufReader(
          new Uint8Array([0x03, 0xaa, 0xbb, 0xcc])
        );
        const result = reader.readBytes();
        assert.deepStrictEqual(result, new Uint8Array([0xaa, 0xbb, 0xcc]));
        assert.ok(reader.isAtEnd());
      });
    });

    describe('readString()', function () {
      it('throws on truncated string', function () {
        // Length says 10 bytes but only 2 content bytes available
        const reader = new ProtobufReader(new Uint8Array([0x0a, 0x41, 0x42]));
        assert.throws(() => reader.readString(), /Truncated buffer/);
      });
    });
  });
});
