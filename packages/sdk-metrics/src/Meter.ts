/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Meter as IMeter,
  MetricOptions,
  Gauge,
  Histogram,
  Counter,
  UpDownCounter,
  ObservableGauge,
  ObservableCounter,
  ObservableUpDownCounter,
  BatchObservableCallback,
  Observable,
} from '@opentelemetry/api';
import { createNoopMeter } from '@opentelemetry/api';
import { createInstrumentDescriptor } from './InstrumentDescriptor';
import {
  CounterInstrument,
  GaugeInstrument,
  HistogramInstrument,
  ObservableCounterInstrument,
  ObservableGaugeInstrument,
  ObservableUpDownCounterInstrument,
  UpDownCounterInstrument,
} from './Instruments';
import type { MeterSharedState } from './state/MeterSharedState';
import { InstrumentType } from './export/MetricData';
import type { MeterConfig } from './MeterConfig';
import { DEFAULT_METER_CONFIG } from './MeterConfig';

const NOOP_METER = createNoopMeter();

/**
 * This class implements the {@link IMeter} interface.
 */
export class Meter implements IMeter {
  private _meterSharedState: MeterSharedState;
  private _config: MeterConfig;

  constructor(meterSharedState: MeterSharedState, meterConfig?: MeterConfig) {
    this._meterSharedState = meterSharedState;
    this._config = meterConfig ?? DEFAULT_METER_CONFIG;
  }

  /**
   * Create a {@link Gauge} instrument.
   */
  createGauge(name: string, options?: MetricOptions): Gauge {
    if (this._config.disabled) {
      return NOOP_METER.createGauge(name, options);
    }
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
    if (this._config.disabled) {
      return NOOP_METER.createHistogram(name, options);
    }
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
    if (this._config.disabled) {
      return NOOP_METER.createCounter(name, options);
    }
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
    if (this._config.disabled) {
      return NOOP_METER.createUpDownCounter(name, options);
    }
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
    if (this._config.disabled) {
      return NOOP_METER.createObservableGauge(name, options);
    }
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
    if (this._config.disabled) {
      return NOOP_METER.createObservableCounter(name, options);
    }
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
    if (this._config.disabled) {
      return NOOP_METER.createObservableUpDownCounter(name, options);
    }
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
    if (this._config.disabled) {
      return;
    }
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