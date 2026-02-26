/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricReader, PushMetricExporter } from '@opentelemetry/sdk-metrics';

export class TestMetricReader extends MetricReader {
  private _exporter: PushMetricExporter;
  constructor(exporter: PushMetricExporter) {
    super({
      aggregationTemporalitySelector:
        exporter.selectAggregationTemporality?.bind(exporter),
    });
    this._exporter = exporter;
  }

  protected onForceFlush(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected onShutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async collectAndExport(): Promise<void> {
    const result = await this.collect();
    await new Promise<void>((resolve, reject) => {
      this._exporter.export(result.resourceMetrics, result => {
        if (result.error != null) {
          reject(result.error);
        } else {
          resolve();
        }
      });
    });
  }
}
