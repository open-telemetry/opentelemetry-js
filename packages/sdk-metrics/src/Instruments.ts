/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  context as contextApi,
  diag,
  Context,
  Attributes,
  ValueType,
  UpDownCounter,
  Counter,
  Gauge,
  Histogram,
  Observable,
  ObservableCallback,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
} from '@opentelemetry/api';
import { millisToHrTime } from '@opentelemetry/core';
import { InstrumentDescriptor } from './InstrumentDescriptor';
import { ObservableRegistry } from './state/ObservableRegistry';
import {
  AsyncWritableMetricStorage,
  WritableMetricStorage,
} from './state/WritableMetricStorage';

export class SyncInstrument {
  private _writableMetricStorage: WritableMetricStorage;
  protected _descriptor: InstrumentDescriptor;

  constructor(
    writableMetricStorage: WritableMetricStorage,
    descriptor: InstrumentDescriptor
  ) {
    this._writableMetricStorage = writableMetricStorage;
    this._descriptor = descriptor;
  }

  protected _record(
    value: number,
    attributes: Attributes = {},
    context: Context = contextApi.active()
  ) {
    if (typeof value !== 'number') {
      diag.warn(
        `non-number value provided to metric ${this._descriptor.name}: ${value}`
      );
      return;
    }
    if (
      this._descriptor.valueType === ValueType.INT &&
      !Number.isInteger(value)
    ) {
      diag.warn(
        `INT value type cannot accept a floating-point value for ${this._descriptor.name}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
      // ignore non-finite values.
      if (!Number.isInteger(value)) {
        return;
      }
    }
    this._writableMetricStorage.record(
      value,
      attributes,
      context,
      millisToHrTime(Date.now())
    );
  }
}

/**
 * The class implements {@link UpDownCounter} interface.
 */
export class UpDownCounterInstrument
  extends SyncInstrument
  implements UpDownCounter
{
  /**
   * Increment value of counter by the input. Inputs may be negative.
   */
  add(value: number, attributes?: Attributes, ctx?: Context): void {
    this._record(value, attributes, ctx);
  }
}

/**
 * The class implements {@link Counter} interface.
 */
export class CounterInstrument extends SyncInstrument implements Counter {
  /**
   * Increment value of counter by the input. Inputs may not be negative.
   */
  add(value: number, attributes?: Attributes, ctx?: Context): void {
    if (value < 0) {
      diag.warn(
        `negative value provided to counter ${this._descriptor.name}: ${value}`
      );
      return;
    }

    this._record(value, attributes, ctx);
  }
}

/**
 * The class implements {@link Gauge} interface.
 */
export class GaugeInstrument extends SyncInstrument implements Gauge {
  /**
   * Records a measurement.
   */
  record(value: number, attributes?: Attributes, ctx?: Context): void {
    this._record(value, attributes, ctx);
  }
}

/**
 * The class implements {@link Histogram} interface.
 */
export class HistogramInstrument extends SyncInstrument implements Histogram {
  /**
   * Records a measurement. Value of the measurement must not be negative.
   */
  record(value: number, attributes?: Attributes, ctx?: Context): void {
    if (value < 0) {
      diag.warn(
        `negative value provided to histogram ${this._descriptor.name}: ${value}`
      );
      return;
    }
    this._record(value, attributes, ctx);
  }
}

export class ObservableInstrument implements Observable {
  /** @internal */
  _metricStorages: AsyncWritableMetricStorage[];
  /** @internal */
  _descriptor: InstrumentDescriptor;
  private _observableRegistry: ObservableRegistry;

  constructor(
    descriptor: InstrumentDescriptor,
    metricStorages: AsyncWritableMetricStorage[],
    observableRegistry: ObservableRegistry
  ) {
    this._descriptor = descriptor;
    this._metricStorages = metricStorages;
    this._observableRegistry = observableRegistry;
  }

  /**
   * @see {Observable.addCallback}
   */
  addCallback(callback: ObservableCallback) {
    this._observableRegistry.addCallback(callback, this);
  }

  /**
   * @see {Observable.removeCallback}
   */
  removeCallback(callback: ObservableCallback) {
    this._observableRegistry.removeCallback(callback, this);
  }
}

export class ObservableCounterInstrument
  extends ObservableInstrument
  implements ObservableCounter {}
export class ObservableGaugeInstrument
  extends ObservableInstrument
  implements ObservableGauge {}
export class ObservableUpDownCounterInstrument
  extends ObservableInstrument
  implements ObservableUpDownCounter {}

export function isObservableInstrument(
  it: unknown
): it is ObservableInstrument {
  return it instanceof ObservableInstrument;
}
