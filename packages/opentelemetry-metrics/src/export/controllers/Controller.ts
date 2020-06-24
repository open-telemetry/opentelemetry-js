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

import { Logger } from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/core';
import { Meter } from '../../Meter';
import { MetricExporter } from '../types';
import { Batcher } from '../Batcher';

export abstract class Controller {
  protected readonly _meters: Map<string, Meter> = new Map();

  constructor(
    protected readonly _batcher: Batcher,
    protected readonly _exporter: MetricExporter,
    protected readonly _logger: Logger
  ) {}

  collect() {
    for (const meter of this._meters.values()) {
      meter.collect();
    }
    this._exporter.export(this._batcher.checkPointSet(), result => {
      // TODO: retry strategy
      if (result !== ExportResult.SUCCESS) {
        this._logger.error(
          'Metric exporter reported non success result(%s).',
          result
        );
      }
    });
  }
}
