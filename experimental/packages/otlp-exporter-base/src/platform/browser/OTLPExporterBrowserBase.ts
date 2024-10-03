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
import { OTLPExporterConfigBase, OTLPExporterError } from '../../types';
import { diag } from '@opentelemetry/api';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { IExporterTransport } from '../../exporter-transport';
import { createXhrTransport } from './xhr-transport';
import { createSendBeaconTransport } from './send-beacon-transport';
import { createRetryingTransport } from '../../retrying-transport';
import {
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
} from '../../configuration/otlp-http-configuration';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class OTLPExporterBrowserBase<
  ExportItem,
  ServiceResponse,
> extends OTLPExporterBase<OTLPExporterConfigBase, ExportItem> {
  private _serializer: ISerializer<ExportItem[], ServiceResponse>;
  private _transport: IExporterTransport;
  private _timeoutMillis: number;

  /**
   * @param config
   * @param serializer
   * @param requiredHeaders
   * @param signalResourcePath
   */
  constructor(
    config: OTLPExporterConfigBase = {},
    serializer: ISerializer<ExportItem[], ServiceResponse>,
    requiredHeaders: Record<string, string>,
    signalResourcePath: string
  ) {
    super(config);
    this._serializer = serializer;
    const useXhr =
      !!config.headers || typeof navigator.sendBeacon !== 'function';

    const actualConfig = mergeOtlpHttpConfigurationWithDefaults(
      {
        url: config.url,
        timeoutMillis: config.timeoutMillis,
        headers: config.headers,
        concurrencyLimit: config.concurrencyLimit,
      },
      {}, // no fallback for browser case
      getHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
    );

    this._timeoutMillis = actualConfig.timeoutMillis;
    this._concurrencyLimit = actualConfig.concurrencyLimit;

    if (useXhr) {
      this._transport = createRetryingTransport({
        transport: createXhrTransport({
          headers: actualConfig.headers,
          url: actualConfig.url,
        }),
      });
    } else {
      // sendBeacon has no way to signal retry, so we do not wrap it in a RetryingTransport
      this._transport = createSendBeaconTransport({
        url: actualConfig.url,
        blobType: actualConfig.headers['Content-Type'],
      });
    }
  }

  onShutdown(): void {}

  send(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }

    const data = this._serializer.serializeRequest(objects);

    if (data == null) {
      onError(new Error('Could not serialize message'));
      return;
    }

    const promise = this._transport
      .send(data, this._timeoutMillis)
      .then(response => {
        if (response.status === 'success') {
          onSuccess();
        } else if (response.status === 'failure' && response.error) {
          onError(response.error);
        } else if (response.status === 'retryable') {
          onError(new OTLPExporterError('Export failed with retryable status'));
        } else {
          onError(new OTLPExporterError('Export failed with unknown error'));
        }
      }, onError);

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }
}
