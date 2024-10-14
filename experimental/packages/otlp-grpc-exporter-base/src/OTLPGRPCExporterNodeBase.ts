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

import { diag } from '@opentelemetry/api';
import { OTLPGRPCExporterConfigNode } from './types';
import {
  OTLPExporterBase,
  OTLPExporterError,
} from '@opentelemetry/otlp-exporter-base';
import {
  createEmptyMetadata,
  GrpcExporterTransport,
} from './grpc-exporter-transport';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { IExporterTransport } from '@opentelemetry/otlp-exporter-base';
import {
  getOtlpGrpcDefaultConfiguration,
  mergeOtlpGrpcConfigurationWithDefaults,
} from './configuration/otlp-grpc-configuration';
import { getOtlpGrpcConfigurationFromEnv } from './configuration/otlp-grpc-env-configuration';

/**
 * OTLP Exporter abstract base class
 */
export abstract class OTLPGRPCExporterNodeBase<
  ExportItem,
  ServiceResponse,
> extends OTLPExporterBase<OTLPGRPCExporterConfigNode, ExportItem> {
  private _transport: IExporterTransport;
  private _serializer: ISerializer<ExportItem[], ServiceResponse>;
  private _timeoutMillis: number;

  constructor(
    config: OTLPGRPCExporterConfigNode = {},
    serializer: ISerializer<ExportItem[], ServiceResponse>,
    grpcName: string,
    grpcPath: string,
    signalIdentifier: string
  ) {
    super(config);
    // keep credentials locally in case user updates the reference on the config object
    const userProvidedCredentials = config.credentials;
    const actualConfig = mergeOtlpGrpcConfigurationWithDefaults(
      {
        url: config.url,
        metadata: () => {
          // metadata resolution strategy is merge, so we can return empty here, and it will not override the rest of the settings.
          return config.metadata ?? createEmptyMetadata();
        },
        compression: config.compression,
        timeoutMillis: config.timeoutMillis,
        concurrencyLimit: config.concurrencyLimit,
        credentials:
          userProvidedCredentials != null
            ? () => userProvidedCredentials
            : undefined,
      },
      getOtlpGrpcConfigurationFromEnv(signalIdentifier),
      getOtlpGrpcDefaultConfiguration()
    );
    this._serializer = serializer;
    this._timeoutMillis = actualConfig.timeoutMillis;
    this._concurrencyLimit = actualConfig.concurrencyLimit;
    if (config.headers) {
      diag.warn('Headers cannot be set when using grpc');
    }

    this._transport = new GrpcExporterTransport({
      address: actualConfig.url,
      compression: actualConfig.compression,
      credentials: actualConfig.credentials,
      grpcName: grpcName,
      grpcPath: grpcPath,
      metadata: actualConfig.metadata,
    });
  }

  override onShutdown() {
    this._transport.shutdown();
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
}
