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
import { CollectionResult, InstrumentType } from './MetricData';
import { callWithTimeout, FlatMap } from '../utils';
import {
  CollectionOptions,
  ForceFlushOptions,
  ShutdownOptions,
} from '../types';
import {
  AggregationSelector,
  AggregationTemporalitySelector,
  DEFAULT_AGGREGATION_SELECTOR,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from './AggregationSelector';
import { AggregationOption } from '../view/AggregationOption';
import { CardinalitySelector } from './CardinalitySelector';

export interface MetricReaderOptions {
  /**
   * Aggregation selector based on metric instrument types. If no views are
   * configured for a metric instrument, a per-metric-reader aggregation is
   * selected with this selector.
   *
   * <p> NOTE: the provided function MUST be pure
   */
  aggregationSelector?: AggregationSelector;
  /**
   * Aggregation temporality selector based on metric instrument types. If
   * not configured, cumulative is used for all instruments.
   *
   * <p> NOTE: the provided function MUST be pure
   */
  aggregationTemporalitySelector?: AggregationTemporalitySelector;
  /**
   * Cardinality selector based on metric instrument types. If not configured,
   * a default value is used.
   *
   * <p> NOTE: the provided function MUST be pure
   */
  cardinalitySelector?: CardinalitySelector;
  /**
   * **Note, this option is experimental**. Additional MetricProducers to use as a source of
   * aggregated metric data in addition to the SDK's metric data. The resource returned by
   * these MetricProducers is ignored; the SDK's resource will be used instead.
   * @experimental
   */
  metricProducers?: MetricProducer[];
}

/**
 * Reads metrics from the SDK. Implementations MUST follow the Metric Reader Specification as well as the requirements
 * listed in this interface. Consider extending {@link MetricReader} to get a specification-compliant base implementation
 * of this interface
 */
export interface IMetricReader {
  /**
   * Set the {@link MetricProducer} used by this instance. **This should only be called once by the
   * SDK and should be considered internal.**
   *
   * <p> NOTE: implementations MUST throw when called more than once
   *
   * @param metricProducer
   */
  setMetricProducer(metricProducer: MetricProducer): void;

  /**
   * Select the {@link AggregationOption} for the given {@link InstrumentType} for this
   * reader.
   *
   * <p> NOTE: implementations MUST be pure
   */
  selectAggregation(instrumentType: InstrumentType): AggregationOption;

  /**
   * Select the {@link AggregationTemporality} for the given
   * {@link InstrumentType} for this reader.
   *
   * <p> NOTE: implementations MUST be pure
   */
  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality;

  /**
   * Select the cardinality limit for the given {@link InstrumentType} for this
   * reader.
   *
   * <p> NOTE: implementations MUST be pure
   */
  selectCardinalityLimit(instrumentType: InstrumentType): number;

  /**
   * Collect all metrics from the associated {@link MetricProducer}
   */
  collect(options?: CollectionOptions): Promise<CollectionResult>;

  /**
   * Shuts down the metric reader, the promise will reject after the optional timeout or resolve after completion.
   *
   * <p> NOTE: this operation MAY continue even after the promise rejects due to a timeout.
   * @param options options with timeout.
   */
  shutdown(options?: ShutdownOptions): Promise<void>;

  /**
   * Flushes metrics read by this reader, the promise will reject after the optional timeout or resolve after completion.
   *
   * <p> NOTE: this operation MAY continue even after the promise rejects due to a timeout.
   * @param options options with timeout.
   */
  forceFlush(options?: ForceFlushOptions): Promise<void>;
}

/**
 * A registered reader of metrics that, when linked to a {@link MetricProducer}, offers global
 * control over metrics.
 */
export abstract class MetricReader implements IMetricReader {
  // Tracks the shutdown state.
  // TODO: use BindOncePromise here once a new version of @opentelemetry/core is available.
  private _shutdown = false;
  // Additional MetricProducers which will be combined with the SDK's output
  private _metricProducers: MetricProducer[];
  // MetricProducer used by this instance which produces metrics from the SDK
  private _sdkMetricProducer?: MetricProducer;
  private readonly _aggregationTemporalitySelector: AggregationTemporalitySelector;
  private readonly _aggregationSelector: AggregationSelector;
  private readonly _cardinalitySelector?: CardinalitySelector;

  constructor(options?: MetricReaderOptions) {
    this._aggregationSelector =
      options?.aggregationSelector ?? DEFAULT_AGGREGATION_SELECTOR;
    this._aggregationTemporalitySelector =
      options?.aggregationTemporalitySelector ??
      DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
    this._metricProducers = options?.metricProducers ?? [];
    this._cardinalitySelector = options?.cardinalitySelector;
  }

  setMetricProducer(metricProducer: MetricProducer) {
    if (this._sdkMetricProducer) {
      throw new Error(
        'MetricReader can not be bound to a MeterProvider again.'
      );
    }
    this._sdkMetricProducer = metricProducer;
    this.onInitialized();
  }

  selectAggregation(instrumentType: InstrumentType): AggregationOption {
    return this._aggregationSelector(instrumentType);
  }

  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._aggregationTemporalitySelector(instrumentType);
  }

  selectCardinalityLimit(instrumentType: InstrumentType): number {
    return this._cardinalitySelector
      ? this._cardinalitySelector(instrumentType)
      : 2000; // default value if no selector is provided
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
