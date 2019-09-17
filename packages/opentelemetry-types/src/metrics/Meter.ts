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

import { Metric, MetricOptions } from './Metric';
import { CounterHandle, GaugeHandle, MeasureHandle } from './Handle';

/**
 * An interface to allow the recording metrics.
 *
 * {@link Metric}s are used for recording pre-defined aggregation (Gauge and
 * Counter), or raw values ({@link Measure}) in which the aggregation and labels
 * for the exported metric are deferred.
 */
export interface Meter {
  /**
   * Creates and returns a new {@link Measure}.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createMeasure(name: string, options?: MetricOptions): Metric<MeasureHandle>;

  /**
   * Creates a new counter metric.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(name: string, options?: MetricOptions): Metric<CounterHandle>;

  // TODO: Measurements can have a long or double type. However, it looks like
  // the metric timeseries API (according to spec) accepts values instead of
  // Measurements, meaning that if you accept a `number`, the type gets lost.
  // Both java and csharp have gone down the route of having two gauge interfaces,
  // GaugeDoubleTimeseries and GaugeLongTimeseries, with param for that type. It'd
  // be cool to only have a single interface, but maybe having two is necessary?
  // Maybe include the type as a metrics option? Probs a good gh issue, the same goes for Measure types.

  /**
   * Creates a new gauge metric.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createGauge(name: string, options?: MetricOptions): Metric<GaugeHandle>;
}
