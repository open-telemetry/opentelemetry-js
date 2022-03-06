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

import * as metrics from '@opentelemetry/api-metrics-wip';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { createInstrumentDescriptor, InstrumentDescriptor, InstrumentType } from './InstrumentDescriptor';
import { Counter, Histogram, UpDownCounter } from './Instruments';
import { MeterProviderSharedState } from './state/MeterProviderSharedState';
import { MultiMetricStorage } from './state/MultiWritableMetricStorage';
import { SyncMetricStorage } from './state/SyncMetricStorage';
import { InstrumentationLibraryMetrics } from './export/MetricData';
import { isNotNullish } from './utils';
import { MetricCollectorHandle } from './state/MetricCollector';
import { HrTime } from '@opentelemetry/api';
import { AsyncMetricStorage } from './state/AsyncMetricStorage';
import { WritableMetricStorage } from './state/WritableMetricStorage';
import { MetricStorageRegistry } from './state/MetricStorageRegistry';

/**
 * This class implements the {@link metrics.Meter} interface.
 */
export class Meter implements metrics.Meter {
  private _metricStorageRegistry = new MetricStorageRegistry();

  constructor(private _meterProviderSharedState: MeterProviderSharedState, private _instrumentationLibrary: InstrumentationLibrary) {
    this._meterProviderSharedState.meters.push(this);
  }

  /**
   * Create a {@link metrics.Histogram} instrument.
   */
  createHistogram(name: string, options?: metrics.HistogramOptions): metrics.Histogram {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.HISTOGRAM, options);
    const storage = this._registerMetricStorage(descriptor);
    return new Histogram(storage, descriptor);
  }

  /**
   * Create a {@link metrics.Counter} instrument.
   */
  createCounter(name: string, options?: metrics.CounterOptions): metrics.Counter {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.COUNTER, options);
    const storage = this._registerMetricStorage(descriptor);
    return new Counter(storage, descriptor);
  }

  /**
   * Create a {@link metrics.UpDownCounter} instrument.
   */
  createUpDownCounter(name: string, options?: metrics.UpDownCounterOptions): metrics.UpDownCounter {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.UP_DOWN_COUNTER, options);
    const storage = this._registerMetricStorage(descriptor);
    return new UpDownCounter(storage, descriptor);
  }

  /**
   * Create a ObservableGauge instrument.
   */
  createObservableGauge(
    name: string,
    callback: metrics.ObservableCallback,
    options?: metrics.ObservableGaugeOptions,
  ): void {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_GAUGE, options);
    this._registerAsyncMetricStorage(descriptor, callback);
  }

  /**
   * Create a ObservableCounter instrument.
   */
  createObservableCounter(
    name: string,
    callback: metrics.ObservableCallback,
    options?: metrics.ObservableCounterOptions,
  ): void {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_COUNTER, options);
    this._registerAsyncMetricStorage(descriptor, callback);
  }

  /**
   * Create a ObservableUpDownCounter instrument.
   */
  createObservableUpDownCounter(
    name: string,
    callback: metrics.ObservableCallback,
    options?: metrics.ObservableUpDownCounterOptions,
  ): void {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_UP_DOWN_COUNTER, options);
    this._registerAsyncMetricStorage(descriptor, callback);
  }

  private _registerMetricStorage(descriptor: InstrumentDescriptor): WritableMetricStorage {
    const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationLibrary);
    const storages = views.map(view => this._metricStorageRegistry.register(SyncMetricStorage.create(view, descriptor)))
      .filter(isNotNullish);

    if (storages.length === 1) {
      return storages[0];
    }

    // This will be a no-op WritableMetricStorage when length is null.
    return new MultiMetricStorage(storages);
  }

  private _registerAsyncMetricStorage(descriptor: InstrumentDescriptor, callback: metrics.ObservableCallback) {
    const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationLibrary);
    views.forEach(view => {
      this._metricStorageRegistry.register(AsyncMetricStorage.create(view, descriptor, callback));
    });
  }

  /**
   * @internal
   * @param collector opaque handle of {@link MetricCollector} which initiated the collection.
   * @param collectionTime the HrTime at which the collection was initiated.
   * @returns the list of {@link MetricData} collected.
   */
  async collect(collector: MetricCollectorHandle, collectionTime: HrTime): Promise<InstrumentationLibraryMetrics> {
    const metricData = await Promise.all(this._metricStorageRegistry.getStorages().map(metricStorage => {
      return metricStorage.collect(
        collector,
        this._meterProviderSharedState.metricCollectors,
        this._meterProviderSharedState.sdkStartTime,
        collectionTime);
    }));

    return {
      instrumentationLibrary: this._instrumentationLibrary,
      metrics: metricData.filter(isNotNullish),
    };
  }
}
