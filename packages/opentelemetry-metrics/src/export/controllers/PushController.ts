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
import { MeterProvider } from '../../MeterProvider';

const DEFAULT_EXPORT_INTERVAL = 60_000;

/**
 * This class represents a {@link Controller} collecting metric instrument
 * values periodically.
 *
 * The PushController can be installed as the global Meter provider.
 */
export class PushController {
  private _timer: NodeJS.Timeout;

  constructor(meterProvider: MeterProvider, config?: PushControllerConfig) {
    const logger = config?.logger ?? new NoopLogger();
    const onPushed = config?.onPushed;
    this._timer = setInterval(async () => {
      try {
        const result = await meterProvider.collect();
        if (result !== ExportResult.SUCCESS) {
          // TODO: retry strategy
          logger.error(
            'Metric exporter reported non success result(%s).',
            result
          );
        }
      } catch (e) {
        logger.error('Metric collection rejected with error: %s', e);
      }
      onPushed?.();
    }, config?.interval ?? DEFAULT_EXPORT_INTERVAL);
    unrefTimer(this._timer);
  }

  shutdown() {
    clearInterval(this._timer);
  }
}
