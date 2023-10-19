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

import { OTLPExporterBase } from '../../OTLPExporterBase';
import { OTLPExporterConfigBase } from '../../types';
import * as otlpTypes from '../../types';
import { parseHeaders } from '../../util';
import { sendWithBeacon, sendWithFetch, sendWithXhr } from './util';
import { diag } from '@opentelemetry/api';
import { getEnv, baggageUtils, _globalThis } from '@opentelemetry/core';

enum SendMethod {
  beacon = 1,
  xhr = 2,
  fetch = 3,
}

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class OTLPExporterBrowserBase<
  ExportItem,
  ServiceRequest,
> extends OTLPExporterBase<OTLPExporterConfigBase, ExportItem, ServiceRequest> {
  protected _headers: Record<string, string>;
  private sendMethod: SendMethod;

  /**
   * @param config
   */
  constructor(config: OTLPExporterConfigBase = {}) {
    super(config);
    if (!config.headers && typeof navigator.sendBeacon === 'function') {
      this.sendMethod = SendMethod.beacon
    } else if (typeof XMLHttpRequest === 'function') {
      this.sendMethod = SendMethod.xhr
    } else {
      this.sendMethod = SendMethod.fetch;
    }
    if (this.sendMethod !== SendMethod.beacon) {
      this._headers = Object.assign(
        {},
        parseHeaders(config.headers),
        baggageUtils.parseKeyPairsIntoRecord(
          getEnv().OTEL_EXPORTER_OTLP_HEADERS
        )
      );
    } else {
      this._headers = {};
    }
  }

  onInit(): void {
    _globalThis.addEventListener('unload', this.shutdown);
  }

  onShutdown(): void {
    _globalThis.removeEventListener('unload', this.shutdown);
  }

  send(
    items: ExportItem[],
    onSuccess: () => void,
    onError: (error: otlpTypes.OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }
    const serviceRequest = this.convert(items);
    const body = JSON.stringify(serviceRequest);

    const promise = new Promise<void>((resolve, reject) => {
      if (this.sendMethod === SendMethod.xhr) {
        sendWithXhr(
          body,
          this.url,
          this._headers,
          this.timeoutMillis,
          resolve,
          reject
        );
      } else if (this.sendMethod === SendMethod.fetch) {
        sendWithFetch(
          body,
          this.url,
          this._headers,
          this.timeoutMillis,
          resolve,
          reject
        );
      } else if (this.sendMethod === SendMethod.beacon) {
        sendWithBeacon(
          body,
          this.url,
          { type: 'application/json' },
          resolve,
          reject
        );
      }
    }).then(onSuccess, onError);

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }
}
