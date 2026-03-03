/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, HrTime, Attributes } from '@opentelemetry/api';
import { WritableMetricStorage } from './WritableMetricStorage';
import { Accumulation, Aggregator } from '../aggregator/types';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { IAttributesProcessor } from '../view/AttributesProcessor';
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
export class SyncMetricStorage<T extends Maybe<Accumulation>>
  extends MetricStorage
  implements WritableMetricStorage
{
  private _aggregationCardinalityLimit?: number;
  private _deltaMetricStorage: DeltaMetricProcessor<T>;
  private _temporalMetricStorage: TemporalMetricProcessor<T>;
  private _attributesProcessor: IAttributesProcessor;

  constructor(
    instrumentDescriptor: InstrumentDescriptor,
    aggregator: Aggregator<T>,
    attributesProcessor: IAttributesProcessor,
    collectorHandles: MetricCollectorHandle[],
    aggregationCardinalityLimit?: number
  ) {
    super(instrumentDescriptor);
    this._aggregationCardinalityLimit = aggregationCardinalityLimit;
    this._deltaMetricStorage = new DeltaMetricProcessor(
      aggregator,
      this._aggregationCardinalityLimit
    );
    this._temporalMetricStorage = new TemporalMetricProcessor(
      aggregator,
      collectorHandles
    );
    this._attributesProcessor = attributesProcessor;
  }

  record(
    value: number,
    attributes: Attributes,
    context: Context,
    recordTime: HrTime
  ) {
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
    collectionTime: HrTime
  ): Maybe<MetricData> {
    const accumulations = this._deltaMetricStorage.collect();

    return this._temporalMetricStorage.buildMetrics(
      collector,
      this._instrumentDescriptor,
      accumulations,
      collectionTime
    );
  }
}
