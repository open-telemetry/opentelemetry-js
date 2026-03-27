/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  IExportLogsServiceResponse,
  IExportLogsPartialSuccess,
} from '../export-response';
import { ProtobufReader } from '../../common/protobuf/protobuf-reader';

/**
 * Parse an ExportLogsPartialSuccess embedded message from raw bytes.
 *
 * Field map (opentelemetry/proto/collector/logs/v1/logs_service.proto):
 *   1  rejected_log_records  int64   (varint)
 *   2  error_message         string  (length-delimited)
 */
function deserializePartialSuccess(
  data: Uint8Array
): IExportLogsPartialSuccess {
  const reader = new ProtobufReader(data);
  const result: IExportLogsPartialSuccess = {};

  while (!reader.isAtEnd()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1: // rejected_log_records (int64, varint)
        result.rejectedLogRecords = reader.readVarint();
        break;
      case 2: // error_message (string, length-delimited)
        result.errorMessage = reader.readString();
        break;
      default:
        reader.skip(wireType);
        break;
    }
  }

  return result;
}

/**
 * Parse an ExportLogsServiceResponse protobuf message from raw bytes.
 *
 * Field map (opentelemetry/proto/collector/logs/v1/logs_service.proto):
 *   1  partial_success  ExportLogsPartialSuccess  (length-delimited)
 */
export function deserializeExportLogsServiceResponse(
  data: Uint8Array
): IExportLogsServiceResponse {
  const reader = new ProtobufReader(data);
  const result: IExportLogsServiceResponse = {};

  while (!reader.isAtEnd()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1: // partial_success (ExportLogsPartialSuccess, length-delimited)
        result.partialSuccess = deserializePartialSuccess(reader.readBytes());
        break;
      default:
        reader.skip(wireType);
        break;
    }
  }

  return result;
}
