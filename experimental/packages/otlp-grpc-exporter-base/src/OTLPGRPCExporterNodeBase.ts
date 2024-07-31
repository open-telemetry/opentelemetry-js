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
import { GRPCQueueItem, OTLPGRPCExporterConfigNode } from './types';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import {
  CompressionAlgorithm,
  OTLPExporterBase,
  OTLPExporterError,
} from '@opentelemetry/otlp-exporter-base';
import {
  createEmptyMetadata,
  GrpcExporterTransport,
} from './grpc-exporter-transport';
import { configureCompression, configureCredentials } from './util';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { IExporterTransport } from '@opentelemetry/otlp-exporter-base';

/**
 * OTLP Exporter abstract base class
 */
export abstract class OTLPGRPCExporterNodeBase<
  ExportItem,
  ServiceResponse,
> extends OTLPExporterBase<OTLPGRPCExporterConfigNode, ExportItem> {
  grpcQueue: GRPCQueueItem<ExportItem>[] = [];
  compression: CompressionAlgorithm;
  private _transport: IExporterTransport;
  private _serializer: ISerializer<ExportItem[], ServiceResponse>;

  constructor(
    config: OTLPGRPCExporterConfigNode = {},
    signalSpecificMetadata: Record<string, string>,
    grpcName: string,
    grpcPath: string,
    serializer: ISerializer<ExportItem[], ServiceResponse>
  ) {
    super(config);
    this._serializer = serializer;
    if (config.headers) {
      diag.warn('Headers cannot be set when using grpc');
    }
    const nonSignalSpecificMetadata = baggageUtils.parseKeyPairsIntoRecord(
      getEnv().OTEL_EXPORTER_OTLP_HEADERS
    );
    const rawMetadata = Object.assign(
      {},
      nonSignalSpecificMetadata,
      signalSpecificMetadata
    );

    let credentialProvider = () => {
      return configureCredentials(undefined, this.getUrlFromConfig(config));
    };

    if (config.credentials != null) {
      const credentials = config.credentials;
      credentialProvider = () => {
        return credentials;
      };
    }

    // Ensure we don't modify the original.
    const configMetadata = config.metadata?.clone();
    const metadataProvider = () => {
      const metadata = configMetadata ?? createEmptyMetadata();
      for (const [key, value] of Object.entries(rawMetadata)) {
        // only override with env var data if the key has no values.
        // not using Metadata.merge() as it will keep both values.
        if (metadata.get(key).length < 1) {
          metadata.set(key, value);
        }
      }

      return metadata;
    };

    this.compression = configureCompression(config.compression);
    this._transport = new GrpcExporterTransport({
      address: this.getDefaultUrl(config),
      compression: this.compression,
      credentials: credentialProvider,
      grpcName: grpcName,
      grpcPath: grpcPath,
      metadata: metadataProvider,
      timeoutMillis: this.timeoutMillis,
    });
  }

  onInit() {
    // Intentionally left empty; nothing to do.
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

    const promise = this._transport.send(data).then(response => {
      if (response.status === 'success') {
        onSuccess();
        return;
      }
      if (response.status === 'failure' && response.error) {
        onError(response.error);
      }
      onError(new OTLPExporterError('Export failed with unknown error'));
    }, onError);

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }

  abstract getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string;
}
