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

import * as api from '@opentelemetry/api';
import { ConsoleLogger } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BaseBoundInstrument } from './BoundInstrument';
import { UpDownCounterMetric } from './UpDownCounterMetric';
import {
  Metric,
  CounterMetric,
  ValueRecorderMetric,
  ObserverMetric,
} from './Metric';
import {
  MetricOptions,
  DEFAULT_METRIC_OPTIONS,
  DEFAULT_CONFIG,
  MeterConfig,
} from './types';
import { Batcher, UngroupedBatcher } from './export/Batcher';
import { PushController } from './export/Controller';
import { NoopExporter } from './export/NoopExporter';

/**
 * Meter is an implementation of the {@link Meter} interface.
 */
export class Meter implements api.Meter {
  private readonly _logger: api.Logger;
  private readonly _metrics = new Map<string, Metric<BaseBoundInstrument>>();
  private readonly _batcher: Batcher;
  private readonly _resource: Resource;

  /**
   * Constructs a new Meter instance.
   */
  constructor(config: MeterConfig = DEFAULT_CONFIG) {
    this._logger = config.logger || new ConsoleLogger(config.logLevel);
    this._batcher = config.batcher ?? new UngroupedBatcher();
    this._resource = config.resource || Resource.createTelemetrySDKResource();
    // start the push controller
    const exporter = config.exporter || new NoopExporter();
    const interval = config.interval;
    new PushController(this, exporter, interval);
  }

  /**
   * Creates and returns a new {@link ValueRecorder}.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createValueRecorder(
    name: string,
    options?: api.MetricOptions
  ): api.ValueRecorder {
    if (!this._isValidName(name)) {
      this._logger.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_VALUE_RECORDER_METRIC;
    }
    const opt: MetricOptions = {
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      absolute: true, // value recorders are defined as absolute by default
      ...options,
    };

    const valueRecorder = new ValueRecorderMetric(
      name,
      opt,
      this._batcher,
      this._resource
    );
    this._registerMetric(name, valueRecorder);
    return valueRecorder;
  }

  /**
   * Creates a new counter metric. Generally, this kind of metric when the
   * value is a quantity, the sum is of primary interest, and the event count
   * and value distribution are not of primary interest.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(name: string, options?: api.MetricOptions): api.Counter {
    if (!this._isValidName(name)) {
      this._logger.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_COUNTER_METRIC;
    }
    const opt: MetricOptions = {
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const counter = new CounterMetric(name, opt, this._batcher, this._resource);
    this._registerMetric(name, counter);
    return counter;
  }

  /**
   * Creates a new `UpDownCounter` metric. UpDownCounter is a synchronous
   * instrument and very similar to Counter except that Add(increment)
   * supports negative increments. It is generally useful for capturing changes
   * in an amount of resources used, or any quantity that rises and falls
   * during a request.
   *
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createUpDownCounter(
    name: string,
    options?: api.MetricOptions
  ): api.UpDownCounter {
    if (!this._isValidName(name)) {
      this._logger.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_COUNTER_METRIC;
    }
    const opt: MetricOptions = {
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const upDownCounter = new UpDownCounterMetric(
      name,
      opt,
      this._batcher,
      this._resource
    );
    this._registerMetric(name, upDownCounter);
    return upDownCounter;
  }

  /**
   * Creates a new observer metric.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createObserver(name: string, options?: api.MetricOptions): api.Observer {
    if (!this._isValidName(name)) {
      this._logger.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_OBSERVER_METRIC;
    }
    const opt: MetricOptions = {
      logger: this._logger,
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const observer = new ObserverMetric(
      name,
      opt,
      this._batcher,
      this._resource
    );
    this._registerMetric(name, observer);
    return observer;
  }

  /**
   * Collects all the metrics created with this `Meter` for export.
   *
   * Utilizes the batcher to create checkpoints of the current values in
   * each aggregator belonging to the metrics that were created with this
   * meter instance.
   */
  collect() {
    Array.from(this._metrics.values()).forEach(metric => {
      metric.getMetricRecord().forEach(record => {
        this._batcher.process(record);
      });
    });
  }

  getBatcher(): Batcher {
    return this._batcher;
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
   * 3. Subsequent characters must be belong to the alphanumeric characters,
   *    '_', '.', and '-'.
   *
   * Names are case insensitive
   *
   * @param name Name of metric to be created
   */
  private _isValidName(name: string): boolean {
    return Boolean(name.match(/^[a-z][a-z0-9_.-]*$/i));
  }
}
