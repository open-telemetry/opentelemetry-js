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

import { ConsoleLogger } from '@opentelemetry/core';
import * as api from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { Meter } from '.';
import { DEFAULT_CONFIG, MeterConfig } from './types';

/**
 * This class represents a meter provider which platform libraries can extend
 */
export class MeterProvider implements api.MeterProvider {
  private readonly _config: MeterConfig;
  private readonly _meters: Map<string, Meter> = new Map();
  readonly resource: Resource;
  readonly logger: api.Logger;

  constructor(config: MeterConfig = DEFAULT_CONFIG) {
    this.logger = config.logger ?? new ConsoleLogger(config.logLevel);
    this.resource = config.resource ?? Resource.createTelemetrySDKResource();
    this._config = Object.assign({}, config, {
      logger: this.logger,
      resource: this.resource,
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
        new Meter({ name, version }, config || this._config)
      );
    }

    return this._meters.get(key)!;
  }
}
