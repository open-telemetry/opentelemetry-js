/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as protobuf from 'protobufjs';

export interface ExportType<T, R = T & { toJSON: () => unknown }> {
  encode(message: T, writer?: protobuf.Writer): protobuf.Writer;
  decode(reader: protobuf.Reader | Uint8Array, length?: number): R;
}
