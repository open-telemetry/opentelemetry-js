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
import { DEFAULT_CONFIG } from '../../types';
import { PushControllerConfig } from './types';
import { Controller } from './Controller';
import { UngroupedBatcher } from '../Batcher';
import { NoopExporter } from '../NoopExporter';
import { Resource } from '@opentelemetry/resources';

const DEFAULT_EXPORT_INTERVAL = 60_000;

/**
 * This class represents a {@link Controller} collecting metric instrument
 * values periodically.
 *
 * The PushController can be installed as the global Meter provider.
 */
export class PushController extends Controller implements api.MeterProvider {
  private _timer: NodeJS.Timeout;

  constructor(_config: PushControllerConfig = DEFAULT_CONFIG) {
    super(
      _config.batcher ?? new UngroupedBatcher(),
      _config.exporter ?? new NoopExporter(),
      _config.logger ?? new ConsoleLogger(_config.logLevel),
      _config.resource ?? Resource.createTelemetrySDKResource()
    );
    const onPushed = _config?.onPushed;
    this._timer = setInterval(() => {
      const promise = this.collect();
      if (onPushed) {
        promise.then(() => onPushed());
      }
    }, _config.interval ?? DEFAULT_EXPORT_INTERVAL);
    unrefTimer(this._timer);
  }
}
