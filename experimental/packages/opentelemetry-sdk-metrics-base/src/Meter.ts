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
import {
  createInstrumentDescriptor, InstrumentDescriptor
} from './InstrumentDescriptor';
import { Counter, Histogram, InstrumentType, UpDownCounter } from './Instruments';
import { MeterProviderSharedState } from './state/MeterProviderSharedState';
import { MultiMetricStorage } from './state/MultiWritableMetricStorage';
import { SyncMetricStorage } from './state/SyncMetricStorage';
import { MetricData } from './export/MetricData';
import { isNotNullish } from './utils';
import { MetricCollectorHandle } from './state/MetricCollector';
import { AsyncMetricStorage } from './state/AsyncMetricStorage';
import { HrTime } from '@opentelemetry/api';
import { WritableMetricStorage } from './state/WritableMetricStorage';
import { MetricStorageRegistry } from './state/MetricStorageRegistry';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#meter

export class Meter implements metrics.Meter {
  private _metricStorageRegistry = new MetricStorageRegistry();

  // instrumentation library required by spec to be on meter
  // spec requires provider config changes to apply to previously created meters, achieved by holding a reference to the provider
  constructor(private _meterProviderSharedState: MeterProviderSharedState, private _instrumentationLibrary: InstrumentationLibrary) {
    this._meterProviderSharedState.meters.push(this);
  }

  /** this exists just to prevent ts errors from unused variables and may be removed */
  getInstrumentationLibrary(): InstrumentationLibrary {
    return this._instrumentationLibrary;
  }

  createHistogram(name: string, options?: metrics.HistogramOptions): metrics.Histogram {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.HISTOGRAM, options);
    const storage = this._registerMetricStorage(descriptor);
    return new Histogram(storage, descriptor);
  }

  createCounter(name: string, options?: metrics.CounterOptions): metrics.Counter {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.COUNTER, options);
    const storage = this._registerMetricStorage(descriptor);
    return new Counter(storage, descriptor);
  }

  createUpDownCounter(name: string, options?: metrics.UpDownCounterOptions): metrics.UpDownCounter {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.UP_DOWN_COUNTER, options);
    const storage = this._registerMetricStorage(descriptor);
    return new UpDownCounter(storage, descriptor);
  }

  createObservableGauge(
    name: string,
    callback: metrics.ObservableCallback,
    options?: metrics.ObservableGaugeOptions,
  ): void {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_GAUGE, options);
    this._registerAsyncMetricStorage(descriptor, callback);
  }

  createObservableCounter(
    name: string,
    callback: metrics.ObservableCallback,
    options?: metrics.ObservableCounterOptions,
  ): void {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_COUNTER, options);
    this._registerAsyncMetricStorage(descriptor, callback);
  }

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

  async collect(collector: MetricCollectorHandle, collectionTime: HrTime): Promise<MetricData[]> {
    const result = await Promise.all(Array.from(this._metricStorageRegistry.getStorages()).map(metricStorage => {
      return metricStorage.collect(
        collector,
        this._meterProviderSharedState.metricCollectors,
        this._meterProviderSharedState.resource,
        this._instrumentationLibrary,
        this._meterProviderSharedState.sdkStartTime,
        collectionTime);
    }));
    return result.filter(isNotNullish);
  }
}
