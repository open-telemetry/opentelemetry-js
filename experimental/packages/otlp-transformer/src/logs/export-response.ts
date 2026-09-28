/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IExportLogsServiceResponse {
  /** ExportLogsServiceResponse partialSuccess */
  partialSuccess?: IExportLogsPartialSuccess;
}

export interface IExportLogsPartialSuccess {
  /** ExportLogsPartialSuccess rejectedLogRecords */
  rejectedLogRecords?: number;

  /** ExportLogsPartialSuccess errorMessage */
  errorMessage?: string;
}
