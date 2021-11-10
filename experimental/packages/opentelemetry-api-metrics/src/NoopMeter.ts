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
  MetricOptions,
  Attributes,
  Counter,
  Histogram,
  ObservableGauge,
  UpDownCounter,
  ObservableBase,
  ObservableCounter,
  ObservableUpDownCounter,
} from './types/Metric';
import { ObservableResult } from './types/ObservableResult';
import { Observation } from './types/Observation';

/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
export class NoopMeter implements Meter {
  constructor() {}

  /**
   * Returns a constant noop histogram.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createHistogram(_name: string, _options?: MetricOptions): Histogram {
    return NOOP_HISTOGRAM_METRIC;
  }

  /**
   * Returns a constant noop counter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(_name: string, _options?: MetricOptions): Counter {
    return NOOP_COUNTER_METRIC;
  }

  /**
   * Returns a constant noop UpDownCounter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createUpDownCounter(_name: string, _options?: MetricOptions): UpDownCounter {
    return NOOP_UP_DOWN_COUNTER_METRIC;
  }

  /**
   * Returns a constant noop observable gauge.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the observable gauge callback
   */
  createObservableGauge(
    _name: string,
    _options?: MetricOptions,
    _callback?: (observableResult: ObservableResult) => void
  ): ObservableGauge {
    return NOOP_OBSERVABLE_GAUGE_METRIC;
  }

  /**
   * Returns a constant noop observable counter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the observable counter callback
   */
  createObservableCounter(
    _name: string,
    _options?: MetricOptions,
    _callback?: (observableResult: ObservableResult) => void
  ): ObservableCounter {
    return NOOP_OBSERVABLE_COUNTER_METRIC;
  }

  /**
   * Returns a constant noop up down observable counter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the up down observable counter callback
   */
  createObservableUpDownCounter(
    _name: string,
    _options?: MetricOptions,
    _callback?: (observableResult: ObservableResult) => void
  ): ObservableUpDownCounter {
    return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
  }
}

export class NoopMetric {}

export class NoopCounterMetric extends NoopMetric implements Counter {
  add(_value: number, _attributes: Attributes): void {}
}

export class NoopUpDownCounterMetric extends NoopMetric implements UpDownCounter {
  add(_value: number, _attributes: Attributes): void {}
}

export class NoopHistogramMetric extends NoopMetric implements Histogram {
  record(_value: number, _attributes: Attributes): void {}
}

export class NoopObservableBaseMetric extends NoopMetric implements ObservableBase {
  observation(): Observation {
    return {
      observable: this as ObservableBase,
      value: 0,
    };
  }
}

export const NOOP_METER = new NoopMeter();

// Synchronous instruments
export const NOOP_COUNTER_METRIC = new NoopCounterMetric();
export const NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
export const NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();

// Asynchronous instruments
export const NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableBaseMetric();
export const NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableBaseMetric();
export const NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableBaseMetric();
