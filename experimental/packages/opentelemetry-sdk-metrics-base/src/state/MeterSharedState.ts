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
import * as metrics from '@opentelemetry/api-metrics-wip';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { MetricData } from '..';
import { createInstrumentDescriptorWithView, InstrumentDescriptor } from '../InstrumentDescriptor';
import { isNotNullish, promiseFinally } from '../utils';
import { AsyncMetricStorage } from './AsyncMetricStorage';
import { MeterProviderSharedState } from './MeterProviderSharedState';
import { MetricCollectorHandle } from './MetricCollector';
import { MetricStorage } from './MetricStorage';
import { MultiMetricStorage } from './MultiWritableMetricStorage';
import { ObservableRegistry } from './ObservableRegistry';
import { SyncMetricStorage } from './SyncMetricStorage';

/**
 * An internal record for shared meter provider states.
 */
export class MeterSharedState {
  private _metricStorageRegistry = new Map<string, MetricStorage>();
  private _pendingCollectPromise: Promise<MetricData[]> | null = null;
  private _observableRegistry = new ObservableRegistry();

  constructor(private _meterProviderSharedState: MeterProviderSharedState, private _instrumentationLibrary: InstrumentationLibrary) {}

  registerMetricStorage(descriptor: InstrumentDescriptor) {
    const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationLibrary);
    const storages = views.map(view => {
      const viewDescriptor = createInstrumentDescriptorWithView(view, descriptor);
      const aggregator = view.aggregation.createAggregator(viewDescriptor);
      const storage = new SyncMetricStorage(viewDescriptor, aggregator, view.attributesProcessor);
      // TODO: handle conflicts
      this._metricStorageRegistry.set(viewDescriptor.name, storage);
      return storage;
    });
    if (storages.length === 1)  {
      return storages[0];
    }
    return new MultiMetricStorage(storages);
  }

  registerAsyncMetricStorage(descriptor: InstrumentDescriptor, callback: metrics.ObservableCallback) {
    const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationLibrary);
    views.forEach(view => {
      const viewDescriptor = createInstrumentDescriptorWithView(view, descriptor);
      const aggregator = view.aggregation.createAggregator(viewDescriptor);
      const storage = new AsyncMetricStorage(viewDescriptor, aggregator, view.attributesProcessor, callback, this._observableRegistry);
      this._observableRegistry.addCallback(callback, storage);
      // TODO: handle conflicts
      this._metricStorageRegistry.set(viewDescriptor.name, storage);
    });
  }

  /**
   * @param collector opaque handle of {@link MetricCollector} which initiated the collection.
   * @param collectionTime the HrTime at which the collection was initiated.
   * @returns the list of {@link MetricData} collected.
   */
  collect(collector: MetricCollectorHandle, collectionTime: HrTime): Promise<MetricData[]> {
    if (this._pendingCollectPromise != null) {
      return this._pendingCollectPromise;
    }

    /**
     * 1. Call all observable callbacks first.
     * 2. Collect metric result for the collector.
     */
    const promise = this._observableRegistry.observe()
      .then(() => {
        return Array.from(this._metricStorageRegistry.values()).map(metricStorage => {
          return metricStorage.collect(
            collector,
            this._meterProviderSharedState.metricCollectors,
            this._meterProviderSharedState.resource,
            this._instrumentationLibrary,
            this._meterProviderSharedState.sdkStartTime,
            collectionTime);
        })
        .filter(isNotNullish);
      });

    this._pendingCollectPromise = promiseFinally(promise, () => {
      this._pendingCollectPromise = null;
    });
    return this._pendingCollectPromise;
  }
}
