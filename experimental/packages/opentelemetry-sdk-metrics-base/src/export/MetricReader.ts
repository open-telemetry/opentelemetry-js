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

import { AggregationTemporality } from './AggregationTemporality';
import { MetricExporter } from './MetricExporter';
import { MetricProducer } from './MetricProducer';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#metricreader

export abstract class MetricReader {
  private _shutdown = false;
  private _metricProducer?: MetricProducer;

  constructor(private _exporter: MetricExporter) {}

  setMetricProducer(metricProducer: MetricProducer) {
    this._metricProducer = metricProducer;
  }

  getPreferredAggregationTemporality(): AggregationTemporality {
    return this._exporter.getPreferredAggregationTemporality();
  }

  async collect(): Promise<void> {
    if (this._metricProducer === undefined) {
      throw new Error('MetricReader is not bound to a MeterProvider');
    }
    const metrics = await this._metricProducer.collect();

    // errors thrown to caller
    await this._exporter.export(metrics);
  }

  async shutdown(): Promise<void> {
    if (this._shutdown) {
      return;
    }

    this._shutdown = true;
    // errors thrown to caller
    await this._exporter.shutdown();
  }

  async forceFlush(): Promise<void> {
    if (this._shutdown) {
      return;
    }

    // errors thrown to caller
    await this._exporter.forceFlush();
  }
}
