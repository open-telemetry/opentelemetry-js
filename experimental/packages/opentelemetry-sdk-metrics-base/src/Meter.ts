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

import { diag } from '@opentelemetry/api';
import * as api from '@opentelemetry/api-metrics';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BaseBoundInstrument } from './BoundInstrument';
import { CounterMetric } from './CounterMetric';
import { PushController } from './export/Controller';
import { NoopExporter } from './export/NoopExporter';
import { Processor, UngroupedProcessor } from './export/Processor';
import { Metric } from './Metric';
import { ObservableCounterMetric } from './ObservableCounterMetric';
import { DEFAULT_CONFIG, DEFAULT_METRIC_OPTIONS, MeterConfig } from './types';
import { UpDownCounterMetric } from './UpDownCounterMetric';
import { ObservableUpDownCounterMetric } from './ObservableUpDownCounterMetric';
import { ObservableGaugeMetric } from './ObservableGaugeMetric';
import { HistogramMetric } from './HistogramMetric';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const merge = require('lodash.merge');
// @TODO - replace once the core is released
// import { merge } from '@opentelemetry/core';

/**
 * Meter is an implementation of the {@link Meter} interface.
 */
export class Meter implements api.Meter {
  private readonly _metrics = new Map<string, Metric<BaseBoundInstrument>>();
  private readonly _processor: Processor;
  private readonly _resource: Resource;
  private readonly _instrumentationLibrary: InstrumentationLibrary;
  private readonly _controller: PushController;
  private _isShutdown = false;
  private _shuttingDownPromise: Promise<void> = Promise.resolve();

  /**
   * Constructs a new Meter instance.
   */
  constructor(
    instrumentationLibrary: InstrumentationLibrary,
    config: MeterConfig = {}
  ) {
    const mergedConfig = merge({}, DEFAULT_CONFIG, config);
    this._processor = mergedConfig.processor ?? new UngroupedProcessor();
    this._resource =
      mergedConfig.resource || Resource.empty();
    this._instrumentationLibrary = instrumentationLibrary;
    // start the push controller
    const exporter = mergedConfig.exporter || new NoopExporter();
    const interval = mergedConfig.interval;
    this._controller = new PushController(this, exporter, interval);
  }

  /**
   * Creates and returns a new {@link Histogram}.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createHistogram(
    name: string,
    options?: api.MetricOptions
  ): api.Histogram {
    if (!this._isValidName(name)) {
      diag.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_HISTOGRAM_METRIC;
    }
    const opt: api.MetricOptions = {
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };

    const histogram = new HistogramMetric(
      name,
      opt,
      this._processor,
      this._resource,
      this._instrumentationLibrary
    );
    this._registerMetric(name, histogram);
    return histogram;
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
      diag.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_COUNTER_METRIC;
    }
    const opt: api.MetricOptions = {
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const counter = new CounterMetric(
      name,
      opt,
      this._processor,
      this._resource,
      this._instrumentationLibrary
    );
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
      diag.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_COUNTER_METRIC;
    }
    const opt: api.MetricOptions = {
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const upDownCounter = new UpDownCounterMetric(
      name,
      opt,
      this._processor,
      this._resource,
      this._instrumentationLibrary
    );
    this._registerMetric(name, upDownCounter);
    return upDownCounter;
  }

  /**
   * Creates a new `ObservableGauge` metric.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the observable gauge callback
   */
  createObservableGauge(
    name: string,
    options: api.MetricOptions = {},
    callback?: (observableResult: api.ObservableResult) => unknown
  ): api.ObservableGauge {
    if (!this._isValidName(name)) {
      diag.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_OBSERVABLE_GAUGE_METRIC;
    }
    const opt: api.MetricOptions = {
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const observableGauge = new ObservableGaugeMetric(
      name,
      opt,
      this._processor,
      this._resource,
      this._instrumentationLibrary,
      callback
    );
    this._registerMetric(name, observableGauge);
    return observableGauge;
  }

  createObservableCounter(
    name: string,
    options: api.MetricOptions = {},
    callback?: (observableResult: api.ObservableResult) => unknown
  ): api.ObservableCounter {
    if (!this._isValidName(name)) {
      diag.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_OBSERVABLE_COUNTER_METRIC;
    }
    const opt: api.MetricOptions = {
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const observableCounter = new ObservableCounterMetric(
      name,
      opt,
      this._processor,
      this._resource,
      this._instrumentationLibrary,
      callback
    );
    this._registerMetric(name, observableCounter);
    return observableCounter;
  }

  /**
   * Creates a new `ObservableUpDownCounter` metric.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the observable gauge callback
   */
  createObservableUpDownCounter(
    name: string,
    options: api.MetricOptions = {},
    callback?: (observableResult: api.ObservableResult) => unknown
  ): api.ObservableUpDownCounter {
    if (!this._isValidName(name)) {
      diag.warn(
        `Invalid metric name ${name}. Defaulting to noop metric implementation.`
      );
      return api.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
    }
    const opt: api.MetricOptions = {
      ...DEFAULT_METRIC_OPTIONS,
      ...options,
    };
    const observableUpDownCounter = new ObservableUpDownCounterMetric(
      name,
      opt,
      this._processor,
      this._resource,
      this._instrumentationLibrary,
      callback
    );
    this._registerMetric(name, observableUpDownCounter);
    return observableUpDownCounter;
  }

  /**
   * Collects all the metrics created with this `Meter` for export.
   *
   * Utilizes the processor to create checkpoints of the current values in
   * each aggregator belonging to the metrics that were created with this
   * meter instance.
   */
  async collect(): Promise<void> {
    // after this all remaining metrics can be run
    const metricsRecords = Array.from(this._metrics.values()).map(metric => {
      return metric.getMetricRecord();
    });

    await Promise.all(metricsRecords).then(records => {
      records.forEach(metrics => {
        metrics.forEach(metric => this._processor.process(metric));
      });
    });
  }

  getProcessor(): Processor {
    return this._processor;
  }

  shutdown(): Promise<void> {
    if (this._isShutdown) {
      return this._shuttingDownPromise;
    }
    this._isShutdown = true;

    this._shuttingDownPromise = new Promise((resolve, reject) => {
      Promise.resolve()
        .then(() => {
          return this._controller.shutdown();
        })
        .then(resolve)
        .catch(e => {
          reject(e);
        });
    });
    return this._shuttingDownPromise;
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
      diag.error(`A metric with the name ${name} has already been registered.`);
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
    return Boolean(name.match(/^[a-z][a-z0-9_.-]{0,62}$/i));
  }
}
