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

import { millisToHrTime } from '@opentelemetry/core';
import { AggregationTemporalitySelector } from '../export/AggregationSelector';
import {
  CollectionResult,
  InstrumentType,
  ScopeMetrics,
} from '../export/MetricData';
import { MetricCollectOptions, MetricProducer } from '../export/MetricProducer';
import { IMetricReader } from '../export/MetricReader';
import { ForceFlushOptions, ShutdownOptions } from '../types';
import { MeterProviderSharedState } from './MeterProviderSharedState';

/**
 * An internal opaque interface that the MetricReader receives as
 * MetricProducer. It acts as the storage key to the internal metric stream
 * state for each MetricReader.
 */
export class MetricCollector implements MetricProducer {
  constructor(
    private _sharedState: MeterProviderSharedState,
    private _metricReader: IMetricReader
  ) {}

  async collect(options?: MetricCollectOptions): Promise<CollectionResult> {
    const collectionTime = millisToHrTime(Date.now());
    const scopeMetrics: ScopeMetrics[] = [];
    const errors: unknown[] = [];

    const meterCollectionPromises = Array.from(
      this._sharedState.meterSharedStates.values()
    ).map(async meterSharedState => {
      const current = await meterSharedState.collect(
        this,
        collectionTime,
        options
      );

      // only add scope metrics if available
      if (current?.scopeMetrics != null) {
        scopeMetrics.push(current.scopeMetrics);
      }

      // only add errors if available
      if (current?.errors != null) {
        errors.push(...current.errors);
      }
    });
    await Promise.all(meterCollectionPromises);

    return {
      resourceMetrics: {
        resource: this._sharedState.resource,
        scopeMetrics: scopeMetrics,
      },
      errors: errors,
    };
  }

  /**
   * Delegates for MetricReader.forceFlush.
   */
  async forceFlush(options?: ForceFlushOptions): Promise<void> {
    await this._metricReader.forceFlush(options);
  }

  /**
   * Delegates for MetricReader.shutdown.
   */
  async shutdown(options?: ShutdownOptions): Promise<void> {
    await this._metricReader.shutdown(options);
  }

  selectAggregationTemporality(instrumentType: InstrumentType) {
    return this._metricReader.selectAggregationTemporality(instrumentType);
  }

  selectAggregation(instrumentType: InstrumentType) {
    return this._metricReader.selectAggregation(instrumentType);
  }

  /**
   * Select the cardinality limit for the given {@link InstrumentType} for this
   * collector.
   */
  selectCardinalityLimit(instrumentType: InstrumentType): number {
    return this._metricReader.selectCardinalityLimit?.(instrumentType) ?? 2000;
  }
}

/**
 * An internal interface for MetricCollector. Exposes the necessary
 * information for metric collection.
 */
export interface MetricCollectorHandle {
  selectAggregationTemporality: AggregationTemporalitySelector;
  selectCardinalityLimit(instrumentType: InstrumentType): number;
}
