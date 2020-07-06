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

import { Logger, MeterProvider } from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/core';
import { Meter } from '../../Meter';
import { MetricExporter } from '../types';
import { Batcher } from '../Batcher';
import { Resource } from '@opentelemetry/resources';
import { MeterConfig } from '../../types';

/**
 * Controller is not only a api.MeterProvider per se. An controller
 * orchestrates the export pipeline. For example, a "push" controller will
 * establish a periodic timer to regularly collect and export metrics. A
 * "pull" controller will await a pull request before initiating metric
 * collection. Either way, the job of the controller is to call the SDK
 * `collect()` method, then read the checkpoint, then invoke the exporters.
 * Controllers are expected to implement the public api.MeterProvider
 * API, meaning they can be installed as the global Meter provider.
 */
export class Controller implements MeterProvider {
  protected readonly _meters: Map<string, Meter> = new Map();

  constructor(
    protected readonly _batcher: Batcher,
    protected readonly _exporter: MetricExporter,
    protected readonly _logger: Logger,
    readonly resource: Resource
  ) {}

  async collect() {
    await Promise.all(
      Array.from(this._meters.values()).map(meter => meter.collect())
    );
    return new Promise(resolve => {
      this._exporter.export(this._batcher.checkPointSet(), result => {
        // TODO: retry strategy
        if (result !== ExportResult.SUCCESS) {
          this._logger.error(
            'Metric exporter reported non success result(%s).',
            result
          );
        }
        resolve();
      });
    });
  }

  /**
   * Returns a Meter, creating one if one with the given name and version is not already created
   *
   * @returns Meter A Meter with the given name and version
   */
  getMeter(name: string, version = '*', config?: MeterConfig): Meter {
    const key = `${name}@${version}`;
    if (!this._meters.has(key)) {
      this._meters.set(
        key,
        new Meter(
          { name, version },
          {
            batcher: this._batcher,
            exporter: this._exporter,
            logger: this._logger,
            resource: this.resource,
            ...config,
          }
        )
      );
    }

    return this._meters.get(key)!;
  }
}
