/*
 * Copyright 2020, OpenTelemetry Authors
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
import { BoundObserver } from './BoundInstrument';
import { Batcher } from './export/Batcher';
import { MetricKind, MetricRecord } from './export/types';
import { Metric } from './Metric';
import { Observation } from './Observation';
import { ObserverResult } from './ObserverResult';

const NOOP_CALLBACK = () => {};

/** This is a SDK implementation of Value Observer Metric. */
export class ValueObserverMetric extends Metric<BoundObserver>
  implements api.ValueObserver {
  private _callback: (observerResult: api.ObserverResult) => void;

  constructor(
    name: string,
    options: api.MetricOptions,
    private readonly _batcher: Batcher,
    resource: Resource,
    callback?: (observerResult: api.ObserverResult) => void
  ) {
    super(name, options, MetricKind.OBSERVER, resource);
    this._callback = callback || NOOP_CALLBACK;
  }

  protected _makeInstrument(labels: api.Labels): BoundObserver {
    return new BoundObserver(
      labels,
      this._disabled,
      this._monotonic,
      this._valueType,
      this._logger,
      this._batcher.aggregatorFor(this._descriptor)
    );
  }

  getMetricRecord(): Promise<MetricRecord[]> {
    const observerResult = new ObserverResult();
    this._callback(observerResult);
    observerResult.values.forEach((value, labels) => {
      const instrument = this.bind(labels);
      instrument.update(value);
    });
    return super.getMetricRecord();
  }

  observation(value: number) {
    return new Observation(this, value);
  }
}
