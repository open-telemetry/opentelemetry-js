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
import { OTLPExporterNodeConfigBase } from './types';
import { diag } from '@opentelemetry/api';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { IExporterTransport } from '../../exporter-transport';
import { createHttpExporterTransport } from './http-exporter-transport';
import { OTLPExporterError } from '../../types';
import { createRetryingTransport } from '../../retrying-transport';
import { convertLegacyAgentOptions } from './convert-legacy-agent-options';
import {
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
} from '../../configuration/otlp-http-configuration';
import { getHttpConfigurationFromEnvironment } from '../../configuration/otlp-http-env-configuration';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class OTLPExporterNodeBase<
  ExportItem,
  ServiceResponse,
> extends OTLPExporterBase<OTLPExporterNodeConfigBase, ExportItem> {
  private _serializer: ISerializer<ExportItem[], ServiceResponse>;
  private _transport: IExporterTransport;
  private _timeoutMillis: number;

  constructor(
    config: OTLPExporterNodeConfigBase = {},
    serializer: ISerializer<ExportItem[], ServiceResponse>,
    requiredHeaders: Record<string, string>,
    signalIdentifier: string,
    signalResourcePath: string
  ) {
    super(config);
    const actualConfig = mergeOtlpHttpConfigurationWithDefaults(
      {
        url: config.url,
        headers: config.headers,
        concurrencyLimit: config.concurrencyLimit,
        timeoutMillis: config.timeoutMillis,
        compression: config.compression,
      },
      getHttpConfigurationFromEnvironment(signalIdentifier, signalResourcePath),
      getHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
    );

    this._timeoutMillis = actualConfig.timeoutMillis;
    this._concurrencyLimit = actualConfig.concurrencyLimit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((config as any).metadata) {
      diag.warn('Metadata cannot be set when using http');
    }
    this._serializer = serializer;

    this._transport = createRetryingTransport({
      transport: createHttpExporterTransport({
        agentOptions: convertLegacyAgentOptions(config),
        compression: actualConfig.compression,
        headers: actualConfig.headers,
        url: actualConfig.url,
      }),
    });
  }

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

  onShutdown(): void {}
}
