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

import * as api from '@opentelemetry/api-metrics';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BaseObservableMetric } from './BaseObservableMetric';
import { Processor } from './export/Processor';
import { LastValue, MetricKind } from './export/types';
import { ObserverResult } from './ObserverResult';

/** This is a SDK implementation of ObservableCounter Metric. */
export class ObservableCounterMetric
  extends BaseObservableMetric
  implements api.ObservableCounter {
  constructor(
    name: string,
    options: api.MetricOptions,
    processor: Processor,
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    callback?: (observerResult: api.ObserverResult) => unknown
  ) {
    super(
      name,
      options,
      processor,
      resource,
      MetricKind.OBSERVABLE_COUNTER,
      instrumentationLibrary,
      callback
    );
  }

  protected override _processResults(observerResult: ObserverResult): void {
    observerResult.values.forEach((value, labels) => {
      const instrument = this.bind(labels);
      // ObservableCounter is monotonic which means it should only accept values
      // greater or equal then previous value
      const previous = instrument.getAggregator().toPoint();
      let previousValue = -Infinity;
      if (previous.timestamp[0] !== 0 || previous.timestamp[1] !== 0) {
        previousValue = previous.value as LastValue;
      }
      if (value >= previousValue) {
        instrument.update(value);
      }
    });
  }
}
