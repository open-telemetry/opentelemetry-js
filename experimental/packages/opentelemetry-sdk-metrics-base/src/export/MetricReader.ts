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

export type ReaderErrorOptions = {
  message: string,
  error?: Error;
}

// TODO: result callback, look at trace implementation
/**
 * Base error thrown by the reader.
 */
export class ReaderError extends Error {
  // Optional error that caused this error.
  public readonly innerError?: Error;

  /**
   * Creates a new instance of the ReaderError class.
   * @param options
   */
  constructor(options: ReaderErrorOptions) {
    super(options.message);
    this.innerError = options.error;
  }
}

/**
 * Error that is thrown on timeouts (i.e. timeout on forceFlush or shutdown)
 */
export class ReaderTimeoutError extends ReaderError {
}

/**
 * Error that is thrown on failures (i.e. unhandled exceptions during forceFlush or shutdown)
 */
export class ReaderFailureError extends ReaderError {
}

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#metricreader

/**
 * A registered reader of metrics that, when linked to a {@link MetricProducer} offers, global
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
   *
   * @protected
   */
  protected abstract onInitialized(): void;

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
  async collect(): Promise<MetricData[]> {
    if (this._metricProducer === undefined) {
      throw new ReaderFailureError({ message: 'MetricReader is not bound to a MetricProducer' });
    }

    // Subsequent invocations to collect are not allowed. SDKs SHOULD return some failure for these calls.
    if (this._shutdown) {
      throw new ReaderFailureError({ message: 'Collection is not allowed after shutdown' });
    }

    return await this._metricProducer.collect();
  }

  /**
   * Calls an async function with a timeout. Will reject if the async function passed to this does not complete
   * before the timeout is reached.
   * @param promise promise to use with timeout.
   * @param timeout timeout in milliseconds until the returned promise is rejected.
   * @protected
   */
  protected callWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>(function timeoutFunction(_resolve, reject) {
      timeoutHandle = setTimeout(
        function timeoutHandler() {
          // TODO: This does not produce an adequate stacktrace.
          reject(new ReaderTimeoutError({ message: 'Operation timed out.' }))
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


  private async _tryShutdown() {
    try {
      await this.onShutdown();
    } catch (err) {
      // Re-throw timeout errors.
      if (err instanceof ReaderTimeoutError) {
        throw err;
      }

      throw new ReaderFailureError({
        message: 'Unexpected error during shutdown.',
        error: err
      });

    }
  }

  /**
   * Shuts down the metric reader
   * @param shutdownTimeout timeout for shutdown (default: 10000ms)
   */
  // TODO: function will continue.
  async shutdown(shutdownTimeout = 10000): Promise<void> {
    // Do not call shutdown again if it has already been called.
    if (this._shutdown) {
      throw new ReaderFailureError({ message: 'Cannot call shutdown twice.' })
    }

    await this.callWithTimeout(this._tryShutdown(), shutdownTimeout);

    // TODO: (spec) can i not call shutdown twice even on shutdown failure?
    this._shutdown = true;
  }

  private async _tryForceFlush() {
    try {
      await this.onForceFlush();
    } catch (err) {
      // Re-throw timeout errors.
      if (err instanceof ReaderTimeoutError) {
        throw err;
      }

      throw new ReaderFailureError({
        message: 'Unexpected error during forceFlush.',
        error: err
      });
    }
  }

  /**
   * Flushes metrics read by this reader.
   * @param forceFlushTimeout timeout for force-flush (default: 10000 ms)
   */
  async forceFlush(forceFlushTimeout = 10000): Promise<void> {
    if (this._shutdown) {
      throw new ReaderFailureError({ message: 'Cannot forceFlush on already shutdown MetricReader' })
    }

    await this.callWithTimeout(this._tryForceFlush(), forceFlushTimeout);
  }
}
