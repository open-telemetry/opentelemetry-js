/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableLogRecord } from '@opentelemetry/sdk-logs';

import type { IExporterMetricsHelper } from '../i-exporter-metrics-helper';

// IMPORTANT: exports added here are public
export type {
  IExportLogsServiceResponse,
  IExportLogsPartialSuccess,
} from './export-response';

export const LogsExporterMetricsHelper: IExporterMetricsHelper<
  ReadableLogRecord[]
> = {
  name: 'log',
  countItems: (request: ReadableLogRecord[]) => request.length,
};
