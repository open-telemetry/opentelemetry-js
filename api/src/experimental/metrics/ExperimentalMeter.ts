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
import { Meter } from '../../metrics/Meter';
import { MetricAttributes, MetricOptions } from '../../metrics/Metric';
import { Context } from '../../context/types';
import { NOOP_GAUGE_METRIC } from './Gauge';

/**
 * @experimental
 *
 * Records only the last value that is added to it, discards any others.
 */
export interface Gauge<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> {
  /**
   * @experimental
   * Records a measurement.
   */
  record(value: number, attributes?: AttributesTypes, context?: Context): void;
}

/**
 * Steps for adding new experimental Meter API features:
 * - implement the specification in the `@opentelemetry/sdk-metrics` package, do NOT use any new types
 *   - SDKs may peer-depend on old API versions where these types are not yet available
 *   - we MUST duplicate any new types across API and SDK unless we drop support for older API versions
 *     - dropping support for old API versions MUST be done in SDK Major versions
 *     - failure to do this will result in failing builds for users that update the SDK but not the API
 * - add the new functionality to the {@link IExperimentalMeter} interface
 * - implement the functionality in the {@link ExperimentalMeter}
 *   - if the underlying {@link Meter} used as an {@link IExperimentalMeter} throws an error, return a No-Op implementation.
 *
 * Users may now use {@link wrapMeter} to get access to experimental SDK functionality via the API
 *
 * To stabilize a feature:
 * - move the function interface from `IExperimentalMeter` to `Meter`
 * - replace the implemented method with a property of the same type as the one from `Meter`, move any auxiliary types to stable
 * - In ExperimentalMeter
 *   - remove the implementation that falls back to No-Op on errors.
 *   - assign the function that was moved to `Meter` to the property defined in the last step
 * - Implement the no-op case in {@link NoopMeter}
 * - ensure any `@experimental` annotations are removed
 */

/**
 * @experimental
 *
 * Meter that offers experimental functionality IF that functionality is implemented by the SDK.
 * MAY return a no-op otherwise. Stable features continue to work as expected.
 */
export interface IExperimentalMeter extends Meter {
  /**
   * @experimental Will be added to {@link Meter} in a future version when the specification is marked stable
   *
   * Creates and returns a new `Gauge`.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createGauge<AttributesTypes extends MetricAttributes = MetricAttributes>(
    name: string,
    options?: MetricOptions
  ): Gauge<AttributesTypes>;
}

class ExperimentalMeter implements IExperimentalMeter {
  private _meter: Meter;
  constructor(meter: Meter) {
    this._meter = meter;
    this.addBatchObservableCallback =
      meter.addBatchObservableCallback.bind(meter);
    this.createCounter = meter.createCounter.bind(meter);
    this.createObservableGauge = meter.createObservableGauge.bind(meter);
    this.createHistogram = meter.createHistogram.bind(meter);
    this.createObservableCounter = meter.createObservableCounter.bind(meter);
    this.createObservableUpDownCounter =
      meter.createObservableUpDownCounter.bind(meter);
    this.createUpDownCounter = meter.createUpDownCounter.bind(meter);
    this.removeBatchObservableCallback =
      meter.removeBatchObservableCallback.bind(meter);
  }
  addBatchObservableCallback: Meter['addBatchObservableCallback'];
  createCounter: Meter['createCounter'];
  createObservableGauge: Meter['createObservableGauge'];
  createHistogram: Meter['createHistogram'];
  createObservableCounter: Meter['createObservableCounter'];
  createUpDownCounter: Meter['createUpDownCounter'];
  createObservableUpDownCounter: Meter['createObservableUpDownCounter'];
  removeBatchObservableCallback: Meter['removeBatchObservableCallback'];

  /**
   * Creates and returns a new `Gauge`.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createGauge(name: string, options?: MetricOptions): Gauge {
    try {
      return (this._meter as ExperimentalMeter).createGauge(name, options);
    } catch (e) {
      return NOOP_GAUGE_METRIC;
    }
  }
}

/**
 * @experimental
 *
 * Wraps {@link Meter} so that it offers experimental functionality IF that functionality is implemented by the
 * registered SDK. MAY return a no-op instrument if the functionality is not implemented by the SDK.
 * Stable features continue to work as expected.
 *
 * @param meter
 */
export function wrapMeter(meter: Meter): IExperimentalMeter {
  return new ExperimentalMeter(meter);
}
