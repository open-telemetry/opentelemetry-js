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
import { MetricExporter, MetricRecord, Controller } from '../src';
import { ExportResult } from '@opentelemetry/core';
import { MetricsCollector } from '../src/types';

export class TestExporter implements MetricExporter {
  private resolveNextExportListener?: (records: MetricRecord[]) => void;

  export(records: MetricRecord[], callback: (result: ExportResult) => void) {
    callback(ExportResult.SUCCESS);
    this.resolveNextExportListener?.(records);
  }
  shutdown() {}

  onNextExport(): Promise<MetricRecord[]> {
    return new Promise(resolve => {
      this.resolveNextExportListener = resolve;
    });
  }
}

export class TestController implements Controller {
  public collector?: MetricsCollector;
  registerMetricsCollector(collector: MetricsCollector) {
    this.collector = collector;
  }

  collect(): Promise<MetricRecord[]> {
    if (this.collector === undefined) {
      throw new Error('expect the controller to be registered with a MetricsCollector');
    }
    return this.collector.collect()
  }
}
