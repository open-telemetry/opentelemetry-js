/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ResourceMetrics } from '@opentelemetry/sdk-metrics';

import type { IExporterMetricsHelper } from '../i-exporter-metrics-helper';

// IMPORTANT: exports added here are public
export type {
  IExportMetricsPartialSuccess,
  IExportMetricsServiceResponse,
} from './export-response';

export const MetricsExporterMetricsHelper: IExporterMetricsHelper<ResourceMetrics> =
  {
    name: 'metric_data_point',
    countItems: (request: ResourceMetrics) => {
      let count = 0;
      for (const scopeMetrics of request.scopeMetrics) {
        for (const metric of scopeMetrics.metrics) {
          count += metric.dataPoints.length;
        }
      }
      return count;
    },
  };
