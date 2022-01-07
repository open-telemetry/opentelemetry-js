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

import { AggregationTemporality } from './AggregationTemporality';
import { MetricProducer } from './MetricProducer';
import { MetricData } from './MetricData';

export type ReaderOptions = {
  timeoutMillis?: number
}

export type ReaderCollectionOptions = ReaderOptions;

export type ReaderShutdownOptions = ReaderOptions;

export type ReaderForceFlushOptions = ReaderOptions;

/**
 * Error that is thrown on timeouts (i.e. timeout on forceFlush or shutdown)
 */
export class ReaderTimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, ReaderTimeoutError.prototype);
  }
}

/**
 * Adds a timeout to a promise and rejects if the specified timeout has elapsed. Also rejects if the specified promise
 * rejects, and resolves if the specified promise resolves.
 *
 * <p> NOTE: this operation will continue even after it throws a {@link ReaderTimeoutError}.
 *
 * @param promise promise to use with timeout.
 * @param timeout the timeout in milliseconds until the returned promise is rejected.
 */
export function callWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>(function timeoutFunction(_resolve, reject) {
    timeoutHandle = setTimeout(
      function timeoutHandler() {
        reject(new ReaderTimeoutError('Operation timed out.'));
      },
      timeout
    );
  });

  return Promise.race([promise, timeoutPromise]).then(result => {
      clearTimeout(timeoutHandle);
      return result;
    },
    reason => {
      clearTimeout(timeoutHandle);
      throw reason;
    });
}

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#metricreader

/**
 * A registered reader of metrics that, when linked to a {@link MetricProducer}, offers global
 * control over metrics.
 */
export abstract class MetricReader {
  // Tracks the shutdown state.
  private _shutdown = false;
  // MetricProducer used by this instance.
  private _metricProducer?: MetricProducer;

  constructor(private readonly _preferredAggregationTemporality = AggregationTemporality.CUMULATIVE) {
  }

  /**
   * Set the {@link MetricProducer} used by this instance.
   *
   * @param metricProducer
   */
  setMetricProducer(metricProducer: MetricProducer) {
    this._metricProducer = metricProducer;
    this.onInitialized();
  }

  /**
   * Get the {@link AggregationTemporality} preferred by this {@link MetricReader}
   */
  getPreferredAggregationTemporality(): AggregationTemporality {
    return this._preferredAggregationTemporality;
  }

  /**
   * Handle once the SDK has initialized this {@link MetricReader}
   * Overriding this method is optional.
   */
  protected onInitialized(): void {
    // Default implementation is empty.
  }

  /**
   * Handle a shutdown signal by the SDK.
   *
   * <p> For push exporters, this should shut down any intervals and close any open connections.
   * @protected
   */
  protected abstract onShutdown(): Promise<void>;

  /**
   * Handle a force flush signal by the SDK.
   *
   * <p> In all scenarios metrics should be collected via {@link collect()}.
   * <p> For push exporters, this should collect and report metrics.
   * @protected
   */
  protected abstract onForceFlush(): Promise<void>;

  /**
   * Collect all metrics from the associated {@link MetricProducer}
   */
  async collect(options: ReaderCollectionOptions): Promise<MetricData[]> {
    if (this._metricProducer === undefined) {
      throw new Error('MetricReader is not bound to a MetricProducer');
    }

    // Subsequent invocations to collect are not allowed. SDKs SHOULD return some failure for these calls.
    if (this._shutdown) {
      throw new Error('Collection is not allowed after shutdown');
    }

    return await callWithTimeout(this._metricProducer.collect(), options.timeoutMillis ?? 10000);
  }

  /**
   * Shuts down the metric reader, the promise will reject after the specified timeout or resolve after completion.
   *
   * <p> NOTE: this operation will continue even after the promise rejects due to a timeout.
   * @param options options with timeout (default: 10000ms).
   */
  async shutdown(options: ReaderForceFlushOptions): Promise<void> {
    // Do not call shutdown again if it has already been called.
    if (this._shutdown) {
      throw new Error('Cannot call shutdown twice.');
    }

    await callWithTimeout(this.onShutdown(), options.timeoutMillis ?? 10000);
    this._shutdown = true;
  }

  /**
   * Flushes metrics read by this reader, the promise will reject after the specified timeout or resolve after completion.
   *
   * <p> NOTE: this operation will continue even after the promise rejects due to a timeout.
   * @param options options with timeout (default: 10000ms).
   */
  async forceFlush(options: ReaderShutdownOptions): Promise<void> {
    if (this._shutdown) {
      throw new Error('Cannot forceFlush on already shutdown MetricReader.');
    }

    await callWithTimeout(this.onForceFlush(), options.timeoutMillis ?? 10000);
  }
}
