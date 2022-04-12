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

import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { AggregationTemporality, PushMetricExporter, ResourceMetrics } from '../../src';

export class TestMetricExporter implements PushMetricExporter {
  resourceMetricsList: ResourceMetrics[] = [];
  export(resourceMetrics: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
    this.resourceMetricsList.push(resourceMetrics);
    process.nextTick(() => resultCallback({ code: ExportResultCode.SUCCESS }));
  }

  async forceFlush(): Promise<void> {}
  async shutdown(): Promise<void> {}

  getPreferredAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE;
  }
}

export class TestDeltaMetricExporter extends TestMetricExporter {
  override getPreferredAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.DELTA;
  }
}
