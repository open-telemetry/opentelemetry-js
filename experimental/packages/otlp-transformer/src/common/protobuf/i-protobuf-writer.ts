/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IProtobufWriter {
  pos: number;
  writeTag(fieldNumber: number, wireType: number): void;
  writeVarint(value: number): void;
  writeSint32(value: number): void;
  writeSfixed64(value: number): void;
  writeFixed32(value: number): void;
  writeFixed64(low: number, high: number): void;
  writeBytes(bytes: Uint8Array): void;
  writeString(str: string): void;
  writeDouble(value: number): void;
  startLengthDelimited(): number;
  finishLengthDelimited(pos: number, length: number): void;
}
