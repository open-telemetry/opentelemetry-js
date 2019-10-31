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

import * as types from '@opentelemetry/types';
import { ConsoleLogger } from '@opentelemetry/core';
import { CounterHandle, GaugeHandle, MeasureHandle } from './Handle';
import { Metric, CounterMetric, GaugeMetric } from './Metric';
import {
  MetricOptions,
  DEFAULT_METRIC_OPTIONS,
  DEFAULT_CONFIG,
  MeterConfig,
} from './types';

/**
 * Meter is an implementation of the {@link Meter} interface.
 */
export class Meter implements types.Meter {
  private readonly _logger: types.Logger;

  /**
   * Constructs a new Meter instance.
   */
  constructor(config: MeterConfig = DEFAULT_CONFIG) {
    this._logger = config.logger || new ConsoleLogger(config.logLevel);
  }

  /**
   * Creates and returns a new {@link Measure}.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createMeasure(
    name: string,
    options?: types.MetricOptions
  ): Metric<MeasureHandle> {
    // @todo: implement this method
    throw new Error('not implemented yet');
  }

  /**
   * Creates a new counter metric. Generally, this kind of metric when the
   * value is a quantity, the sum is of primary interest, and the event count
   * and value distribution are not of primary interest.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(
    name: string,
    options?: types.MetricOptions
  ): Metric<CounterHandle> {
    const opt: MetricOptions = {
      // Counters are defined as monotonic by default
      monotonic: true,
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    return new CounterMetric(name, opt);
  }

  /**
   * Creates a new gauge metric. Generally, this kind of metric should be used
   * when the metric cannot be expressed as a sum or because the measurement
   * interval is arbitrary. Use this kind of metric when the measurement is not
   * a quantity, and the sum and event count are not of interest.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createGauge(
    name: string,
    options?: types.MetricOptions
  ): Metric<GaugeHandle> {
    const opt: MetricOptions = {
      // Gauges are defined as non-monotonic by default
      monotonic: false,
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    return new GaugeMetric(name, opt);
  }
}
