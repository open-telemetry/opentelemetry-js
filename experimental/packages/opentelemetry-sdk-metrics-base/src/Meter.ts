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

import * as metrics from '@opentelemetry/api-metrics';
import { createInstrumentDescriptor, InstrumentType } from './InstrumentDescriptor';
import { CounterInstrument, HistogramInstrument, UpDownCounterInstrument } from './Instruments';
import { MeterSharedState } from './state/MeterSharedState';

/**
 * This class implements the {@link metrics.Meter} interface.
 */
export class Meter implements metrics.Meter {
  constructor(private _meterSharedState: MeterSharedState) {}

  /**
   * Create a {@link metrics.Histogram} instrument.
   */
  createHistogram(name: string, options?: metrics.HistogramOptions): metrics.Histogram {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.HISTOGRAM, options);
    const storage = this._meterSharedState.registerMetricStorage(descriptor);
    return new HistogramInstrument(storage, descriptor);
  }

  /**
   * Create a {@link metrics.Counter} instrument.
   */
  createCounter(name: string, options?: metrics.CounterOptions): metrics.Counter {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.COUNTER, options);
    const storage = this._meterSharedState.registerMetricStorage(descriptor);
    return new CounterInstrument(storage, descriptor);
  }

  /**
   * Create a {@link metrics.UpDownCounter} instrument.
   */
  createUpDownCounter(name: string, options?: metrics.UpDownCounterOptions): metrics.UpDownCounter {
    const descriptor = createInstrumentDescriptor(name, InstrumentType.UP_DOWN_COUNTER, options);
    const storage = this._meterSharedState.registerMetricStorage(descriptor);
    return new UpDownCounterInstrument(storage, descriptor);
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
    this._meterSharedState.registerAsyncMetricStorage(descriptor, callback);
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
    this._meterSharedState.registerAsyncMetricStorage(descriptor, callback);
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
    this._meterSharedState.registerAsyncMetricStorage(descriptor, callback);
  }
}
