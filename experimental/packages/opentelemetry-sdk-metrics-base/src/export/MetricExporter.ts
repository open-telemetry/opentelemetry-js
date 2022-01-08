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

import { AggregationTemporality } from './AggregationTemporality';
import { MetricData } from './MetricData';
import {
  ExportResult,
  ExportResultCode,
} from '@opentelemetry/core';


// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#metricexporter

export abstract class PushMetricExporter {
  protected _shutdown = false;

  abstract export(batch: MetricData[]): Promise<ExportResult>;

  abstract forceFlush(): Promise<void>;

  abstract getPreferredAggregationTemporality(): AggregationTemporality;

  abstract shutdown(): Promise<void>;

  isShutdown() {
    return this._shutdown;
  }
}

export class ConsoleMetricExporter extends PushMetricExporter {
  async export(_batch: MetricData[]) {
    return new Promise<ExportResult>((_, reject) => {
      reject({
        code: ExportResultCode.FAILED,
        error: new Error('Method not implemented')
      });
    });
  }

  getPreferredAggregationTemporality() {
    return AggregationTemporality.CUMULATIVE;
  }

  // nothing to do
  async forceFlush() {}

  async shutdown() {
    this._shutdown = true;
  }
}
