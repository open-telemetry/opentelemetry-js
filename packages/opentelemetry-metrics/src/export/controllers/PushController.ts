/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { ConsoleLogger, ExportResult, unrefTimer } from '@opentelemetry/core';
import * as api from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { Meter } from '../../';
import { DEFAULT_CONFIG, MeterConfig } from '../../types';
import { PushControllerConfig } from './types';
import { NoopExporter } from '../NoopExporter';
import { UngroupedBatcher } from '../Batcher';
import { Controller } from '../Controller';

const DEFAULT_EXPORT_INTERVAL = 60_000;

/**
 * This class represents a meter provider collecting metric instrument values periodically.
 */
export class PushController extends Controller implements api.MeterProvider {
  private _timer: NodeJS.Timeout;

  readonly resource: Resource = Resource.createTelemetrySDKResource();
  readonly logger: api.Logger;

  constructor(private _config: PushControllerConfig = DEFAULT_CONFIG) {
    super(
      _config.batcher ?? new UngroupedBatcher(),
      _config.exporter ?? new NoopExporter()
    );
    this.logger = _config.logger ?? new ConsoleLogger(_config.logLevel);

    this._timer = setInterval(() => {
      this.collect();
    }, _config.interval ?? DEFAULT_EXPORT_INTERVAL);
    unrefTimer(this._timer);
  }

  /**
   * Returns a Meter, creating one if one with the given name and version is not already created
   *
   * @returns Meter A Meter with the given name and version
   */
  getMeter(name: string, version = '*', config?: MeterConfig): Meter {
    const key = `${name}@${version}`;
    if (!this._meters.has(key)) {
      this._meters.set(key, new Meter(config || this._config));
    }

    return this._meters.get(key)!;
  }

  /**
   * @implements Controller.onExportResult
   */
  protected onExportResult(result: ExportResult): void {
    if (result !== ExportResult.SUCCESS) {
      // @todo: log error
    }
  }
}
