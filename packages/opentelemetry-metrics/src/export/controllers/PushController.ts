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

import * as api from '@opentelemetry/api';
import { unrefTimer, ConsoleLogger } from '@opentelemetry/core';
import { DEFAULT_CONFIG, MeterConfig } from '../../types';
import { PushControllerConfig } from './types';
import { Controller } from './Controller';
import { UngroupedBatcher } from '../Batcher';
import { NoopExporter } from '../NoopExporter';
import { Resource } from '@opentelemetry/resources';
import { Meter } from '../..';

const DEFAULT_EXPORT_INTERVAL = 60_000;

/**
 * This class represents a controller collecting metric instrument values
 * periodically.
 */
export class PushController extends Controller implements api.MeterProvider {
  readonly resource: Resource;
  private _timer: NodeJS.Timeout;

  constructor(private readonly _config: PushControllerConfig = DEFAULT_CONFIG) {
    super(
      _config.batcher ?? new UngroupedBatcher(),
      _config.exporter ?? new NoopExporter(),
      _config.logger ?? new ConsoleLogger(_config.logLevel)
    );
    this.resource = _config.resource ?? Resource.createTelemetrySDKResource();

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
      this._meters.set(
        key,
        new Meter(
          { name, version },
          {
            batcher: this._batcher,
            exporter: this._exporter,
            logger: this._logger,
            resource: this.resource,
            ...this._config,
            ...config,
          }
        )
      );
    }

    return this._meters.get(key)!;
  }
}
