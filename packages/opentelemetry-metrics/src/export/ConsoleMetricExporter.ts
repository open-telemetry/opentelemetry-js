/*!
 * Copyright 2019, OpenTelemetry Authors
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

import {
  MetricExporter,
  MetricRecord,
  MetricKind,
  Sum,
  Distribution,
} from './types';
import { ExportResult } from '@opentelemetry/base';

/**
 * This is implementation of {@link MetricExporter} that prints metrics data to
 * the console. This class can be used for diagnostic purposes.
 */
export class ConsoleMetricExporter implements MetricExporter {
  export(
    metrics: MetricRecord[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const metric of metrics) {
      console.log(metric.descriptor);
      console.log(metric.labels);
      switch (metric.descriptor.metricKind) {
        case MetricKind.COUNTER:
          const sum = metric.aggregator.toPoint().value as Sum;
          console.log('value: ' + sum);
          break;
        default:
          const distribution = metric.aggregator.toPoint()
            .value as Distribution;
          console.log(
            'min: ' +
              distribution.min +
              ', max: ' +
              distribution.max +
              ', count: ' +
              distribution.count +
              ', sum: ' +
              distribution.sum
          );
          break;
      }
    }
    return resultCallback(ExportResult.SUCCESS);
  }

  shutdown(): void {
    // By default does nothing
  }
}
