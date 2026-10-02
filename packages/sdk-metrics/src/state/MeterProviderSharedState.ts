/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InstrumentationScope } from '@opentelemetry/core';
import type { Resource } from '@opentelemetry/resources';
import { instrumentationScopeId } from '../utils';
import { ViewRegistry } from '../view/ViewRegistry';
import { MeterSharedState } from './MeterSharedState';
import type { MetricCollector, MetricCollectorHandle } from './MetricCollector';
import { toAggregation } from '../view/AggregationOption';
import type { Aggregation } from '../view/Aggregation';
import type { InstrumentType } from '../export/MetricData';
import type { ExemplarFilter } from '../exemplar/ExemplarFilter';
import { WithTraceExemplarFilter } from '../exemplar/WithTraceExemplarFilter';

/**
 * An internal record for shared meter provider states.
 */
export class MeterProviderSharedState {
  viewRegistry = new ViewRegistry();

  metricCollectors: MetricCollector[] = [];

  meterSharedStates: Map<string, MeterSharedState> = new Map();
  public resource: Resource;
  public exemplarFilter: ExemplarFilter;

  constructor(resource: Resource, exemplarFilter?: ExemplarFilter) {
    this.resource = resource;
    this.exemplarFilter = exemplarFilter ?? new WithTraceExemplarFilter();
  }

  getMeterSharedState(instrumentationScope: InstrumentationScope) {
    const id = instrumentationScopeId(instrumentationScope);
    let meterSharedState = this.meterSharedStates.get(id);
    if (meterSharedState == null) {
      meterSharedState = new MeterSharedState(this, instrumentationScope);
      this.meterSharedStates.set(id, meterSharedState);
    }
    return meterSharedState;
  }

  selectAggregations(instrumentType: InstrumentType) {
    const result: [MetricCollectorHandle, Aggregation][] = [];
    for (const collector of this.metricCollectors) {
      result.push([
        collector,
        toAggregation(collector.selectAggregation(instrumentType)),
      ]);
    }
    return result;
  }
}
