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
import * as api from '@opentelemetry/api-metrics';
import { Observation } from '@opentelemetry/api-metrics';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BoundObservable } from './BoundInstrument';
import { Processor } from './export/Processor';
import { MetricKind, MetricRecord } from './export/types';
import { Metric } from './Metric';
import { ObservableResult } from './ObservableResult';

const NOOP_CALLBACK = () => {};

/**
 * This is a SDK implementation of Base Observer Metric.
 * All observables should extend this class
 */
export abstract class ObservableBaseMetric
  extends Metric<BoundObservable>
  implements api.ObservableBase {
  protected _callback: (observableResult: api.ObservableResult) => unknown;

  constructor(
    name: string,
    options: api.MetricOptions,
    private readonly _processor: Processor,
    resource: Resource,
    metricKind: MetricKind,
    instrumentationLibrary: InstrumentationLibrary,
    callback?: (observableResult: api.ObservableResult) => unknown
  ) {
    super(name, options, metricKind, resource, instrumentationLibrary);
    this._callback = callback || NOOP_CALLBACK;
  }

  protected _makeInstrument(attributes: api.Attributes): BoundObservable {
    return new BoundObservable(
      attributes,
      this._disabled,
      this._valueType,
      this._processor.aggregatorFor(this._descriptor)
    );
  }

  override async getMetricRecord(): Promise<MetricRecord[]> {
    const observableResult = new ObservableResult();
    await this._callback(observableResult);

    this._processResults(observableResult);

    return super.getMetricRecord();
  }

  protected _processResults(observableResult: ObservableResult): void {
    observableResult.values.forEach((value, attributes) => {
      const instrument = this.bind(attributes);
      instrument.update(value);
    });
  }

  observation(value: number): Observation {
    return {
      value,
      observable: this as ObservableBaseMetric,
    };
  }
}
