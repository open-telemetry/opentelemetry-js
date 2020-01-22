/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/api';
import { hrTime } from '@opentelemetry/core';
import {
  BoundCounter,
  BoundGauge,
  BaseBoundInstrument,
} from './BoundInstrument';
import { MetricOptions } from './types';
import {
  ReadableMetric,
  MetricDescriptor,
  MetricDescriptorType,
} from './export/types';

/** This is a SDK implementation of {@link Metric} interface. */
export abstract class Metric<T extends BaseBoundInstrument>
  implements types.Metric<T> {
  protected readonly _monotonic: boolean;
  protected readonly _disabled: boolean;
  protected readonly _valueType: types.ValueType;
  protected readonly _logger: types.Logger;
  private readonly _metricDescriptor: MetricDescriptor;
  private readonly _instruments: Map<string, T> = new Map();

  constructor(
    private readonly _name: string,
    private readonly _options: MetricOptions,
    private readonly _type: MetricDescriptorType
  ) {
    this._monotonic = _options.monotonic;
    this._disabled = _options.disabled;
    this._valueType = _options.valueType;
    this._logger = _options.logger;
    this._metricDescriptor = this._getMetricDescriptor();
  }

  /**
   * Returns an Instrument associated with specified LabelSet.
   * It is recommended to keep a reference to the Instrument instead of always
   * calling this method for each operation.
   * @param labelSet the canonicalized LabelSet used to associate with this metric instrument.
   */
  bind(labelSet: types.LabelSet): T {
    if (this._instruments.has(labelSet.identifier))
      return this._instruments.get(labelSet.identifier)!;

    const instrument = this._makeInstrument(labelSet);
    this._instruments.set(labelSet.identifier, instrument);
    return instrument;
  }

  /**
   * Returns a Instrument for a metric with all labels not set.
   */
  getDefaultBound(): T {
    // @todo: implement this method
    this._logger.error('not implemented yet');
    throw new Error('not implemented yet');
  }

  /**
   * Removes the Instrument from the metric, if it is present.
   * @param labelSet the canonicalized LabelSet used to associate with this metric instrument.
   */
  unbind(labelSet: types.LabelSet): void {
    this._instruments.delete(labelSet.identifier);
  }

  /**
   * Clears all Instruments from the Metric.
   */
  clear(): void {
    this._instruments.clear();
  }

  setCallback(fn: () => void): void {
    // @todo: implement this method
    this._logger.error('not implemented yet');
    return;
  }

  /**
   * Provides a ReadableMetric with one or more TimeSeries.
   * @returns The ReadableMetric, or null if TimeSeries is not present in
   *     Metric.
   */
  get(): ReadableMetric | null {
    if (this._instruments.size === 0) return null;

    const timestamp = hrTime();
    return {
      descriptor: this._metricDescriptor,
      timeseries: Array.from(this._instruments, ([_, instrument]) =>
        instrument.getTimeSeries(timestamp)
      ),
    };
  }

  private _getMetricDescriptor(): MetricDescriptor {
    return {
      name: this._name,
      description: this._options.description,
      unit: this._options.unit,
      labelKeys: this._options.labelKeys,
      type: this._type,
      monotonic: this._monotonic,
    };
  }

  protected abstract _makeInstrument(labelSet: types.LabelSet): T;
}

/** This is a SDK implementation of Counter Metric. */
export class CounterMetric extends Metric<BoundCounter>
  implements Pick<types.MetricUtils, 'add'> {
  constructor(
    name: string,
    options: MetricOptions,
    private readonly _onUpdate: Function
  ) {
    super(
      name,
      options,
      options.valueType === types.ValueType.DOUBLE
        ? MetricDescriptorType.COUNTER_DOUBLE
        : MetricDescriptorType.COUNTER_INT64
    );
  }
  protected _makeInstrument(labelSet: types.LabelSet): BoundCounter {
    return new BoundCounter(
      labelSet,
      this._disabled,
      this._monotonic,
      this._valueType,
      this._logger,
      this._onUpdate
    );
  }

  /**
   * Adds the given value to the current value. Values cannot be negative.
   * @param value the value to add.
   * @param labelSet the canonicalized LabelSet used to associate with this metric's instrument.
   */
  add(value: number, labelSet: types.LabelSet) {
    this.bind(labelSet).add(value);
  }
}

/** This is a SDK implementation of Gauge Metric. */
export class GaugeMetric extends Metric<BoundGauge>
  implements Pick<types.MetricUtils, 'set'> {
  constructor(
    name: string,
    options: MetricOptions,
    private readonly _onUpdate: Function
  ) {
    super(
      name,
      options,
      options.valueType === types.ValueType.DOUBLE
        ? MetricDescriptorType.GAUGE_DOUBLE
        : MetricDescriptorType.GAUGE_INT64
    );
  }
  protected _makeInstrument(labelSet: types.LabelSet): BoundGauge {
    return new BoundGauge(
      labelSet,
      this._disabled,
      this._monotonic,
      this._valueType,
      this._logger,
      this._onUpdate
    );
  }

  /**
   * Sets the given value. Values can be negative.
   * @param value the new value.
   * @param labelSet the canonicalized LabelSet used to associate with this metric's instrument.
   */
  set(value: number, labelSet: types.LabelSet) {
    this.bind(labelSet).set(value);
  }
}
