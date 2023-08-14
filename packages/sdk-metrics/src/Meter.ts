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
  diag,
} from '@opentelemetry/api';
import {
  createInstrumentDescriptor,
  InstrumentType,
  isValidName,
} from './InstrumentDescriptor';
import {
  CounterInstrument,
  HistogramInstrument,
  ObservableCounterInstrument,
  ObservableGaugeInstrument,
  ObservableUpDownCounterInstrument,
  UpDownCounterInstrument,
} from './Instruments';
import { MeterSharedState } from './state/MeterSharedState';

/**
 * This class implements the {@link IMeter} interface.
 */
export class Meter implements IMeter {
  constructor(private _meterSharedState: MeterSharedState) {}

  /**
   * Create a {@link Histogram} instrument.
   */
  createHistogram(name: string, options?: MetricOptions): Histogram {
    this._warnIfInvalidName(name);
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
    this._warnIfInvalidName(name);
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
    this._warnIfInvalidName(name);
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
    this._warnIfInvalidName(name);
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
    this._warnIfInvalidName(name);
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
    this._warnIfInvalidName(name);
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

  _warnIfInvalidName(name: string) {
    if (!isValidName(name)) {
      diag.warn(
        `Invalid metric name: "${name}". The metric name should be a ASCII string with a length no greater than 63 characters.`
      );
    }
  }
}
