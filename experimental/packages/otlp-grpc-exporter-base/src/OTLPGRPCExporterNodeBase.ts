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
import { Metadata } from '@grpc/grpc-js';
import {
  OTLPGRPCExporterConfigNode,
  GRPCQueueItem,
  ServiceClientType,
} from './types';
import { ServiceClient } from './types';
import { getEnv, baggageUtils } from '@opentelemetry/core';
import { configureCompression, GrpcCompressionAlgorithm } from './util';
import { OTLPExporterBase, OTLPExporterError } from '@opentelemetry/otlp-exporter-base';

/**
 * OTLP Exporter abstract base class
 */
export abstract class OTLPGRPCExporterNodeBase<
  ExportItem,
  ServiceRequest
> extends OTLPExporterBase<
  OTLPGRPCExporterConfigNode,
  ExportItem,
  ServiceRequest
> {
  grpcQueue: GRPCQueueItem<ExportItem>[] = [];
  metadata?: Metadata;
  serviceClient?: ServiceClient = undefined;
  private _send!: Function;
  compression: GrpcCompressionAlgorithm;

  constructor(config: OTLPGRPCExporterConfigNode = {}) {
    super(config);
    if (config.headers) {
      diag.warn('Headers cannot be set when using grpc');
    }
    const headers = baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_HEADERS);
    this.metadata = config.metadata || new Metadata();
    for (const [k, v] of Object.entries(headers)) {
      this.metadata.set(k, v);
    }
    this.compression = configureCompression(config.compression);
  }

  private _sendPromise(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: OTLPExporterError) => void
  ): void {
    const promise = new Promise<void>((resolve, reject) => {
      this._send(this, objects, resolve, reject);
    })
      .then(onSuccess, onError);

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }

  onInit(config: OTLPGRPCExporterConfigNode): void {
    // defer to next tick and lazy load to avoid loading grpc too early
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
    onError: (error: OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }
    if (!this._send) {
      // defer to next tick and lazy load to avoid loading grpc too early
      // and making this impossible to be instrumented
      setImmediate(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { send } = require('./util');
        this._send = send;

        this._sendPromise(objects, onSuccess, onError);
      });
    } else {
      this._sendPromise(objects, onSuccess, onError);
    }
  }

  onShutdown(): void {
    if (this.serviceClient) {
      this.serviceClient.close();
    }
  }

  abstract getServiceProtoPath(): string;
  abstract getServiceClientType(): ServiceClientType;
  abstract getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string;
}
