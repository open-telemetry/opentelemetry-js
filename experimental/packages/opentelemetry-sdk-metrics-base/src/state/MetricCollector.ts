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

import { AggregationTemporality } from '../export/AggregationTemporality';
import { MetricData } from '../export/MetricData';
import { MetricProducer } from '../export/MetricProducer';
import { MetricReader } from '../export/MetricReader';
import { MeterProviderSharedState } from './MeterProviderSharedState';

/**
 * An internal opaque interface that the MetricReader receives as MetricProducer.
 */
export class MetricCollector implements MetricProducer {
  public aggregatorTemporality: AggregationTemporality;
  constructor(private _sharedState: MeterProviderSharedState, public metricReader: MetricReader) {
    this.aggregatorTemporality = this.metricReader.getPreferredAggregationTemporality();
  }

  async collectAllMetrics(): Promise<MetricData[]> {
    const results = await Promise.all(Array.from(this._sharedState.meters.values())
      .map(meter => meter.collectAll(this)));

    return results.reduce((cumulation, current) => cumulation.concat(current), []);
  }
}

export interface MetricCollectorHandle {
  aggregatorTemporality: AggregationTemporality;
}
