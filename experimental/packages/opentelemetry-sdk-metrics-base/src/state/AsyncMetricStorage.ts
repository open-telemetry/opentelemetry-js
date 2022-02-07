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

import { HrTime } from '@opentelemetry/api';
import { ObservableCallback } from '@opentelemetry/api-metrics-wip';
import { Accumulation, Aggregator } from '../aggregator/types';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { AttributesProcessor } from '../view/AttributesProcessor';
import { MetricStorage } from './MetricStorage';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { MetricData } from '../export/MetricData';
import { DeltaMetricProcessor } from './DeltaMetricProcessor';
import { TemporalMetricProcessor } from './TemporalMetricProcessor';
import { Maybe } from '../utils';
import { MetricCollectorHandle } from './MetricCollector';
import { AttributeHashMap } from './HashMap';
import { ObservableRegistry } from './ObservableRegistry';

/**
 * Internal interface.
 *
 * Stores and aggregates {@link MetricData} for asynchronous instruments.
 */
export class AsyncMetricStorage<T extends Maybe<Accumulation>> implements MetricStorage {
  private _deltaMetricStorage: DeltaMetricProcessor<T>;
  private _temporalMetricStorage: TemporalMetricProcessor<T>;

  constructor(
    private _instrumentDescriptor: InstrumentDescriptor,
    aggregator: Aggregator<T>,
    private _attributesProcessor: AttributesProcessor,
    private _callback: ObservableCallback,
    private _observableRegistry: ObservableRegistry,
  ) {
    this._deltaMetricStorage = new DeltaMetricProcessor(aggregator);
    this._temporalMetricStorage = new TemporalMetricProcessor(aggregator);
  }

  private _record(measurements: AttributeHashMap<number>) {
    const processed = new AttributeHashMap<number>();
    Array.from(measurements.entries()).forEach(([attributes, value]) => {
      processed.set(this._attributesProcessor.process(attributes), value);
    });
    this._deltaMetricStorage.batchCumulate(processed);
  }

  /**
   * Collects the metrics from this storage. The ObservableCallback is invoked
   * during the collection.
   *
   * Note: This is a stateful operation and may reset any interval-related
   * state for the MetricCollector.
   */
  collect(
    collector: MetricCollectorHandle,
    collectors: MetricCollectorHandle[],
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    sdkStartTime: HrTime,
    collectionTime: HrTime,
  ): Maybe<MetricData> {
    const observableResult = this._observableRegistry.getObservableResult(this._callback);
    if (observableResult == null) {
      return;
    }
    this._record(observableResult.buffer);

    const accumulations = this._deltaMetricStorage.collect();

    return this._temporalMetricStorage.buildMetrics(
      collector,
      collectors,
      resource,
      instrumentationLibrary,
      this._instrumentDescriptor,
      accumulations,
      sdkStartTime,
      collectionTime
    );
  }
}
