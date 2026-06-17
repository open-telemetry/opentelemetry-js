/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExportResult {
  code: ExportResultCode;
  error?: Error;
}

export enum ExportResultCode {
  SUCCESS,
  FAILED,
}
