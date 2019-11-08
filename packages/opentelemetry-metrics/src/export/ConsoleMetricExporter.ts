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

import { MetricExporter, ReadableMetric } from './types';
import { ExportResult } from '@opentelemetry/base';

/**
 * This is implementation of {@link MetricExporter} that prints metrics data to
 * the console. This class can be used for diagnostic purposes.
 */
export class ConsoleMetricExporter implements MetricExporter {
  export(
    metrics: ReadableMetric[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const metric of metrics) {
      const descriptor = metric.descriptor;
      const timeseries = metric.timeseries;
      console.log({
        name: descriptor.name,
        description: descriptor.description,
      });

      for (const ts of timeseries) {
        const labels = descriptor.labelKeys
          .map((k, i) => [k, ts.labelValues[i]])
          .reduce(
            (p, c) => ({
              ...p,
              [c[0] as string]: typeof c[1] === 'string' ? c[1] : c[1].value,
            }),
            {}
          );
        for (const point of ts.points) {
          console.log({ labels, value: point.value });
        }
      }
    }
    return resultCallback(ExportResult.SUCCESS);
  }

  shutdown(): void {
    // By default does nothing
  }
}
