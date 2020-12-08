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
import * as api from '@opentelemetry/api';
import { NoopLogger } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BaseBoundInstrument } from './BoundInstrument';
import {
  Aggregator,
  MetricDescriptor,
  MetricKind,
  MetricRecord,
} from './export/types';
import { hashLabels } from './Utils';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Processor } from './export/Processor';
import { Accumulator } from './Accumulator';

/** This is a SDK implementation of {@link Metric} interface. */
export abstract class Metric<T extends BaseBoundInstrument>
  implements api.UnboundMetric<T>, Accumulator {
  protected readonly _disabled: boolean;
  protected readonly _valueType: api.ValueType;
  protected readonly _logger: api.Logger;
  protected readonly _descriptor: MetricDescriptor;
  protected readonly _boundaries: number[] | undefined;
  private _aggregators: Map<string, Aggregator> = new Map();
  private _labelHashed: Map<string, api.Labels> = new Map();

  constructor(
    private readonly _name: string,
    private readonly _options: api.MetricOptions,
    private readonly _kind: MetricKind,
    private readonly _processor: Processor,
    readonly resource: Resource,
    readonly instrumentationLibrary: InstrumentationLibrary
  ) {
    this._disabled = !!_options.disabled;
    this._valueType =
      typeof _options.valueType === 'number'
        ? _options.valueType
        : api.ValueType.DOUBLE;
    this._logger = _options.logger ?? new NoopLogger();
    this._boundaries = _options.boundaries;
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
    const accumulationKey = hashLabels(labels);
    const instrument = this._makeInstrument(accumulationKey, labels, this);
    return instrument;
  }

  /**
   * Removes the Instrument from the metric, if it is present.
   * @param labels key-values pairs that are associated with a specific metric.
   */
  unbind(labels: api.Labels): void {
    this._aggregators.delete(hashLabels(labels));
    this._labelHashed.delete(hashLabels(labels));
  }

  update(accumulationKey: string, labels: api.Labels, value: number) {
    const aggregator = this._getAggregator(accumulationKey, labels);
    aggregator.update(value);
  }

  /**
   * Clears all Instruments from the Metric.
   */
  clear(): void {
    this._aggregators.clear();
    this._labelHashed.clear();
  }

  /**
   * Returns kind of metric
   */
  getKind(): MetricKind {
    return this._kind;
  }

  getMetricRecord(): Promise<MetricRecord[]> {
    const records = Array.from(this._aggregators.entries()).map(
      ([key, aggregator]) => ({
        descriptor: this._descriptor,
        labels: this._labelHashed.get(key)!,
        aggregator: aggregator,
        resource: this.resource,
        instrumentationLibrary: this.instrumentationLibrary,
      })
    );

    this._aggregators.clear();
    this._labelHashed.clear();
    return Promise.resolve(records);
  }

  getAggregator(labels: api.Labels): Aggregator {
    const accumulationKey = hashLabels(labels);
    return this._getAggregator(accumulationKey, labels);
  }

  private _getAggregator(
    accumulationKey: string,
    labels: api.Labels
  ): Aggregator {
    let aggregator = this._aggregators.get(accumulationKey);
    if (aggregator === undefined) {
      aggregator = this._processor.aggregatorFor(this._descriptor);
      this._aggregators.set(accumulationKey, aggregator);
      this._labelHashed.set(accumulationKey, labels);
    }
    return aggregator;
  }

  private _getMetricDescriptor(): MetricDescriptor {
    return {
      name: this._name,
      description: this._options.description || '',
      unit: this._options.unit || '1',
      metricKind: this._kind,
      valueType: this._valueType,
      ...(this._boundaries && { boundaries: this._boundaries }),
    };
  }

  protected abstract _makeInstrument(
    accumulationKey: string,
    labels: api.Labels,
    accumulator: Accumulator
  ): T;
}
