/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IExporterSignal<Internal> {
  name: 'span' | 'metric_data_point' | 'log';
  countItems: (request: Internal) => number;
}
