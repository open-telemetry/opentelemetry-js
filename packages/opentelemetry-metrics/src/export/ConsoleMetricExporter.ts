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

import {
  MetricExporter,
  MetricRecord,
  Distribution,
  Histogram,
  ExportPipelineInstaller,
} from './types';
import * as api from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/core';
import { PushControllerConfig, PushController } from './controllers';
import { MeterProvider } from '..';
import { MeterConfig } from '../types';

/**
 * This is implementation of {@link MetricExporter} that prints metrics data to
 * the console. This class can be used for diagnostic purposes.
 */
export class ConsoleMetricExporter
  implements MetricExporter, ExportPipelineInstaller {
  /**
   * Install console export pipeline to global metrics api.
   * @param meterConfig Default meter configuration
   * @param pushConfig push controller configuration
   */
  installExportPipeline(
    pushConfig?: PushControllerConfig,
    meterConfig?: MeterConfig
  ) {
    const meterProvider = new MeterProvider({ ...meterConfig, exporter: this });
    const controller = new PushController(meterProvider, pushConfig);
    api.metrics.setGlobalMeterProvider(meterProvider);
    return { controller, meterProvider };
  }

  export(
    metrics: MetricRecord[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const metric of metrics) {
      console.log(metric.descriptor);
      console.log(metric.labels);
      const point = metric.aggregator.toPoint();
      if (typeof point.value === 'number') {
        console.log('value: ' + point.value);
      } else if (typeof (point.value as Histogram).buckets === 'object') {
        const histogram = point.value as Histogram;
        console.log(
          `count: ${histogram.count}, sum: ${histogram.sum}, buckets: ${histogram.buckets}`
        );
      } else {
        const distribution = point.value as Distribution;
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
      }
    }
    return resultCallback(ExportResult.SUCCESS);
  }

  shutdown(): void {
    // By default does nothing
  }
}
