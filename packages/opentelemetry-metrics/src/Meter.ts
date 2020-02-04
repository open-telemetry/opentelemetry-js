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

import * as types from '@opentelemetry/api';
import { ConsoleLogger } from '@opentelemetry/core';
import { BaseBoundInstrument } from './BoundInstrument';
import { Metric, CounterMetric, GaugeMetric } from './Metric';
import {
  MetricOptions,
  DEFAULT_METRIC_OPTIONS,
  DEFAULT_CONFIG,
  MeterConfig,
} from './types';
import { LabelSet } from './LabelSet';
import { ReadableMetric, MetricExporter } from './export/types';
import { notNull } from './Utils';
import { ExportResult } from '@opentelemetry/base';

/**
 * Meter is an implementation of the {@link Meter} interface.
 */
export class Meter implements types.Meter {
  private readonly _logger: types.Logger;
  private readonly _metrics = new Map<string, Metric<BaseBoundInstrument>>();
  private readonly _exporters: MetricExporter[] = [];

  readonly labels = Meter.labels;

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
  ): types.Metric<types.BoundMeasure> {
    if (!this._isValidName(name)) {
      this._logger.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return types.NOOP_MEASURE_METRIC;
    }
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
  ): types.Metric<types.BoundCounter> {
    if (!this._isValidName(name)) {
      this._logger.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return types.NOOP_COUNTER_METRIC;
    }
    const opt: MetricOptions = {
      // Counters are defined as monotonic by default
      monotonic: true,
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const counter = new CounterMetric(name, opt, () => {
      this._exportOneMetric(name);
    });
    this._registerMetric(name, counter);
    return counter;
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
  ): types.Metric<types.BoundGauge> {
    if (!this._isValidName(name)) {
      this._logger.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return types.NOOP_GAUGE_METRIC;
    }
    const opt: MetricOptions = {
      // Gauges are defined as non-monotonic by default
      monotonic: false,
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const gauge = new GaugeMetric(name, opt, () => {
      this._exportOneMetric(name);
    });
    this._registerMetric(name, gauge);
    return gauge;
  }

  /**
   * Gets a collection of Metrics to be exported.
   * @returns The list of metrics.
   */
  getMetrics(): ReadableMetric[] {
    return Array.from(this._metrics.values())
      .map(metric => metric.get())
      .filter(notNull);
  }

  /**
   * Add an exporter to the list of registered exporters
   *
   * @param exporter {@Link MetricExporter} to add to the list of registered exporters
   */
  addExporter(exporter: MetricExporter) {
    this._exporters.push(exporter);
  }

  /**
   * Provide a pre-computed re-useable LabelSet by
   * converting the unordered labels into a canonicalized
   * set of labels with an unique identifier, useful for pre-aggregation.
   * @param labels user provided unordered Labels.
   */
  static labels(labels: types.Labels): types.LabelSet {
    const keys = Object.keys(labels).sort();
    const identifier = keys.reduce((result, key) => {
      if (result.length > 2) {
        result += ',';
      }
      return (result += key + ':' + labels[key]);
    }, '|#');
    const sortedLabels: types.Labels = {};
    keys.forEach(key => {
      sortedLabels[key] = labels[key];
    });
    return new LabelSet(identifier, sortedLabels);
  }

  /**
   * Send a single metric by name to all registered exporters
   */
  private _exportOneMetric(name: string) {
    const metric = this._metrics.get(name);
    if (!metric) return;

    const readableMetric = metric.get();
    if (!readableMetric) return;

    for (const exporter of this._exporters) {
      exporter.export([readableMetric], result => {
        if (result !== ExportResult.SUCCESS) {
          this._logger.error(`Failed to export ${name}`);
        }
      });
    }
  }

  /**
   * Registers metric to register.
   * @param name The name of the metric.
   * @param metric The metric to register.
   */
  private _registerMetric<T extends BaseBoundInstrument>(
    name: string,
    metric: Metric<T>
  ): void {
    if (this._metrics.has(name)) {
      this._logger.error(
        `A metric with the name ${name} has already been registered.`
      );
      return;
    }
    this._metrics.set(name, metric);
  }

  /**
   * Ensure a metric name conforms to the following rules:
   *
   * 1. They are non-empty strings
   *
   * 2. The first character must be non-numeric, non-space, non-punctuation
   *
   * 3. Subsequent characters must be belong to the alphanumeric characters, '_', '.', and '-'.
   *
   * Names are case insensitive
   *
   * @param name Name of metric to be created
   */
  private _isValidName(name: string): boolean {
    return Boolean(name.match(/^[a-z][a-z0-9_.\-]*$/i));
  }
}
