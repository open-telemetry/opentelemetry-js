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

import { unrefTimer } from '@opentelemetry/core';
import { DEFAULT_CONFIG } from '../../types';
import { PushControllerConfig } from './types';
import { PullController } from './PullController';

const DEFAULT_EXPORT_INTERVAL = 60_000;

/**
 * This class represents a controller collecting metric instrument values
 * periodically.
 */
export class PushController extends PullController {
  private _timer: NodeJS.Timeout;

  constructor(_config: PushControllerConfig = DEFAULT_CONFIG) {
    super(_config);

    this._timer = setInterval(() => {
      this.collect();
    }, _config.interval ?? DEFAULT_EXPORT_INTERVAL);
    unrefTimer(this._timer);
  }
}
