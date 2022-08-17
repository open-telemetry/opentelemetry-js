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

import { InstrumentationScope } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { instrumentationScopeId } from '../utils';
import { ViewRegistry } from '../view/ViewRegistry';
import { MeterSharedState } from './MeterSharedState';
import { MetricCollector } from './MetricCollector';

/**
 * An internal record for shared meter provider states.
 */
export class MeterProviderSharedState {
  viewRegistry = new ViewRegistry();

  metricCollectors: MetricCollector[] = [];

  meterSharedStates: Map<string, MeterSharedState> = new Map();

  constructor(public resource: Resource) {}

  getMeterSharedState(instrumentationScope: InstrumentationScope) {
    const id = instrumentationScopeId(instrumentationScope);
    let meterSharedState = this.meterSharedStates.get(id);
    if (meterSharedState == null) {
      meterSharedState = new MeterSharedState(this, instrumentationScope);
      this.meterSharedStates.set(id, meterSharedState);
    }
    return meterSharedState;
  }
}
