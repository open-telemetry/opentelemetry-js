/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, HrTime, Attributes } from '@opentelemetry/api';
import { context as contextApi } from '@opentelemetry/api';
import type { WritableMetricStorage } from './WritableMetricStorage';
import type { Accumulation, Aggregator } from '../aggregator/types';
import type { InstrumentDescriptor } from '../InstrumentDescriptor';
import type { IAttributesProcessor } from '../view/AttributesProcessor';
import { MetricStorage } from './MetricStorage';
import type { MetricData } from '../export/MetricData';
import { DeltaMetricProcessor } from './DeltaMetricProcessor';
import { TemporalMetricProcessor } from './TemporalMetricProcessor';
import type { Maybe } from '../utils';
import type { MetricCollectorHandle } from './MetricCollector';

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
  private _attributesProcessor?: IAttributesProcessor;

  constructor(
    instrumentDescriptor: InstrumentDescriptor,
    aggregator: Aggregator<T>,
    attributesProcessor: IAttributesProcessor | undefined,
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
    this.hasAttributeProcessor = attributesProcessor !== undefined;
  }

  readonly hasAttributeProcessor: boolean;

  record(
    value: number,
    attributes: Attributes,
    context: Context | undefined,
    recordTime: number
  ) {
    if (this._attributesProcessor !== undefined) {
      attributes = this._attributesProcessor.process(
        attributes,
        context ?? contextApi.active()
      );
    }
    this._deltaMetricStorage.record(value, attributes, recordTime);
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
