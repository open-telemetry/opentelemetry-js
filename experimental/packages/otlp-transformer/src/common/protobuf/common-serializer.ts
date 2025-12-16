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
import { ProtobufWriter } from './protobuf-writer';
import type { Attributes, HrTime } from '@opentelemetry/api';
import type { AnyValue, LogAttributes } from '@opentelemetry/api-logs';

/**
 * Write HrTime [seconds, nanoseconds] directly as fixed64 to the serializer.
 * Converts to nanoseconds and writes as 64-bit little-endian integer without allocations.
 *
 * HrTime represents: total_nanos = seconds * 1_000_000_000 + nanoseconds
 * We need to split this into low (bits 0-31) and high (bits 32-63).
 *
 * @param serializer - The protobuf writer
 * @param hrTime - HrTime tuple [seconds, nanoseconds]
 */
export function writeHrTimeAsFixed64(
  serializer: ProtobufWriter,
  hrTime: HrTime
): void {
  const seconds = hrTime[0];
  const nanos = hrTime[1];

  // Calculate total nanoseconds split into 32-bit parts
  // We use the fact that 1e9 < 2^30, so multiplication is safe for reasonable timestamps

  // For the low 32 bits: (seconds * 1e9 + nanos) & 0xFFFFFFFF
  // For the high 32 bits: floor((seconds * 1e9 + nanos) / 2^32)

  // Calculate seconds * 1e9 split into parts
  const secNanos = seconds * 1e9;
  const secNanosLow = secNanos >>> 0; // Low 32 bits of seconds * 1e9
  const secNanosHigh = (secNanos / 0x100000000) >>> 0; // High bits from seconds * 1e9

  // Add nanoseconds to the low part
  const totalLow = (secNanosLow + nanos) >>> 0;

  // Check for overflow from low to high (carry bit)
  const carry = secNanosLow + nanos >= 0x100000000 ? 1 : 0;
  const totalHigh = (secNanosHigh + carry) >>> 0;

  serializer.writeFixed64(totalLow, totalHigh);
}

/**
 * Write Attributes directly to protobuf as repeated KeyValue
 */
export function writeAttributes(
  writer: ProtobufWriter,
  attributes: Attributes | LogAttributes,
  fieldNumber: number
): void {
  for (const [key, value] of Object.entries(attributes)) {
    writer.writeTag(fieldNumber, 2);
    const kvStart = writer.startLengthDelimited();
    const startPos = writer.pos;
    writeKeyValue(writer, key, value);
    writer.finishLengthDelimited(kvStart, writer.pos - startPos);
  }
}

/**
 * Write a KeyValue pair directly to protobuf
 */
export function writeKeyValue(
  writer: ProtobufWriter,
  key: string,
  value: AnyValue
): void {
  writer.writeTag(1, 2);
  writer.writeString(key);
  writer.writeTag(2, 2);
  const valueStart = writer.startLengthDelimited();
  const startPos = writer.pos;
  writeAnyValue(writer, value);
  writer.finishLengthDelimited(valueStart, writer.pos - startPos);
}

/**
 * Write an AnyValue directly from raw attribute value to protobuf
 */
export function writeAnyValue(writer: ProtobufWriter, value: AnyValue): void {
  const t = typeof value;
  if (t === 'string') {
    writer.writeTag(1, 2);
    writer.writeString(value as string);
  } else if (t === 'boolean') {
    writer.writeTag(2, 0);
    writer.writeVarint((value as boolean) ? 1 : 0);
  } else if (t === 'number') {
    // Use isSafeInteger to avoid precision loss with large integers
    // Numbers outside the safe integer range should be serialized as doubles
    if (!Number.isSafeInteger(value as number)) {
      writer.writeTag(4, 1);
      writer.writeDouble(value as number);
    } else {
      writer.writeTag(3, 0);
      writer.writeVarint(value as number);
    }
  } else if (value instanceof Uint8Array) {
    writer.writeTag(7, 2);
    writer.writeBytes(value);
  } else if (Array.isArray(value)) {
    writer.writeTag(5, 2);
    const arrayStart = writer.startLengthDelimited();
    const arrayStartPos = writer.pos;
    for (const item of value) {
      writer.writeTag(1, 2);
      const itemStart = writer.startLengthDelimited();
      const itemStartPos = writer.pos;
      writeAnyValue(writer, item);
      writer.finishLengthDelimited(itemStart, writer.pos - itemStartPos);
    }
    writer.finishLengthDelimited(arrayStart, writer.pos - arrayStartPos);
  } else if (t === 'object' && value != null) {
    writer.writeTag(6, 2);
    const kvlistStart = writer.startLengthDelimited();
    const kvlistStartPos = writer.pos;
    for (const [k, v] of Object.entries(value as object)) {
      writer.writeTag(1, 2);
      const kvStart = writer.startLengthDelimited();
      const kvStartPos = writer.pos;
      writer.writeTag(1, 2);
      writer.writeString(k);
      writer.writeTag(2, 2);
      const valueStart = writer.startLengthDelimited();
      const valueStartPos = writer.pos;
      writeAnyValue(writer, v);
      writer.finishLengthDelimited(valueStart, writer.pos - valueStartPos);
      writer.finishLengthDelimited(kvStart, writer.pos - kvStartPos);
    }
    writer.finishLengthDelimited(kvlistStart, writer.pos - kvlistStartPos);
  }
  // Else: unsupported type, write nothing
}
