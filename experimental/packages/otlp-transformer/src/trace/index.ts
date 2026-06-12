/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';

import type { IExporterMetricsHelper } from '../i-exporter-metrics-helper';

// IMPORTANT: exports added here are public
export type {
  IExportTracePartialSuccess,
  IExportTraceServiceResponse,
} from './export-response';

export const TraceExporterMetricsHelper: IExporterMetricsHelper<
  ReadableSpan[]
> = {
  name: 'span',
  countItems: (request: ReadableSpan[]) => request.length,
};
