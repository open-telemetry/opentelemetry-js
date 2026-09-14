/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IExporterMetricsHelper<Internal> {
  name: 'span' | 'metric_data_point' | 'log';
  countItems: (request: Internal) => number;
}
