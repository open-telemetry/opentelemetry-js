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

import {
  Aggregation,
  AggregationTemporality,
  InstrumentType,
  MetricReader,
  PushMetricExporter
} from '@opentelemetry/sdk-metrics';

export class TestMetricReader extends MetricReader {
  constructor(private _exporter: PushMetricExporter) {
    super();
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
          return;
        } else {
          resolve();
        }
      });
    });
  }

  selectAggregation(instrumentType: InstrumentType): Aggregation {
    return Aggregation.Default();
  }

  selectAggregationTemporality(instrumentType: InstrumentType): AggregationTemporality {
    return this._exporter.selectAggregationTemporality(instrumentType);
  }
}
