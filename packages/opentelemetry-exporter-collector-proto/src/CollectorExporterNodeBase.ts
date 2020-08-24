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
  CollectorExporterNodeBase as CollectorExporterBaseMain,
  collectorTypes,
} from '@opentelemetry/exporter-collector';
import { ServiceClientType } from './types';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class CollectorExporterNodeBase<
  ExportItem,
  ServiceRequest
> extends CollectorExporterBaseMain<ExportItem, ServiceRequest> {
  private _send!: Function;
  onInit(config: collectorTypes.CollectorExporterConfigBase): void {
    this._isShutdown = false;
    // defer to next tick and lazy load to avoid loading protobufjs too early
    // and making this impossible to be instrumented
    setImmediate(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { onInit } = require('./util');
      onInit(this, config);
    });
  }

  send(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void {
    if (this._isShutdown) {
      this.logger.debug('Shutdown already started. Cannot send objects');
      return;
    }
    if (!this._send) {
      // defer to next tick and lazy load to avoid loading protobufjs too early
      // and making this impossible to be instrumented
      setImmediate(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { send } = require('./util');
        this._send = send;
        this._send(this, objects, onSuccess, onError);
      });
    } else {
      this._send(this, objects, onSuccess, onError);
    }
  }

  abstract getServiceClientType(): ServiceClientType;
}
