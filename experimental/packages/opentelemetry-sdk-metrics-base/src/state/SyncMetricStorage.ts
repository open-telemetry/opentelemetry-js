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

import { Context, HrTime } from '@opentelemetry/api';
import { MetricAttributes } from '@opentelemetry/api-metrics';
import { WritableMetricStorage } from './WritableMetricStorage';
import { Accumulation, Aggregator } from '../aggregator/types';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { AttributesProcessor } from '../view/AttributesProcessor';
import { MetricStorage } from './MetricStorage';
import { MetricData } from '../export/MetricData';
import { DeltaMetricProcessor } from './DeltaMetricProcessor';
import { TemporalMetricProcessor } from './TemporalMetricProcessor';
import { Maybe } from '../utils';
import { MetricCollectorHandle } from './MetricCollector';

/**
 * Internal interface.
 *
 * Stores and aggregates {@link MetricData} for synchronous instruments.
 */
export class SyncMetricStorage<T extends Maybe<Accumulation>> extends MetricStorage implements WritableMetricStorage {
  private _deltaMetricStorage: DeltaMetricProcessor<T>;
  private _temporalMetricStorage: TemporalMetricProcessor<T>;

  constructor(
    instrumentDescriptor: InstrumentDescriptor,
    aggregator: Aggregator<T>,
    private _attributesProcessor: AttributesProcessor
  ) {
    super(instrumentDescriptor);
    this._deltaMetricStorage = new DeltaMetricProcessor(aggregator);
    this._temporalMetricStorage = new TemporalMetricProcessor(aggregator);
  }

  record(value: number, attributes: MetricAttributes, context: Context, recordTime: HrTime) {
    attributes = this._attributesProcessor.process(attributes, context);
    this._deltaMetricStorage.record(value, attributes, context, recordTime);
  }

  /**
   * Collects the metrics from this storage.
   *
   * Note: This is a stateful operation and may reset any interval-related
   * state for the MetricCollector.
   */
  collect(
    collector: MetricCollectorHandle,
    collectors: MetricCollectorHandle[],
    collectionTime: HrTime,
  ): Maybe<MetricData> {
    const accumulations = this._deltaMetricStorage.collect();

    return this._temporalMetricStorage.buildMetrics(
      collector,
      collectors,
      this._instrumentDescriptor,
      accumulations,
      collectionTime
    );
  }
}
