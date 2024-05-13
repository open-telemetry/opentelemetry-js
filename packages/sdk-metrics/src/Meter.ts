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
  Meter as IMeter,
  MetricOptions,
  Histogram,
  Counter,
  UpDownCounter,
  ObservableGauge,
  ObservableCounter,
  ObservableUpDownCounter,
  BatchObservableCallback,
  Observable,
  Attributes,
} from '@opentelemetry/api';
import {
  createInstrumentDescriptor,
  InstrumentType,
} from './InstrumentDescriptor';
import {
  CounterInstrument,
  GaugeInstrument,
  HistogramInstrument,
  ObservableCounterInstrument,
  ObservableGaugeInstrument,
  ObservableUpDownCounterInstrument,
  UpDownCounterInstrument,
} from './Instruments';
import { MeterSharedState } from './state/MeterSharedState';
import { Gauge } from './types';

/**
 * This class implements the {@link IMeter} interface.
 */
export class Meter implements IMeter {
  constructor(private _meterSharedState: MeterSharedState) {}

  /**
   * Create a {@link Gauge} instrument.
   * @experimental
   */
  createGauge<AttributesTypes extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): Gauge<AttributesTypes> {
    const descriptor = createInstrumentDescriptor(
      name,
      InstrumentType.GAUGE,
      options
    );
    const storage = this._meterSharedState.registerMetricStorage(descriptor);
    return new GaugeInstrument(storage, descriptor);
  }

  /**
   * Create a {@link Histogram} instrument.
   */
  createHistogram(name: string, options?: MetricOptions): Histogram {
    const descriptor = createInstrumentDescriptor(
      name,
      InstrumentType.HISTOGRAM,
      options
    );
    const storage = this._meterSharedState.registerMetricStorage(descriptor);
    return new HistogramInstrument(storage, descriptor);
  }

  /**
   * Create a {@link Counter} instrument.
   */
  createCounter(name: string, options?: MetricOptions): Counter {
    const descriptor = createInstrumentDescriptor(
      name,
      InstrumentType.COUNTER,
      options
    );
    const storage = this._meterSharedState.registerMetricStorage(descriptor);
    return new CounterInstrument(storage, descriptor);
  }

  /**
   * Create a {@link UpDownCounter} instrument.
   */
  createUpDownCounter(name: string, options?: MetricOptions): UpDownCounter {
    const descriptor = createInstrumentDescriptor(
      name,
      InstrumentType.UP_DOWN_COUNTER,
      options
    );
    const storage = this._meterSharedState.registerMetricStorage(descriptor);
    return new UpDownCounterInstrument(storage, descriptor);
  }

  /**
   * Create a {@link ObservableGauge} instrument.
   */
  createObservableGauge(
    name: string,
    options?: MetricOptions
  ): ObservableGauge {
    const descriptor = createInstrumentDescriptor(
      name,
      InstrumentType.OBSERVABLE_GAUGE,
      options
    );
    const storages =
      this._meterSharedState.registerAsyncMetricStorage(descriptor);
    return new ObservableGaugeInstrument(
      descriptor,
      storages,
      this._meterSharedState.observableRegistry
    );
  }

  /**
   * Create a {@link ObservableCounter} instrument.
   */
  createObservableCounter(
    name: string,
    options?: MetricOptions
  ): ObservableCounter {
    const descriptor = createInstrumentDescriptor(
      name,
      InstrumentType.OBSERVABLE_COUNTER,
      options
    );
    const storages =
      this._meterSharedState.registerAsyncMetricStorage(descriptor);
    return new ObservableCounterInstrument(
      descriptor,
      storages,
      this._meterSharedState.observableRegistry
    );
  }

  /**
   * Create a {@link ObservableUpDownCounter} instrument.
   */
  createObservableUpDownCounter(
    name: string,
    options?: MetricOptions
  ): ObservableUpDownCounter {
    const descriptor = createInstrumentDescriptor(
      name,
      InstrumentType.OBSERVABLE_UP_DOWN_COUNTER,
      options
    );
    const storages =
      this._meterSharedState.registerAsyncMetricStorage(descriptor);
    return new ObservableUpDownCounterInstrument(
      descriptor,
      storages,
      this._meterSharedState.observableRegistry
    );
  }

  /**
   * @see {@link Meter.addBatchObservableCallback}
   */
  addBatchObservableCallback(
    callback: BatchObservableCallback,
    observables: Observable[]
  ) {
    this._meterSharedState.observableRegistry.addBatchCallback(
      callback,
      observables
    );
  }

  /**
   * @see {@link Meter.removeBatchObservableCallback}
   */
  removeBatchObservableCallback(
    callback: BatchObservableCallback,
    observables: Observable[]
  ) {
    this._meterSharedState.observableRegistry.removeBatchCallback(
      callback,
      observables
    );
  }
}
