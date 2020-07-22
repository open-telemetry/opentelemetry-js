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

import { unrefTimer, ExportResult, NoopLogger } from '@opentelemetry/core';
import { PushControllerConfig } from './types';
import { MetricsCollector } from '../../types';
import { Logger } from '@opentelemetry/api';
import { MetricExporter } from '../types';
import { NoopExporter } from '../NoopExporter';

const DEFAULT_EXPORT_INTERVAL = 60_000;

/**
 * This class represents a {@link Controller} collecting metric instrument
 * values periodically.
 *
 * The PushController can be installed as the global Meter provider.
 */
export class PushController {
  private _timer?: NodeJS.Timeout;
  private _logger: Logger;
  private _interval: number;
  private _exporter: MetricExporter;
  private _shutdown = false;

  constructor(config?: PushControllerConfig) {
    this._logger = config?.logger ?? new NoopLogger();
    this._interval = config?.interval ?? DEFAULT_EXPORT_INTERVAL;
    this._exporter = config?.exporter ?? new NoopExporter();
  }

  registerMetricsCollector(metricCollector: MetricsCollector) {
    if (this._shutdown) {
      throw new Error(
        'A shutdown PushController been registered with new MetricController.'
      );
    }
    if (this._timer) {
      clearInterval(this._timer);
    }

    this._timer = setInterval(async () => {
      try {
        const metricRecords = await metricCollector.collect();
        const result = await new Promise(resolve => {
          this._exporter.export(metricRecords, result => {
            resolve(result);
          });
        });
        if (result !== ExportResult.SUCCESS) {
          // TODO: retry strategy
          this._logger.error(
            'Metric exporter reported non success result(%s).',
            result
          );
        }
      } catch (e) {
        this._logger.error('Metric collection rejected with error: %s', e);
      }
    }, this._interval);
    unrefTimer(this._timer);
  }

  shutdown() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = undefined;
    }
    this._exporter.shutdown();
    this._shutdown = true;
  }
}
