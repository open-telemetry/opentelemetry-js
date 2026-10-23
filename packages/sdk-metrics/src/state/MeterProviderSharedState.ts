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
import type { MeterConfigurator } from '../MeterConfigurator';

/**
 * An internal record for shared meter provider states.
 */
export class MeterProviderSharedState {
  viewRegistry = new ViewRegistry();

  metricCollectors: MetricCollector[] = [];

  meterSharedStates: Map<string, MeterSharedState> = new Map();

  constructor(
    public resource: Resource,
    public meterConfigurator?: MeterConfigurator
  ) {}

  getMeterSharedState(instrumentationScope: InstrumentationScope) {
    const id = instrumentationScopeId(instrumentationScope);
    let meterSharedState = this.meterSharedStates.get(id);
    if (meterSharedState == null) {
      const meterConfig =
        this.meterConfigurator?.(instrumentationScope) ?? undefined;
      meterSharedState = new MeterSharedState(
        this,
        instrumentationScope,
        meterConfig
      );
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