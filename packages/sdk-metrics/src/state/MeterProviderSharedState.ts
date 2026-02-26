/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentationScope } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { instrumentationScopeId } from '../utils';
import { ViewRegistry } from '../view/ViewRegistry';
import { MeterSharedState } from './MeterSharedState';
import { MetricCollector, MetricCollectorHandle } from './MetricCollector';
import { toAggregation } from '../view/AggregationOption';
import { Aggregation } from '../view/Aggregation';
import { InstrumentType } from '../export/MetricData';

/**
 * An internal record for shared meter provider states.
 */
export class MeterProviderSharedState {
  viewRegistry = new ViewRegistry();

  metricCollectors: MetricCollector[] = [];

  meterSharedStates: Map<string, MeterSharedState> = new Map();
  public resource: Resource;

  constructor(resource: Resource) {
    this.resource = resource;
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
