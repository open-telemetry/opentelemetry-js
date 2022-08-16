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

import { HrTime } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import { MetricCollectOptions } from '../export/MetricProducer';
import { ScopeMetrics } from '../export/MetricData';
import { createInstrumentDescriptorWithView, InstrumentDescriptor } from '../InstrumentDescriptor';
import { Meter } from '../Meter';
import { isNotNullish } from '../utils';
import { AsyncMetricStorage } from './AsyncMetricStorage';
import { MeterProviderSharedState } from './MeterProviderSharedState';
import { MetricCollectorHandle } from './MetricCollector';
import { MetricStorageRegistry } from './MetricStorageRegistry';
import { MultiMetricStorage } from './MultiWritableMetricStorage';
import { ObservableRegistry } from './ObservableRegistry';
import { SyncMetricStorage } from './SyncMetricStorage';

/**
 * An internal record for shared meter provider states.
 */
export class MeterSharedState {
  private _metricStorageRegistry = new MetricStorageRegistry();
  observableRegistry = new ObservableRegistry();
  meter: Meter;

  constructor(private _meterProviderSharedState: MeterProviderSharedState, private _instrumentationScope: InstrumentationScope) {
    this.meter = new Meter(this);
  }

  registerMetricStorage(descriptor: InstrumentDescriptor) {
    const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationScope);
    const storages = views
      .map(view => {
        const viewDescriptor = createInstrumentDescriptorWithView(view, descriptor);
        const aggregator = view.aggregation.createAggregator(viewDescriptor);
        const storage = new SyncMetricStorage(viewDescriptor, aggregator, view.attributesProcessor);
        return this._metricStorageRegistry.register(storage);
      })
      .filter(isNotNullish);
    if (storages.length === 1)  {
      return storages[0];
    }
    return new MultiMetricStorage(storages);
  }

  registerAsyncMetricStorage(descriptor: InstrumentDescriptor) {
    const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationScope);
    const storages = views
      .map(view => {
        const viewDescriptor = createInstrumentDescriptorWithView(view, descriptor);
        const aggregator = view.aggregation.createAggregator(viewDescriptor);
        const viewStorage = new AsyncMetricStorage(viewDescriptor, aggregator, view.attributesProcessor);
        return this._metricStorageRegistry.register(viewStorage);
      })
      .filter(isNotNullish);
    return storages;
  }

  /**
   * @param collector opaque handle of {@link MetricCollector} which initiated the collection.
   * @param collectionTime the HrTime at which the collection was initiated.
   * @returns the list of metric data collected.
   */
  async collect(collector: MetricCollectorHandle, collectionTime: HrTime, options?: MetricCollectOptions): Promise<ScopeMetricsResult> {
    /**
     * 1. Call all observable callbacks first.
     * 2. Collect metric result for the collector.
     */
    const errors = await this.observableRegistry.observe(collectionTime, options?.timeoutMillis);
    const metricDataList = Array.from(this._metricStorageRegistry.getStorages())
      .map(metricStorage => {
        return metricStorage.collect(
          collector,
          this._meterProviderSharedState.metricCollectors,
          collectionTime);
      })
      .filter(isNotNullish);

    return {
      scopeMetrics: {
        scope: this._instrumentationScope,
        metrics: metricDataList.filter(isNotNullish),
      },
      errors,
    };
  }
}

interface ScopeMetricsResult {
  scopeMetrics: ScopeMetrics;
  errors: unknown[];
}
