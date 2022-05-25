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

import { Meter } from './types/Meter';
import {
  BatchObservableCallback,
  Counter,
  Histogram,
  MetricOptions,
  ObservableCallback,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter,
  MetricAttributes,
  Observable,
} from './types/Metric';

/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
export class NoopMeter implements Meter {
  constructor() {}

  /**
   * @see {@link Meter.createHistogram}
   */
  createHistogram(_name: string, _options?: MetricOptions): Histogram {
    return NOOP_HISTOGRAM_METRIC;
  }

  /**
   * @see {@link Meter.createCounter}
   */
  createCounter(_name: string, _options?: MetricOptions): Counter {
    return NOOP_COUNTER_METRIC;
  }

  /**
   * @see {@link Meter.createUpDownCounter}
   */
  createUpDownCounter(_name: string, _options?: MetricOptions): UpDownCounter {
    return NOOP_UP_DOWN_COUNTER_METRIC;
  }

  /**
   * @see {@link Meter.createObservableGauge}
   */
  createObservableGauge(
    _name: string,
    _options?: MetricOptions,
  ): ObservableGauge {
    return NOOP_OBSERVABLE_GAUGE_METRIC;
  }

  /**
   * @see {@link Meter.createObservableCounter}
   */
  createObservableCounter(
    _name: string,
    _options?: MetricOptions,
  ): ObservableCounter {
    return NOOP_OBSERVABLE_COUNTER_METRIC;
  }

  /**
   * @see {@link Meter.createObservableUpDownCounter}
   */
  createObservableUpDownCounter(
    _name: string,
    _options?: MetricOptions,
  ): ObservableUpDownCounter {
    return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
  }

  /**
   * @see {@link Meter.addBatchObservableCallback}
   */
  addBatchObservableCallback(_callback: BatchObservableCallback, _observables: Observable[]): void {}

  /**
   * @see {@link Meter.removeBatchObservableCallback}
   */
  removeBatchObservableCallback(_callback: BatchObservableCallback): void {}
}

export class NoopMetric {}

export class NoopCounterMetric extends NoopMetric implements Counter {
  add(_value: number, _attributes: MetricAttributes): void {}
}

export class NoopUpDownCounterMetric extends NoopMetric implements UpDownCounter {
  add(_value: number, _attributes: MetricAttributes): void {}
}

export class NoopHistogramMetric extends NoopMetric implements Histogram {
  record(_value: number, _attributes: MetricAttributes): void {}
}

export class NoopObservableMetric {
  addCallback(_callback: ObservableCallback) {}
  removeCallback(_callback: ObservableCallback) {}
}

export class NoopObservableCounterMetric extends NoopObservableMetric implements ObservableCounter {}
export class NoopObservableGaugeMetric extends NoopObservableMetric implements ObservableGauge {}
export class NoopObservableUpDownCounterMetric extends NoopObservableMetric implements ObservableUpDownCounter {}

export const NOOP_METER = new NoopMeter();

// Synchronous instruments
export const NOOP_COUNTER_METRIC = new NoopCounterMetric();
export const NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
export const NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();

// Asynchronous instruments
export const NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
export const NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
export const NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
