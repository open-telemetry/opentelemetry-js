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

import { BatchObserverResult } from './types/BatchObserverResult';
import { Meter } from './types/Meter';
import {
  MetricOptions,
  UnboundMetric,
  Labels,
  Counter,
  Histogram,
  GaugeObserver,
  UpDownCounter,
  BaseObserver,
  CounterObserver,
  UpDownCounterObserver,
} from './types/Metric';
import {
  BoundHistogram,
  BoundCounter,
  BoundBaseObserver,
} from './types/BoundInstrument';
import { ObserverResult } from './types/ObserverResult';
import { Observation } from './types/Observation';

/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
export class NoopMeter implements Meter {
  constructor() {}

  /**
   * Returns a constant noop counter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
   createCounter(_name: string, _options?: MetricOptions): Counter {
    return NOOP_COUNTER_METRIC;
  }

  /**
   * Returns constant noop counter observer.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the counter observer callback
   */
  createCounterObserver(
    _name: string,
    _options?: MetricOptions,
    _callback?: (observerResult: ObserverResult) => void
  ): CounterObserver {
    return NOOP_COUNTER_OBSERVER_METRIC;
  }

  /**
   * Returns constant noop histogram.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createHistogram(_name: string, _options?: MetricOptions): Histogram {
    return NOOP_HISTOGRAM_METRIC;
  }

  /**
   * Returns constant noop gauge observer.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the gauge observer callback
   */
  createGaugeObserver(
    _name: string,
    _options?: MetricOptions,
    _callback?: (observerResult: ObserverResult) => void
  ): GaugeObserver {
    return NOOP_GAUGE_OBSERVER_METRIC;
  }

  /**
   * Returns a constant noop UpDownCounter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createUpDownCounter(_name: string, _options?: MetricOptions): UpDownCounter {
    return NOOP_COUNTER_METRIC;
  }

  /**
   * Returns constant noop up down counter observer.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the up down counter observer callback
   */
  createUpDownCounterObserver(
    _name: string,
    _options?: MetricOptions,
    _callback?: (observerResult: ObserverResult) => void
  ): UpDownCounterObserver {
    return NOOP_UP_DOWN_COUNTER_OBSERVER_METRIC;
  }

  /**
   * Returns constant noop batch observer.
   * @param name the name of the metric.
   * @param callback the batch observer callback
   */
  createBatchObserver(
    _callback: (batchObserverResult: BatchObserverResult) => void
  ): NoopBatchObserver {
    return NOOP_BATCH_OBSERVER;
  }
}

export class NoopMetric<T> implements UnboundMetric<T> {
  private readonly _instrument: T;

  constructor(instrument: T) {
    this._instrument = instrument;
  }

  /**
   * Returns a Bound Instrument associated with specified Labels.
   * It is recommended to keep a reference to the Bound Instrument instead of
   * always calling this method for every operations.
   * @param labels key-values pairs that are associated with a specific metric
   *     that you want to record.
   */
  bind(_labels: Labels): T {
    return this._instrument;
  }

  /**
   * Removes the Binding from the metric, if it is present.
   * @param labels key-values pairs that are associated with a specific metric.
   */
  unbind(_labels: Labels): void {
    return;
  }

  /**
   * Clears all timeseries from the Metric.
   */
  clear(): void {
    return;
  }
}

export class NoopCounterMetric
  extends NoopMetric<BoundCounter>
  implements Counter {
  add(value: number, labels: Labels): void {
    this.bind(labels).add(value);
  }
}

export class NoopHistogramMetric
  extends NoopMetric<BoundHistogram>
  implements Histogram {
  record(value: number, labels: Labels): void {
    this.bind(labels).record(value);
  }
}

export class NoopBaseObserverMetric
  extends NoopMetric<BoundBaseObserver>
  implements BaseObserver {
  observation(): Observation {
    return {
      observer: this as BaseObserver,
      value: 0,
    };
  }
}

export class NoopBatchObserver {}

export class NoopBoundCounter implements BoundCounter {
  add(_value: number): void {
    return;
  }
}

export class NoopBoundHistogram implements BoundHistogram {
  record(_value: number, _baggage?: unknown, _spanContext?: unknown): void {
    return;
  }
}

export class NoopBoundBaseObserver implements BoundBaseObserver {
  update(_value: number): void {}
}

export const NOOP_METER = new NoopMeter();
export const NOOP_BOUND_COUNTER = new NoopBoundCounter();
export const NOOP_COUNTER_METRIC = new NoopCounterMetric(NOOP_BOUND_COUNTER);

export const NOOP_BOUND_HISTOGRAM = new NoopBoundHistogram();
export const NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric(
  NOOP_BOUND_HISTOGRAM
);

export const NOOP_BOUND_BASE_OBSERVER = new NoopBoundBaseObserver();
export const NOOP_GAUGE_OBSERVER_METRIC = new NoopBaseObserverMetric(
  NOOP_BOUND_BASE_OBSERVER
);

export const NOOP_UP_DOWN_COUNTER_OBSERVER_METRIC = new NoopBaseObserverMetric(
  NOOP_BOUND_BASE_OBSERVER
);

export const NOOP_COUNTER_OBSERVER_METRIC = new NoopBaseObserverMetric(
  NOOP_BOUND_BASE_OBSERVER
);

export const NOOP_BATCH_OBSERVER = new NoopBatchObserver();
