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

import { Metric, MetricOptions, Labels, LabelSet } from './Metric';
import { BoundCounter, BoundGauge, BoundMeasure } from './BoundInstrument';

/**
 * An interface to allow the recording metrics.
 *
 * {@link Metric}s are used for recording pre-defined aggregation (`Gauge` and
 * `Counter`), or raw values (`Measure`) in which the aggregation and labels
 * for the exported metric are deferred.
 */
export interface Meter {
  /**
   * Creates and returns a new `Measure`.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createMeasure(name: string, options?: MetricOptions): Metric<BoundMeasure>;

  /**
   * Creates a new `counter` metric. Generally, this kind of metric when the
   * value is a quantity, the sum is of primary interest, and the event count
   * and value distribution are not of primary interest.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(name: string, options?: MetricOptions): Metric<BoundCounter>;

  /**
   * Creates a new `gauge` metric. Generally, this kind of metric should be used
   * when the metric cannot be expressed as a sum or because the measurement
   * interval is arbitrary. Use this kind of metric when the measurement is not
   * a quantity, and the sum and event count are not of interest.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createGauge(name: string, options?: MetricOptions): Metric<BoundGauge>;

  /**
   * Provide a pre-computed re-useable LabelSet by
   * converting the unordered labels into a canonicalized
   * set of labels with an unique identifier, useful for pre-aggregation.
   * @param labels user provided unordered Labels.
   */
  labels(labels: Labels): LabelSet;
}
