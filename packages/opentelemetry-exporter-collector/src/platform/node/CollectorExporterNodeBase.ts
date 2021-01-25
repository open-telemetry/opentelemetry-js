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

import type * as http from 'http';
import type * as https from 'https';

import { CollectorExporterBase } from '../../CollectorExporterBase';
import { CollectorExporterNodeConfigBase } from './types';
import * as collectorTypes from '../../types';
import { parseHeaders } from '../../util';
import { createHttpAgent, sendWithHttp } from './util';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class CollectorExporterNodeBase<
  ExportItem,
  ServiceRequest
> extends CollectorExporterBase<
  CollectorExporterNodeConfigBase,
  ExportItem,
  ServiceRequest
> {
  DEFAULT_HEADERS: Record<string, string> = {};
  headers: Record<string, string>;
  agent: http.Agent | https.Agent | undefined;
  constructor(config: CollectorExporterNodeConfigBase = {}) {
    super(config);
    if ((config as any).metadata) {
      this.logger.warn('Metadata cannot be set when using http');
    }
    this.headers =
      parseHeaders(config.headers, this.logger) || this.DEFAULT_HEADERS;
    this.agent = createHttpAgent(this.logger, config);
  }

  onInit(_config: CollectorExporterNodeConfigBase): void {
    this._isShutdown = false;
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
    const serviceRequest = this.convert(objects);

    const promise = new Promise(resolve => {
      const _onSuccess = (): void => {
        onSuccess();
        _onFinish();
      };
      const _onError = (error: collectorTypes.CollectorExporterError): void => {
        onError(error);
        _onFinish();
      };
      const _onFinish = () => {
        resolve();
        const index = this._sendingPromises.indexOf(promise);
        this._sendingPromises.splice(index, 1);
      };
      sendWithHttp(
        this,
        JSON.stringify(serviceRequest),
        'application/json',
        _onSuccess,
        _onError
      );
    });

    this._sendingPromises.push(promise);
  }

  onShutdown(): void {}
}
