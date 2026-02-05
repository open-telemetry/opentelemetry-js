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
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { AggregationTemporality } from './AggregationTemporality';
import { ResourceMetrics, InstrumentType } from './MetricData';
import { PushMetricExporter } from './MetricExporter';
import {
  AggregationTemporalitySelector,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from './AggregationSelector';

interface ConsoleMetricExporterOptions {
  temporalitySelector?: AggregationTemporalitySelector;
}

function log(payload: unknown): void {
  /**
   * String(payload) fallback path is currently redundant because
   * hashAttributes invokes JSON.stringify during metric registration. Reinstate
   * fallback logic below if hashAttributes logic is changed to standardise
   * implementation with ConsoleSpanExporter and ConsoleLogRecordExporter, and
   * unskip the test.
   */
  // let serialized: string;
  // try {
  //   serialized = JSON.stringify(
  //     payload,
  //     (_key, value) => (value === undefined ? null : value),
  //     2
  //   );
  // } catch {
  //   serialized = String(payload);
  // }

  const serialized = JSON.stringify(
    payload,
    (_key, value) => (value === undefined ? null : value),
    2
  );

  /* eslint-disable-next-line no-console */
  console.log(serialized);
}

/**
 * This is an implementation of {@link PushMetricExporter} that prints metrics to the
 * console. This class can be used for diagnostic purposes.
 *
 * NOTE: This {@link PushMetricExporter} is intended for diagnostics use only, output rendered to the console may change at any time.
 */

/* eslint-disable no-console */
export class ConsoleMetricExporter implements PushMetricExporter {
  protected _shutdown = false;
  protected _temporalitySelector: AggregationTemporalitySelector;

  constructor(options?: ConsoleMetricExporterOptions) {
    this._temporalitySelector =
      options?.temporalitySelector ?? DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
  }

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._shutdown) {
      // If the exporter is shutting down, by spec, we need to return FAILED as export result
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    return ConsoleMetricExporter._sendMetrics(metrics, resultCallback);
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  selectAggregationTemporality(
    _instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._temporalitySelector(_instrumentType);
  }

  shutdown(): Promise<void> {
    this._shutdown = true;
    return Promise.resolve();
  }

  private static _sendMetrics(
    metrics: ResourceMetrics,
    done: (result: ExportResult) => void
  ): void {
    for (const scopeMetrics of metrics.scopeMetrics) {
      for (const metric of scopeMetrics.metrics) {
        log({
          descriptor: metric.descriptor,
          dataPointType: metric.dataPointType,
          dataPoints: metric.dataPoints,
        });
      }
    }

    done({ code: ExportResultCode.SUCCESS });
  }
}
