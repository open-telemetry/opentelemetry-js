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

import { OTLPExporterBase } from '../../OTLPExporterBase';
import { OTLPExporterNodeConfigBase, CompressionAlgorithm } from './types';
import * as otlpTypes from '../../types';
import { parseHeaders } from '../../util';
import { createHttpAgent, sendWithHttp, configureCompression } from './util';
import { diag } from '@opentelemetry/api';
import { getEnv, baggageUtils } from '@opentelemetry/core';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class OTLPExporterNodeBase<
  ExportItem,
  ServiceRequest
> extends OTLPExporterBase<
  OTLPExporterNodeConfigBase,
  ExportItem,
  ServiceRequest
> {
  DEFAULT_HEADERS: Record<string, string> = {};
  headers: Record<string, string>;
  agent: http.Agent | https.Agent | undefined;
  compression: CompressionAlgorithm;

  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(config);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((config as any).metadata) {
      diag.warn('Metadata cannot be set when using http');
    }
    this.headers = Object.assign(
      this.DEFAULT_HEADERS,
      parseHeaders(config.headers),
      baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_HEADERS)
    );
    this.agent = createHttpAgent(config);
    this.compression = configureCompression(config.compression);
  }

  onInit(_config: OTLPExporterNodeConfigBase): void {}

  send(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: otlpTypes.OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }
    const serviceRequest = this.convert(objects);

    const promise = new Promise<void>((resolve, reject) => {
      sendWithHttp(
        this,
        JSON.stringify(serviceRequest),
        'application/json',
        resolve,
        reject
      );
    })
      .then(onSuccess, onError);

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }

  onShutdown(): void {}
}
