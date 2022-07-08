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

import * as api from '@opentelemetry/api';
import * as metrics from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import { MetricReader } from './export/MetricReader';
import { MeterProviderSharedState } from './state/MeterProviderSharedState';
import { MetricCollector } from './state/MetricCollector';
import { ForceFlushOptions, ShutdownOptions } from './types';
import { View } from './view/View';

/**
 * MeterProviderOptions provides an interface for configuring a MeterProvider.
 */
export interface MeterProviderOptions {
  /** Resource associated with metric telemetry  */
  resource?: Resource;
  views?: View[];
}

/**
 * This class implements the {@link metrics.MeterProvider} interface.
 */
export class MeterProvider implements metrics.MeterProvider {
  private _sharedState: MeterProviderSharedState;
  private _shutdown = false;

  constructor(options?: MeterProviderOptions) {
    this._sharedState = new MeterProviderSharedState(options?.resource ?? Resource.empty());
    if(options?.views != null && options.views.length > 0){
      for(const view of options.views){
        this._addView(view);
      }
    }
  }

  /**
   * Get a meter with the configuration of the MeterProvider.
   */
  getMeter(name: string, version = '', options: metrics.MeterOptions = {}): metrics.Meter {
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meter-creation
    if (this._shutdown) {
      api.diag.warn('A shutdown MeterProvider cannot provide a Meter');
      return metrics.NOOP_METER;
    }

    return this._sharedState
      .getMeterSharedState({ name, version, schemaUrl: options.schemaUrl })
      .meter;
  }

  /**
   * Register a {@link MetricReader} to the meter provider. After the
   * registration, the MetricReader can start metrics collection.
   *
   * @param metricReader the metric reader to be registered.
   */
  addMetricReader(metricReader: MetricReader) {
    const collector = new MetricCollector(this._sharedState, metricReader);
    metricReader.setMetricProducer(collector);
    this._sharedState.metricCollectors.push(collector);
  }

  private _addView(view: View) {
    this._sharedState.viewRegistry.addView(view);
  }

  /**
   * Flush all buffered data and shut down the MeterProvider and all registered
   * MetricReaders.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  async shutdown(options?: ShutdownOptions): Promise<void> {
    if (this._shutdown) {
      api.diag.warn('shutdown may only be called once per MeterProvider');
      return;
    }

    this._shutdown = true;

    await Promise.all(this._sharedState.metricCollectors.map(collector => {
      return collector.shutdown(options);
    }));
  }

  /**
   * Notifies all registered MetricReaders to flush any buffered data.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  async forceFlush(options?: ForceFlushOptions): Promise<void> {
    // do not flush after shutdown
    if (this._shutdown) {
      api.diag.warn('invalid attempt to force flush after MeterProvider shutdown');
      return;
    }

    await Promise.all(this._sharedState.metricCollectors.map(collector => {
      return collector.forceFlush(options);
    }));
  }
}
