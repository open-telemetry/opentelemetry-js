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
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BoundObserver } from './BoundInstrument';
import { Batcher } from './export/Batcher';
import { MetricKind, MetricRecord } from './export/types';
import { Metric } from './Metric';
import { ObserverResult } from './ObserverResult';

const NOOP_CALLBACK = () => {};

/**
 * This is a SDK implementation of Base Observer Metric.
 * All observers should extend this class
 */
export abstract class BaseObserverMetric extends Metric<BoundObserver>
  implements api.BaseObserver {
  protected _callback: (observerResult: api.ObserverResult) => unknown;

  constructor(
    name: string,
    options: api.MetricOptions,
    private readonly _batcher: Batcher,
    resource: Resource,
    metricKind: MetricKind,
    instrumentationLibrary: InstrumentationLibrary,
    callback?: (observerResult: api.ObserverResult) => unknown
  ) {
    super(name, options, metricKind, resource, instrumentationLibrary);
    this._callback = callback || NOOP_CALLBACK;
  }

  protected _makeInstrument(labels: api.Labels): BoundObserver {
    return new BoundObserver(
      labels,
      this._disabled,
      this._valueType,
      this._logger,
      this._batcher.aggregatorFor(this._descriptor)
    );
  }

  protected createObserverResult(): ObserverResult {
    return new ObserverResult();
  }

  async getMetricRecord(): Promise<MetricRecord[]> {
    const observerResult = this.createObserverResult();
    await this._callback(observerResult);
    observerResult.values.forEach((value, labels) => {
      const instrument = this.bind(labels);
      instrument.update(value);
    });
    return super.getMetricRecord();
  }

  observation(value: number) {
    return {
      value,
      observer: this as BaseObserverMetric,
    };
  }
}
