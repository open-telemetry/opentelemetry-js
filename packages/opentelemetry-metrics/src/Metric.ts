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
import {
  BoundCounter,
  BaseBoundInstrument,
  BoundMeasure,
} from './BoundInstrument';
import { MetricOptions } from './types';
import { MetricKind, MetricDescriptor, MetricRecord } from './export/types';
import { Batcher } from './export/Batcher';

/** This is a SDK implementation of {@link Metric} interface. */
export abstract class Metric<T extends BaseBoundInstrument>
  implements types.Metric<T> {
  protected readonly _monotonic: boolean;
  protected readonly _disabled: boolean;
  protected readonly _valueType: types.ValueType;
  protected readonly _logger: types.Logger;
  private readonly _descriptor: MetricDescriptor;
  private readonly _instruments: Map<string, T> = new Map();

  constructor(
    private readonly _name: string,
    private readonly _options: MetricOptions,
    private readonly _kind: MetricKind
  ) {
    this._monotonic = _options.monotonic;
    this._disabled = _options.disabled;
    this._valueType = _options.valueType;
    this._logger = _options.logger;
    this._descriptor = this._getMetricDescriptor();
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
   * Removes the Instrument from the metric, if it is present.
   * @param labelSet the canonicalized LabelSet used to associate with this
   *     metric instrument.
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

  getMetricRecord(): MetricRecord[] {
    return Array.from(this._instruments.values()).map(instrument => ({
      descriptor: this._descriptor,
      labels: instrument.getLabelSet(),
      aggregator: instrument.getAggregator(),
    }));
  }

  private _getMetricDescriptor(): MetricDescriptor {
    return {
      name: this._name,
      description: this._options.description,
      unit: this._options.unit,
      metricKind: this._kind,
      valueType: this._valueType,
      labelKeys: this._options.labelKeys,
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
    private readonly _batcher: Batcher
  ) {
    super(name, options, MetricKind.COUNTER);
  }
  protected _makeInstrument(labelSet: types.LabelSet): BoundCounter {
    return new BoundCounter(
      labelSet,
      this._disabled,
      this._monotonic,
      this._valueType,
      this._logger,
      // @todo: consider to set to CounterSumAggregator always.
      this._batcher.aggregatorFor(MetricKind.COUNTER)
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

export class MeasureMetric extends Metric<BoundMeasure>
  implements Pick<types.MetricUtils, 'record'> {
  protected readonly _absolute: boolean;

  constructor(
    name: string,
    options: MetricOptions,
    private readonly _batcher: Batcher
  ) {
    super(name, options, MetricKind.MEASURE);

    this._absolute = options.absolute !== undefined ? options.absolute : true; // Absolute default is true
  }
  protected _makeInstrument(labelSet: types.LabelSet): BoundMeasure {
    return new BoundMeasure(
      labelSet,
      this._disabled,
      this._monotonic,
      this._absolute,
      this._valueType,
      this._logger,
      this._batcher.aggregatorFor(MetricKind.MEASURE)
    );
  }

  record(value: number, labelSet: types.LabelSet) {
    this.bind(labelSet).record(value);
  }
}
