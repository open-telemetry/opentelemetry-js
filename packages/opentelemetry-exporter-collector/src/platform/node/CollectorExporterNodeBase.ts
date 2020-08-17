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

import { Metadata } from 'grpc';
import { CollectorExporterBase } from '../../CollectorExporterBase';
import { ServiceClientType } from '../../types';
import { CollectorExporterConfigNode, GRPCQueueItem } from './types';
import { ServiceClient } from './types';
import { CollectorProtocolNode } from '../../enums';
import * as collectorTypes from '../../types';
import { parseHeaders } from '../../util';
import { initWithJson, sendWithJson } from './utilWithJson';
import { initWithGrpc, sendWithGrpc } from './utilWithGrpc';
import { initWithJsonProto, sendWithJsonProto } from './utilWithJsonProto';

const DEFAULT_SERVICE_NAME = 'collector-metric-exporter';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class CollectorExporterNodeBase<
  ExportItem,
  ServiceRequest
> extends CollectorExporterBase<
  CollectorExporterConfigNode,
  ExportItem,
  ServiceRequest
> {
  DEFAULT_HEADERS: Record<string, string> = {
    [collectorTypes.OT_REQUEST_HEADER]: '1',
  };
  grpcQueue: GRPCQueueItem<ExportItem>[] = [];
  metadata?: Metadata;
  serviceClient?: ServiceClient = undefined;
  headers: Record<string, string>;
  protected readonly _protocol: CollectorProtocolNode;

  constructor(config: CollectorExporterConfigNode = {}) {
    super(config);
    this._protocol =
      typeof config.protocolNode !== 'undefined'
        ? config.protocolNode
        : CollectorProtocolNode.GRPC;
    if (this._protocol === CollectorProtocolNode.GRPC) {
      this.logger.debug('CollectorExporter - using grpc');
      if (config.headers) {
        this.logger.warn('Headers cannot be set when using grpc');
      }
    } else {
      if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
        this.logger.debug('CollectorExporter - using json over http');
      } else {
        this.logger.debug('CollectorExporter - using proto over http');
      }
      if (config.metadata) {
        this.logger.warn('Metadata cannot be set when using http');
      }
    }
    this.headers =
      parseHeaders(config.headers, this.logger) || this.DEFAULT_HEADERS;
    this.metadata = config.metadata;
  }

  onInit(config: CollectorExporterConfigNode): void {
    this._isShutdown = false;

    if (config.protocolNode === CollectorProtocolNode.HTTP_JSON) {
      initWithJson(this, config);
    } else if (config.protocolNode === CollectorProtocolNode.HTTP_PROTO) {
      initWithJsonProto(this, config);
    } else {
      initWithGrpc(this, config);
    }
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
    if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
      sendWithJson(this, objects, onSuccess, onError);
    } else if (this._protocol === CollectorProtocolNode.HTTP_PROTO) {
      sendWithJsonProto(this, objects, onSuccess, onError);
    } else {
      sendWithGrpc(this, objects, onSuccess, onError);
    }
  }

  onShutdown(): void {
    this._isShutdown = true;
    if (this.serviceClient) {
      this.serviceClient.close();
    }
  }

  getDefaultServiceName(config: CollectorExporterConfigNode): string {
    return config.serviceName || DEFAULT_SERVICE_NAME;
  }

  abstract getServiceProtoPath(): string;
  abstract getServiceClientType(): ServiceClientType;
}
