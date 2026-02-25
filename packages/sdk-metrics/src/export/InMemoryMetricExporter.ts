/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExportResultCode } from '@opentelemetry/core';
import { ExportResult } from '@opentelemetry/core';
import { AggregationTemporality } from './AggregationTemporality';
import { InstrumentType, ResourceMetrics } from './MetricData';
import { PushMetricExporter } from './MetricExporter';

/**
 * In-memory Metrics Exporter is a Push Metric Exporter
 * which accumulates metrics data in the local memory and
 * allows to inspect it (useful for e.g. unit tests).
 */
export class InMemoryMetricExporter implements PushMetricExporter {
  protected _shutdown = false;
  protected _aggregationTemporality: AggregationTemporality;
  private _metrics: ResourceMetrics[] = [];

  constructor(aggregationTemporality: AggregationTemporality) {
    this._aggregationTemporality = aggregationTemporality;
  }

  /**
   * @inheritedDoc
   */
  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    // Avoid storing metrics when exporter is shutdown
    if (this._shutdown) {
      setTimeout(() => resultCallback({ code: ExportResultCode.FAILED }), 0);
      return;
    }

    this._metrics.push(metrics);
    setTimeout(() => resultCallback({ code: ExportResultCode.SUCCESS }), 0);
  }

  /**
   * Returns all the collected resource metrics
   * @returns ResourceMetrics[]
   */
  public getMetrics(): ResourceMetrics[] {
    return this._metrics;
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  reset() {
    this._metrics = [];
  }

  selectAggregationTemporality(
    _instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._aggregationTemporality;
  }

  shutdown(): Promise<void> {
    this._shutdown = true;
    return Promise.resolve();
  }
}
