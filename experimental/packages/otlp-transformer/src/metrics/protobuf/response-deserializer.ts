/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  IExportMetricsServiceResponse,
  IExportMetricsPartialSuccess,
} from '../export-response';
import { ProtobufReader } from '../../common/protobuf/protobuf-reader';

/**
 * Parse an ExportMetricsPartialSuccess embedded message from raw bytes.
 *
 * Field map (opentelemetry/proto/collector/metrics/v1/metrics_service.proto):
 *   1  rejected_data_points  int64   (varint)
 *   2  error_message         string  (length-delimited)
 */
function deserializePartialSuccess(
  data: Uint8Array
): IExportMetricsPartialSuccess {
  const reader = new ProtobufReader(data);
  const result: IExportMetricsPartialSuccess = {};

  while (!reader.isAtEnd()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1: // rejected_data_points (int64, varint)
        if (wireType === 0) {
          result.rejectedDataPoints = reader.readVarint();
        } else {
          reader.skip(wireType);
        }
        break;
      case 2: // error_message (string, length-delimited)
        if (wireType === 2) {
          result.errorMessage = reader.readString();
        } else {
          reader.skip(wireType);
        }
        break;
      default:
        reader.skip(wireType);
        break;
    }
  }

  return result;
}

/**
 * Parse an ExportMetricsServiceResponse protobuf message from raw bytes.
 *
 * Field map (opentelemetry/proto/collector/metrics/v1/metrics_service.proto):
 *   1  partial_success  ExportMetricsPartialSuccess  (length-delimited)
 */
export function deserializeExportMetricsServiceResponse(
  data: Uint8Array
): IExportMetricsServiceResponse {
  const reader = new ProtobufReader(data);
  const result: IExportMetricsServiceResponse = {};

  while (!reader.isAtEnd()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1: // partial_success (ExportMetricsPartialSuccess, length-delimited)
        if (wireType === 2) {
          result.partialSuccess = deserializePartialSuccess(reader.readBytes());
        } else {
          reader.skip(wireType);
        }
        break;
      default:
        reader.skip(wireType);
        break;
    }
  }

  return result;
}
