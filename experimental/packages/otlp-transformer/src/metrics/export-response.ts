/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IExportMetricsServiceResponse {
  /** ExportMetricsServiceResponse partialSuccess */
  partialSuccess?: IExportMetricsPartialSuccess;
}

export interface IExportMetricsPartialSuccess {
  /** ExportMetricsPartialSuccess rejectedDataPoints */
  rejectedDataPoints?: number;

  /** ExportMetricsPartialSuccess errorMessage */
  errorMessage?: string;
}
