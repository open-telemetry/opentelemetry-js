/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
