/**
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

import { SpanContext } from '../trace/span_context';
import { DistributedContext } from '../distributed_context/DistributedContext';
import { Measure, MeasureOptions, Measurement } from './measure';
import { Metric, MetricOptions } from './metric';
import { CounterTimeseries } from './counter';
import { GaugeTimeseries } from './gauge';

export interface RecordOptions {
  // spanContext represents a measurement exemplar in the form of a SpanContext.
  spanContext?: SpanContext;
  // distributedContext overrides the current context and adds dimensions
  // to the measurements.
  distributedContext?: DistributedContext;
}

export interface Meter {
  // Creates and returns a new @link{Measure}.
  createMeasure(name: string, options?: MeasureOptions): Measure;

  // Creates a new counter metric.
  createCounter(
    name: string,
    options?: MetricOptions
  ): Metric<CounterTimeseries>;

  // TODO: Measurements can have a long or double type. However, it looks like
  // the metric timeseries API (according to spec) accepts values instead of
  // Measurements, meaning that if you accept a `number`, the type gets lost.
  // Both java and csharp have gone down the route of having two gauge interfaces,
  // GaugeDoubleTimeseries and GaugeLongTimeseries, with param for that type. It'd
  // be cool to only have a single interface, but maybe having two is necessary?
  // Maybe include the type as a metrics option? Probs a good gh issue, the same goes for Measure types.

  // Creates a new gauge metric.
  createGauge(name: string, options?: MetricOptions): Metric<GaugeTimeseries>;

  // Record a set of raw measurements.
  record(measurements: Measurement[], options?: RecordOptions): void;
}
