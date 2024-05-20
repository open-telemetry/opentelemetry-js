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
import { OTLPExporterConfigBase, CompressionAlgorithm } from '../../types';
import * as otlpTypes from '../../types';
import { parseHeaders } from '../../util';
import { sendWithBeacon, sendWithXhr } from './util';
import { diag } from '@opentelemetry/api';
import { getEnv, baggageUtils } from '@opentelemetry/core';
import { ISerializer } from '@opentelemetry/otlp-transformer';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class OTLPExporterBrowserBase<
  ExportItem,
  ServiceResponse,
> extends OTLPExporterBase<OTLPExporterConfigBase, ExportItem> {
  protected _headers: Record<string, string>;
  private _useXHR: boolean = false;
  protected compression: CompressionAlgorithm;
  private _contentType: string;
  private _serializer: ISerializer<ExportItem[], ServiceResponse>;

  /**
   * @param config
   * @param serializer
   * @param contentType
   */
  constructor(
    config: OTLPExporterConfigBase = {},
    serializer: ISerializer<ExportItem[], ServiceResponse>,
    contentType: string
  ) {
    super(config);
    this._serializer = serializer;
    this._contentType = contentType;
    this._useXHR =
      !!config.headers || typeof navigator.sendBeacon !== 'function';
    if (this._useXHR) {
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

    this.compression = config.compression || CompressionAlgorithm.NONE;
  }

  onInit(): void {}

  onShutdown(): void {}

  send(
    items: ExportItem[],
    onSuccess: () => void,
    onError: (error: otlpTypes.OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }
    const body = this._serializer.serializeRequest(items) ?? new Uint8Array();

    const promise = new Promise<void>((resolve, reject) => {
      if (this._useXHR) {
        sendWithXhr(
          body,
          this.url,
          {
            ...this._headers,
            'Content-Type': this._contentType,
          },
          this.timeoutMillis,
          this.compression,
          resolve,
          reject
        );
      } else {
        sendWithBeacon(
          body,
          this.url,
          { type: this._contentType },
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
