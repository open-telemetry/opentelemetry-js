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

import {
  CounterHandle,
  DistributedContext,
  GaugeHandle,
  Meter,
  Metric,
  MetricOptions,
  MeasureHandle,
  SpanContext,
} from '@opentelemetry/types';

/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses constant
 * NoopMetrics for all of its methods.
 */
export class NoopMeter implements Meter {
  constructor() {}

  /**
   * Returns constant noop measure.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createMeasure(name: string, options?: MetricOptions): Metric<MeasureHandle> {
    return NOOP_MEASURE_METRIC;
  }

  /**
   * Returns a constant noop counter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(name: string, options?: MetricOptions): Metric<CounterHandle> {
    return NOOP_COUNTER_METRIC;
  }

  /**
   * Returns a constant gauge metric.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createGauge(name: string, options?: MetricOptions): Metric<GaugeHandle> {
    return NOOP_GAUGE_METRIC;
  }
}

export class NoopMetric<T> implements Metric<T> {
  private readonly _handle: T;

  constructor(handle: T) {
    this._handle = handle;
  }
  /**
   * Returns a Handle associated with specified label values.
   * It is recommended to keep a reference to the Handle instead of always
   * calling this method for every operations.
   * @param labelValues the list of label values.
   */
  getHandle(labelValues: string[]): T {
    return this._handle;
  }

  /**
   * Returns a Handle for a metric with all labels not set.
   */
  getDefaultHandle(): T {
    return this._handle;
  }

  /**
   * Removes the Handle from the metric, if it is present.
   * @param labelValues the list of label values.
   */
  removeHandle(labelValues: string[]): void {
    return;
  }

  /**
   * Clears all timeseries from the Metric.
   */
  clear(): void {
    return;
  }

  setCallback(fn: () => void): void {
    return;
  }
}

export class NoopCounterHandle implements CounterHandle {
  add(value: number): void {
    return;
  }
}

export class NoopGaugeHandle implements GaugeHandle {
  set(value: number): void {
    return;
  }
}

export class NoopMeasureHandle implements MeasureHandle {
  record(
    value: number,
    distContext?: DistributedContext,
    spanContext?: SpanContext
  ): void {
    return;
  }
}

export const NOOP_GAUGE_HANDLE = new NoopGaugeHandle();
export const NOOP_GAUGE_METRIC = new NoopMetric<GaugeHandle>(NOOP_GAUGE_HANDLE);

export const NOOP_COUNTER_HANDLE = new NoopCounterHandle();
export const NOOP_COUNTER_METRIC = new NoopMetric<CounterHandle>(
  NOOP_COUNTER_HANDLE
);

export const NOOP_MEASURE_HANDLE = new NoopMeasureHandle();
export const NOOP_MEASURE_METRIC = new NoopMetric<MeasureHandle>(
  NOOP_MEASURE_HANDLE
);
