/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IExportTraceServiceResponse {
  /** ExportTraceServiceResponse partialSuccess */
  partialSuccess?: IExportTracePartialSuccess;
}

export interface IExportTracePartialSuccess {
  /** ExportLogsServiceResponse rejectedLogRecords */
  rejectedSpans?: number;

  /** ExportLogsServiceResponse errorMessage */
  errorMessage?: string;
}
