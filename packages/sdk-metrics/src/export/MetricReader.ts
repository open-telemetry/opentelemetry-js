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
import { AggregationTemporality } from './AggregationTemporality';
import { MetricProducer } from './MetricProducer';
import { CollectionResult } from './MetricData';
import { FlatMap, callWithTimeout } from '../utils';
import { InstrumentType } from '../InstrumentDescriptor';
import {
  CollectionOptions,
  ForceFlushOptions,
  ShutdownOptions,
} from '../types';
import { Aggregation } from '../view/Aggregation';
import {
  AggregationSelector,
  AggregationTemporalitySelector,
  DEFAULT_AGGREGATION_SELECTOR,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from './AggregationSelector';

export interface MetricReaderOptions {
  /**
   * Aggregation selector based on metric instrument types. If no views are
   * configured for a metric instrument, a per-metric-reader aggregation is
   * selected with this selector.
   */
  aggregationSelector?: AggregationSelector;
  /**
   * Aggregation temporality selector based on metric instrument types. If
   * not configured, cumulative is used for all instruments.
   */
  aggregationTemporalitySelector?: AggregationTemporalitySelector;
  /**
   * **Note, this option is experimental**. Additional MetricProducers to use as a source of
   * aggregated metric data in addition to the SDK's metric data. The resource returned by
   * these MetricProducers is ignored; the SDK's resource will be used instead.
   * @experimental
   */
  metricProducers?: MetricProducer[];
}

/**
 * A registered reader of metrics that, when linked to a {@link MetricProducer}, offers global
 * control over metrics.
 */
export abstract class MetricReader {
  // Tracks the shutdown state.
  // TODO: use BindOncePromise here once a new version of @opentelemetry/core is available.
  private _shutdown = false;
  // Additional MetricProducers which will be combined with the SDK's output
  private _metricProducers: MetricProducer[];
  // MetricProducer used by this instance which produces metrics from the SDK
  private _sdkMetricProducer?: MetricProducer;
  private readonly _aggregationTemporalitySelector: AggregationTemporalitySelector;
  private readonly _aggregationSelector: AggregationSelector;

  constructor(options?: MetricReaderOptions) {
    this._aggregationSelector =
      options?.aggregationSelector ?? DEFAULT_AGGREGATION_SELECTOR;
    this._aggregationTemporalitySelector =
      options?.aggregationTemporalitySelector ??
      DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
    this._metricProducers = options?.metricProducers ?? [];
  }

  /**
   * Set the {@link MetricProducer} used by this instance. **This should only be called by the
   * SDK and should be considered internal.**
   *
   * To add additional {@link MetricProducer}s to a {@link MetricReader}, pass them to the
   * constructor as {@link MetricReaderOptions.metricProducers}.
   *
   * @internal
   * @param metricProducer
   */
  setMetricProducer(metricProducer: MetricProducer) {
    if (this._sdkMetricProducer) {
      throw new Error(
        'MetricReader can not be bound to a MeterProvider again.'
      );
    }
    this._sdkMetricProducer = metricProducer;
    this.onInitialized();
  }

  /**
   * Select the {@link Aggregation} for the given {@link InstrumentType} for this
   * reader.
   */
  selectAggregation(instrumentType: InstrumentType): Aggregation {
    return this._aggregationSelector(instrumentType);
  }

  /**
   * Select the {@link AggregationTemporality} for the given
   * {@link InstrumentType} for this reader.
   */
  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
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
  async collect(options?: CollectionOptions): Promise<CollectionResult> {
    if (this._sdkMetricProducer === undefined) {
      throw new Error('MetricReader is not bound to a MetricProducer');
    }

    // Subsequent invocations to collect are not allowed. SDKs SHOULD return some failure for these calls.
    if (this._shutdown) {
      throw new Error('MetricReader is shutdown');
    }

    const [sdkCollectionResults, ...additionalCollectionResults] =
      await Promise.all([
        this._sdkMetricProducer.collect({
          timeoutMillis: options?.timeoutMillis,
        }),
        ...this._metricProducers.map(producer =>
          producer.collect({
            timeoutMillis: options?.timeoutMillis,
          })
        ),
      ]);

    // Merge the results, keeping the SDK's Resource
    const errors = sdkCollectionResults.errors.concat(
      FlatMap(additionalCollectionResults, result => result.errors)
    );
    const resource = sdkCollectionResults.resourceMetrics.resource;
    const scopeMetrics =
      sdkCollectionResults.resourceMetrics.scopeMetrics.concat(
        FlatMap(
          additionalCollectionResults,
          result => result.resourceMetrics.scopeMetrics
        )
      );
    return {
      resourceMetrics: {
        resource,
        scopeMetrics,
      },
      errors,
    };
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
