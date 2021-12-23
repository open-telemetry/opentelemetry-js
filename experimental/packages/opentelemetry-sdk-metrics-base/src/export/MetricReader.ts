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
import { ReaderResult, ReaderResultCode } from './ReaderResult';

export type ReaderOptions<T> = {
  done?: (result: ReaderResult<T>) => void
  timeoutMillis?: number
}

export type ReaderCollectionOptions = ReaderOptions<MetricData[]>;

export type ReaderShutdownOptions = ReaderOptions<void>;

export type ReaderForceFlushOptions = ReaderOptions<void>;


/**
 * Adds a timeout to a promise and executes the callback if the specified timeout has elapsed, or the promise
 * has resolved or rejected.
 *
 * <p> NOTE: this operation will continue even after the timeout fires the callback.
 *
 * @param promise promise to use with timeout.
 * @param timeout the timeout in milliseconds until the returned promise is rejected.
 * @param done the callback once the promise has resolved or rejected.
 */
export function promiseWithTimeout<T>(promise: Promise<T>, timeout: number, done: (result: ReaderResult<T>) => void): void {
  // keep handle so that we can clear it later.
  let timeoutHandle: ReturnType<typeof setTimeout>;

  // Set up a promise to handle the timeout.
  const timeoutPromise = new Promise<ReaderResult<T>>(function timeoutFunction(resolve) {
    timeoutHandle = setTimeout(
      function timeoutHandler() {
        resolve({
          code: ReaderResultCode.TIMED_OUT,
          error: new Error('Operation timed out.')
        })
      },
      timeout
    );
  });

  // Wrap to promise to get a result code with the result if it does not reject.
  const resultCodePromise = promise.then(result => {
    return { code: ReaderResultCode.SUCCESS, returnValue: result }
  })

  Promise.race([resultCodePromise, timeoutPromise]).then(result => {
      // Clear timeout on success and return result.
      clearTimeout(timeoutHandle);
      if (done) {
        done(result);
      }
    },
    reason => {
      // Clear timeout on rejection and return failure.
      clearTimeout(timeoutHandle);
      if (done) {
        done({
          code: ReaderResultCode.FAILED,
          error: reason
        });
      }
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
  collect(options: ReaderCollectionOptions): void {
    const timeout = options.timeoutMillis ?? 10000;
    const done = options.done ?? (_result => {
    });

    if (this._metricProducer === undefined) {
      done({
        code: ReaderResultCode.FAILED,
        error: new Error('MetricReader is not bound to a MetricProducer'),
      });
      return;
    }

    // Subsequent invocations to collect are not allowed. SDKs SHOULD return some failure for these calls.
    if (this._shutdown) {
      done({
        code: ReaderResultCode.FAILED,
        error: new Error('Collection is not allowed after shutdown'),
      });
      return;
    }

    promiseWithTimeout(this._metricProducer.collect(), timeout, done);
  }

  /**
   * Shuts down the metric reader, the callback will fire after the specified timeout or after completion.
   *
   * <p> NOTE: this operation will continue even after the timeout fires the callback.
   * @param options
   */
  shutdown(options: ReaderForceFlushOptions): void {
    const timeout = options.timeoutMillis ?? 10000;
    const done = options.done ?? (_result => {
    });

    // Do not call shutdown again if it has already been called.
    if (this._shutdown) {
      done({
        code: ReaderResultCode.FAILED,
        error: new Error('Cannot call shutdown twice.')
      });
      return;
    }

    promiseWithTimeout(this.onShutdown(), timeout, result => {
        if (result.code === ReaderResultCode.SUCCESS) {
          this._shutdown = true;
        }
        done(result);
      }
    );

  }

  /**
   * Flushes metrics read by this reader, the callback will fire after the specified timeout or after completion.
   *
   * <p> NOTE: this operation will continue even after the timeout fires the callback.
   * @param options options with timeout (default: 10000ms) and a result callback.
   */
  forceFlush(options: ReaderShutdownOptions): void {
    const timeout = options.timeoutMillis ?? 10000;
    const done = options.done ?? (_result => {
    });

    if (this._shutdown) {
      done({
        code: ReaderResultCode.FAILED,
        error: new Error('Cannot forceFlush on already shutdown MetricReader')
      });
      return;
    }

    promiseWithTimeout(this.onForceFlush(), timeout, done);
  }
}
