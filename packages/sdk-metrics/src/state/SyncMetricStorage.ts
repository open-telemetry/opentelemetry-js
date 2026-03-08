/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, HrTime, Attributes } from '@opentelemetry/api';
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
import type { ExemplarFilter } from '../exemplar/ExemplarFilter';
import type { ExemplarReservoir } from '../exemplar/ExemplarReservoir';
import { AttributeHashMap } from './HashMap';
import type { Exemplar } from '../exemplar/Exemplar';

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
  private _exemplarFilter?: ExemplarFilter;
  private _exemplarReservoirFactory?: () => ExemplarReservoir;
  private _exemplarReservoirs = new AttributeHashMap<ExemplarReservoir>();

  constructor(
    instrumentDescriptor: InstrumentDescriptor,
    aggregator: Aggregator<T>,
    attributesProcessor: IAttributesProcessor,
    collectorHandles: MetricCollectorHandle[],
    aggregationCardinalityLimit?: number,
    exemplarFilter?: ExemplarFilter,
    exemplarReservoirFactory?: () => ExemplarReservoir
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
    this._exemplarFilter = exemplarFilter;
    this._exemplarReservoirFactory = exemplarReservoirFactory;
  }

  record(
    value: number,
    attributes: Attributes,
    context: Context,
    recordTime: HrTime
  ) {
    attributes = this._attributesProcessor.process(attributes, context);
    this._deltaMetricStorage.record(value, attributes, context, recordTime);

    if (
      this._exemplarFilter &&
      this._exemplarReservoirFactory &&
      this._exemplarFilter.shouldSample(value, recordTime, attributes, context)
    ) {
      const reservoir = this._exemplarReservoirs.getOrDefault(
        attributes,
        this._exemplarReservoirFactory
      );
      reservoir?.offer(value, recordTime, attributes, context);
    }
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

    // Collect exemplars for each attribute set
    let exemplars: AttributeHashMap<Exemplar[]> | undefined;
    if (this._exemplarFilter) {
      exemplars = new AttributeHashMap<Exemplar[]>();
      for (const [attributes] of this._exemplarReservoirs.keys()) {
        const reservoir = this._exemplarReservoirs.get(attributes);
        if (reservoir) {
          const collected = reservoir.collect(attributes);
          if (collected.length > 0) {
            exemplars.set(attributes, collected);
          }
        }
      }
    }

    return this._temporalMetricStorage.buildMetrics(
      collector,
      this._instrumentDescriptor,
      accumulations,
      collectionTime,
      exemplars
    );
  }
}
