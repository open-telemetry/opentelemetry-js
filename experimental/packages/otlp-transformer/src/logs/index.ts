/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableLogRecord } from '@opentelemetry/sdk-logs';

import type { IExporterSignal } from '../i-signal';

// IMPORTANT: exports added here are public
export type {
  IExportLogsServiceResponse,
  IExportLogsPartialSuccess,
} from './export-response';

export const LogsSignal: IExporterSignal<ReadableLogRecord[]> = {
  name: 'log',
  countItems: (request: ReadableLogRecord[]) => request.length,
};
