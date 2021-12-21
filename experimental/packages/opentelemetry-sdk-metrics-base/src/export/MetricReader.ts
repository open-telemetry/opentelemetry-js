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


export interface ReaderResult<T> {
  code: ReaderResultCode;
  error?: Error;
  returnValue?: T;
}

export enum ReaderResultCode {
  SUCCESS,
  FAILED,
  TIMED_OUT
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
  collect(timeoutMillis: number, done?: (result: ReaderResult<MetricData[]>) => void): void {
    if (this._metricProducer === undefined) {
      if (done) {
        done({
          code: ReaderResultCode.FAILED,
          error: new Error('MetricReader is not bound to a MetricProducer'),
        });
      }
      return;
    }

    if(done) {
      // Subsequent invocations to collect are not allowed. SDKs SHOULD return some failure for these calls.
      if (this._shutdown) {
        if (done) {
          done({
            code: ReaderResultCode.FAILED,
            error: new Error('Collection is not allowed after shutdown'),
          });
        }
        return;
      }
    }

    this._metricProducer.collect().then(
      result => {
        if(done){
          done({
            code: ReaderResultCode.SUCCESS,
            returnValue: result
          });
        }
      },
      reason => {
        if(done){
          done({
            code: ReaderResultCode.FAILED,
            error: reason
          })
        }
      }
    )
  }

  /**
   * Adds a timeout to a promise. Will reject if the async function passed to this does not complete
   * before the timeout is reached.
   * @param promise promise to use with timeout.
   * @param timeout timeout in milliseconds until the returned promise is rejected.
   * @param done
   * @protected
   */
  protected static promiseWithTimeout<T>(promise: Promise<T>, timeout: number, done?: (result: ReaderResult<T>) => void): void {
    let timeoutHandle: ReturnType<typeof setTimeout>;

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

  /**
   * Shuts down the metric reader
   * @param shutdownTimeout timeout for shutdown (default: 10000ms)
   * @param done
   */
  // TODO: function will continue.
  shutdown(shutdownTimeout = 10000, done?: (result: ReaderResult<void>) => void): void {
    // Do not call shutdown again if it has already been called.
    if (this._shutdown) {
      if (done) {
        done({
          code: ReaderResultCode.FAILED,
          error: new Error('Cannot call shutdown twice.')
        });
        return;
      }
    }

    MetricReader.promiseWithTimeout(this.onShutdown(), shutdownTimeout, (result => {
        if (result.code === ReaderResultCode.SUCCESS) {
          this._shutdown = true;
        }

        if (done) {
          done(result);
        }
      })
    );

  }

  /**
   * Flushes metrics read by this reader.
   * @param forceFlushTimeout timeout for force-flush (default: 10000 ms)
   * @param done
   */
  forceFlush(forceFlushTimeout = 10000, done ?: (result: ReaderResult<void>) => void): void {
    if (this._shutdown) {
      if (done) {
        done({
          code: ReaderResultCode.FAILED,
          error: new Error('Cannot forceFlush on already shutdown MetricReader')
        });
        return;
      }
    }

    MetricReader.promiseWithTimeout(this.onForceFlush(), forceFlushTimeout, done);
  }
}
