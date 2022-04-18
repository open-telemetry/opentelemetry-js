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

import * as api from '@opentelemetry/api';
import { AggregationTemporality, AggregationTemporalitySelector } from './AggregationTemporality';
import { MetricProducer } from './MetricProducer';
import { ResourceMetrics } from './MetricData';
import { callWithTimeout, Maybe } from '../utils';
import { InstrumentType } from '../InstrumentDescriptor';
import { CollectionOptions, ForceFlushOptions, ShutdownOptions } from '../types';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#metricreader

/**
 * A registered reader of metrics that, when linked to a {@link MetricProducer}, offers global
 * control over metrics.
 */
export abstract class MetricReader {
  // Tracks the shutdown state.
  // TODO: use BindOncePromise here once a new version of @opentelemetry/core is available.
  private _shutdown = false;
  // MetricProducer used by this instance.
  private _metricProducer?: MetricProducer;

  constructor(private readonly _aggregationTemporalitySelector: AggregationTemporalitySelector) {
  }

  /**
   * Set the {@link MetricProducer} used by this instance.
   *
   * @param metricProducer
   */
  setMetricProducer(metricProducer: MetricProducer) {
    if (this._metricProducer) {
      throw new Error('MetricReader can not be bound to a MeterProvider again.');
    }
    this._metricProducer = metricProducer;
    this.onInitialized();
  }

  /**
   * Get the {@link AggregationTemporality} preferred by this {@link MetricReader}
   */
  getAggregationTemporality(instrumentType: InstrumentType): AggregationTemporality {
    return this._aggregationTemporalitySelector(instrumentType);
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
  async collect(options?: CollectionOptions): Promise<Maybe<ResourceMetrics>> {
    if (this._metricProducer === undefined) {
      throw new Error('MetricReader is not bound to a MetricProducer');
    }

    // Subsequent invocations to collect are not allowed. SDKs SHOULD return some failure for these calls.
    if (this._shutdown) {
      api.diag.warn('Collection is not allowed after shutdown');
      return undefined;
    }

    // No timeout if timeoutMillis is undefined or null.
    if (options?.timeoutMillis == null) {
      return await this._metricProducer.collect();
    }

    return await callWithTimeout(this._metricProducer.collect(), options.timeoutMillis);
  }

  /**
   * Shuts down the metric reader, the promise will reject after the optional timeout or resolve after completion.
   *
   * <p> NOTE: this operation will continue even after the promise rejects due to a timeout.
   * @param options options with timeout.
   */
  async shutdown(options?: ShutdownOptions): Promise<void> {
    // Do not call shutdown again if it has already been called.
    if (this._shutdown) {
      api.diag.error('Cannot call shutdown twice.');
      return;
    }

    // No timeout if timeoutMillis is undefined or null.
    if (options?.timeoutMillis == null) {
      await this.onShutdown();
    } else {
      await callWithTimeout(this.onShutdown(), options.timeoutMillis);
    }

    this._shutdown = true;
  }

  /**
   * Flushes metrics read by this reader, the promise will reject after the optional timeout or resolve after completion.
   *
   * <p> NOTE: this operation will continue even after the promise rejects due to a timeout.
   * @param options options with timeout.
   */
  async forceFlush(options?: ForceFlushOptions): Promise<void> {
    if (this._shutdown) {
      api.diag.warn('Cannot forceFlush on already shutdown MetricReader.');
      return;
    }

    // No timeout if timeoutMillis is undefined or null.
    if (options?.timeoutMillis == null) {
      await this.onForceFlush();
      return;
    }

    await callWithTimeout(this.onForceFlush(), options.timeoutMillis);
  }
}
