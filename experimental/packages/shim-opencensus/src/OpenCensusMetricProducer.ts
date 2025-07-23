/*
 * Copyright 2018, OpenCensus Authors
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

import * as oc from '@opencensus/core';
import { emptyResource } from '@opentelemetry/resources';
import {
  CollectionResult,
  MetricData,
  MetricProducer,
  ScopeMetrics,
} from '@opentelemetry/sdk-metrics';
import { mapOcMetric } from './metric-transform';
import { VERSION } from './version';

const SCOPE = {
  name: '@opentelemetry/shim-opencensus',
  version: VERSION,
} as const;

interface OpenCensusMetricProducerOptions {
  /**
   * An instance of OpenCensus MetricProducerManager. If not provided,
   * `oc.Metrics.getMetricProducerManager()` will be used.
   */
  openCensusMetricProducerManager?: oc.MetricProducerManager;
}

/**
 * A {@link MetricProducer} which collects metrics from OpenCensus. Provide an instance to your
 * {@link MetricReader} when you create it to include all OpenCensus metrics in the collection
 * result:
 *
 * @example
 * ```
 * const reader = new PeriodicExportingMetricReader({
 *   metricProducers: [new OpenCensusMetricProducer()],
 *   exporter: exporter,
 * });
 * const meterProvider = new MeterProvider({
 *   readers: [reader],
 * });
 * ```
 */
export class OpenCensusMetricProducer implements MetricProducer {
  private _openCensusMetricProducerManager: oc.MetricProducerManager;

  constructor(options?: OpenCensusMetricProducerOptions) {
    this._openCensusMetricProducerManager =
      options?.openCensusMetricProducerManager ??
      oc.Metrics.getMetricProducerManager();
  }

  async collect(): Promise<CollectionResult> {
    const metrics = await this._collectOpenCensus();
    const scopeMetrics: ScopeMetrics[] =
      metrics.length === 0
        ? []
        : [
            {
              scope: SCOPE,
              metrics,
            },
          ];

    return {
      errors: [],
      resourceMetrics: {
        // Resource is ignored by the SDK, it just uses the SDK's resource
        resource: emptyResource(),
        scopeMetrics,
      },
    };
  }

  private async _collectOpenCensus(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];

    // The use of oc.Metrics.getMetricProducerManager() was adapted from
    // https://github.com/census-instrumentation/opencensus-node/blob/d46c8891b15783803d724b717db9a8c22cb73d6a/packages/opencensus-exporter-stackdriver/src/stackdriver-monitoring.ts#L122
    for (const metricProducer of this._openCensusMetricProducerManager.getAllMetricProducer()) {
      for (const metric of metricProducer.getMetrics()) {
        const metricData = mapOcMetric(metric);
        if (metricData !== null) {
          metrics.push(metricData);
        }
      }
    }

    return metrics;
  }
}
