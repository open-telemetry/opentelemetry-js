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

import * as api from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import {
  BoundCounter,
  BaseBoundInstrument,
  BoundMeasure,
  BoundObserver,
} from './BoundInstrument';
import { ObserverResult } from './ObserverResult';
import { MetricOptions } from './types';
import { MetricKind, MetricDescriptor, MetricRecord } from './export/types';
import { Batcher } from './export/Batcher';
import { hashLabels } from './Utils';

/** This is a SDK implementation of {@link Metric} interface. */
export abstract class Metric<T extends BaseBoundInstrument>
  implements api.Metric<T> {
  protected readonly _monotonic: boolean;
  protected readonly _disabled: boolean;
  protected readonly _valueType: api.ValueType;
  protected readonly _logger: api.Logger;
  private readonly _descriptor: MetricDescriptor;
  private readonly _instruments: Map<string, T> = new Map();

  constructor(
    private readonly _name: string,
    private readonly _options: MetricOptions,
    private readonly _kind: MetricKind,
    readonly resource: Resource
  ) {
    this._monotonic = _options.monotonic;
    this._disabled = _options.disabled;
    this._valueType = _options.valueType;
    this._logger = _options.logger;
    this._descriptor = this._getMetricDescriptor();
  }

  /**
   * Returns an Instrument associated with specified Labels.
   * It is recommended to keep a reference to the Instrument instead of always
   * calling this method for each operation.
   * @param labels key-values pairs that are associated with a specific metric
   *     that you want to record.
   */
  bind(labels: api.Labels): T {
    const hash = hashLabels(labels);
    if (this._instruments.has(hash)) return this._instruments.get(hash)!;

    const instrument = this._makeInstrument(labels);
    this._instruments.set(hash, instrument);
    return instrument;
  }

  /**
   * Removes the Instrument from the metric, if it is present.
   * @param labels key-values pairs that are associated with a specific metric.
   */
  unbind(labels: api.Labels): void {
    this._instruments.delete(hashLabels(labels));
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
      labels: instrument.getLabels(),
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

  protected abstract _makeInstrument(labels: api.Labels): T;
}

/** This is a SDK implementation of Counter Metric. */
export class CounterMetric extends Metric<BoundCounter>
  implements Pick<api.MetricUtils, 'add'> {
  constructor(
    name: string,
    options: MetricOptions,
    private readonly _batcher: Batcher,
    resource: Resource
  ) {
    super(name, options, MetricKind.COUNTER, resource);
  }
  protected _makeInstrument(labels: api.Labels): BoundCounter {
    return new BoundCounter(
      labels,
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
   * @param labels key-values pairs that are associated with a specific metric
   *     that you want to record.
   */
  add(value: number, labels: api.Labels) {
    this.bind(labels).add(value);
  }
}

export class MeasureMetric extends Metric<BoundMeasure>
  implements Pick<api.MetricUtils, 'record'> {
  protected readonly _absolute: boolean;

  constructor(
    name: string,
    options: MetricOptions,
    private readonly _batcher: Batcher,
    resource: Resource
  ) {
    super(name, options, MetricKind.MEASURE, resource);

    this._absolute = options.absolute !== undefined ? options.absolute : true; // Absolute default is true
  }
  protected _makeInstrument(labels: api.Labels): BoundMeasure {
    return new BoundMeasure(
      labels,
      this._disabled,
      this._monotonic,
      this._absolute,
      this._valueType,
      this._logger,
      this._batcher.aggregatorFor(MetricKind.MEASURE)
    );
  }

  record(value: number, labels: api.Labels) {
    this.bind(labels).record(value);
  }
}

/** This is a SDK implementation of Observer Metric. */
export class ObserverMetric extends Metric<BoundObserver>
  implements Pick<api.MetricUtils, 'setCallback'> {
  private _observerResult = new ObserverResult();

  constructor(
    name: string,
    options: MetricOptions,
    private readonly _batcher: Batcher,
    resource: Resource
  ) {
    super(name, options, MetricKind.OBSERVER, resource);
  }

  protected _makeInstrument(labels: api.Labels): BoundObserver {
    return new BoundObserver(
      labels,
      this._disabled,
      this._monotonic,
      this._valueType,
      this._logger,
      this._batcher.aggregatorFor(MetricKind.OBSERVER)
    );
  }

  getMetricRecord(): MetricRecord[] {
    this._observerResult.callbackObservers.forEach((callback, labels) => {
      const instrument = this.bind(labels);
      instrument.update(callback());
    });
    return super.getMetricRecord();
  }

  /**
   * Sets a callback where user can observe value for certain labels
   * @param callback
   */
  setCallback(callback: (observerResult: api.ObserverResult) => void): void {
    callback(this._observerResult);
    this._observerResult.observers.forEach((observer, labels) => {
      observer.subscribe(value => {
        const instrument = this.bind(labels);
        instrument.update(value);
      });
    });
  }
}
