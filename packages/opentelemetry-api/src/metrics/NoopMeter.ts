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

import { BatchObserverResult } from './BatchObserverResult';
import { Meter } from './Meter';
import {
  MetricOptions,
  UnboundMetric,
  Labels,
  Counter,
  ValueRecorder,
  ValueObserver,
  BatchObserver,
  UpDownCounter,
  BaseObserver,
} from './Metric';
import {
  BoundValueRecorder,
  BoundCounter,
  BoundBaseObserver,
} from './BoundInstrument';
import { CorrelationContext } from '../correlation_context/CorrelationContext';
import { SpanContext } from '../trace/span_context';
import { ObserverResult } from './ObserverResult';

/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
export class NoopMeter implements Meter {
  constructor() {}

  /**
   * Returns constant noop value recorder.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createValueRecorder(name: string, options?: MetricOptions): ValueRecorder {
    return NOOP_VALUE_RECORDER_METRIC;
  }

  /**
   * Returns a constant noop counter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(name: string, options?: MetricOptions): Counter {
    return NOOP_COUNTER_METRIC;
  }

  /**
   * Returns a constant noop UpDownCounter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createUpDownCounter(name: string, options?: MetricOptions): UpDownCounter {
    return NOOP_COUNTER_METRIC;
  }

  /**
   * Returns constant noop value observer.
   * @param name the name of the metric.
   * @param [options] the metric options.
   * @param [callback] the value observer callback
   */
  createValueObserver(
    name: string,
    options?: MetricOptions,
    callback?: (observerResult: ObserverResult) => void
  ): ValueObserver {
    return NOOP_VALUE_OBSERVER_METRIC;
  }

  /**
   * Returns constant noop batch observer.
   * @param name the name of the metric.
   * @param callback the batch observer callback
   */
  createBatchObserver(
    name: string,
    callback: (batchObserverResult: BatchObserverResult) => void
  ): BatchObserver {
    return NOOP_BATCH_OBSERVER_METRIC;
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
  bind(labels: Labels): T {
    return this._instrument;
  }

  /**
   * Removes the Binding from the metric, if it is present.
   * @param labels key-values pairs that are associated with a specific metric.
   */
  unbind(labels: Labels): void {
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
  add(value: number, labels: Labels) {
    this.bind(labels).add(value);
  }
}

export class NoopValueRecorderMetric
  extends NoopMetric<BoundValueRecorder>
  implements ValueRecorder {
  record(
    value: number,
    labels: Labels,
    correlationContext?: CorrelationContext,
    spanContext?: SpanContext
  ) {
    if (typeof correlationContext === 'undefined') {
      this.bind(labels).record(value);
    } else if (typeof spanContext === 'undefined') {
      this.bind(labels).record(value, correlationContext);
    } else {
      this.bind(labels).record(value, correlationContext, spanContext);
    }
  }
}

export class NoopBaseObserverMetric
  extends NoopMetric<BoundBaseObserver>
  implements BaseObserver {
  observation() {
    return {
      observer: this as BaseObserver,
      value: 0,
    };
  }
}

export class NoopBatchObserverMetric
  extends NoopMetric<void>
  implements BatchObserver {}

export class NoopBoundCounter implements BoundCounter {
  add(value: number): void {
    return;
  }
}

export class NoopBoundValueRecorder implements BoundValueRecorder {
  record(
    value: number,
    correlationContext?: CorrelationContext,
    spanContext?: SpanContext
  ): void {
    return;
  }
}

export class NoopBoundBaseObserver implements BoundBaseObserver {
  update(value: number) {}
}

export const NOOP_METER = new NoopMeter();
export const NOOP_BOUND_COUNTER = new NoopBoundCounter();
export const NOOP_COUNTER_METRIC = new NoopCounterMetric(NOOP_BOUND_COUNTER);

export const NOOP_BOUND_VALUE_RECORDER = new NoopBoundValueRecorder();
export const NOOP_VALUE_RECORDER_METRIC = new NoopValueRecorderMetric(
  NOOP_BOUND_VALUE_RECORDER
);

export const NOOP_BOUND_BASE_OBSERVER = new NoopBoundBaseObserver();
export const NOOP_VALUE_OBSERVER_METRIC = new NoopBaseObserverMetric(
  NOOP_BOUND_BASE_OBSERVER
);

export const NOOP_UP_DOWN_SUM_OBSERVER_METRIC = new NoopBaseObserverMetric(
  NOOP_BOUND_BASE_OBSERVER
);

export const NOOP_SUM_OBSERVER_METRIC = new NoopBaseObserverMetric(
  NOOP_BOUND_BASE_OBSERVER
);

export const NOOP_BATCH_OBSERVER_METRIC = new NoopBatchObserverMetric();
