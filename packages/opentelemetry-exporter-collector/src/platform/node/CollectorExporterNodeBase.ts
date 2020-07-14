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

import { CollectorExporterBase } from '../../CollectorExporterBase';
import { CollectorExporterConfigNode, GRPCQueueItem } from './types';
import { ServiceClient } from './types';
import * as grpc from 'grpc';
import { CollectorProtocolNode } from '../../enums';
import * as collectorTypes from '../../types';
import { parseHeaders } from '../../util';
import * as url from 'url';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { removeProtocol } from './util';
import * as protoLoader from '@grpc/proto-loader';

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
  grpcQueue: GRPCQueueItem<ExportItem>[];
  serviceClient?: ServiceClient = undefined;
  credentials: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
  headers: Record<string, string>;
  protected readonly _protocol: CollectorProtocolNode;

  constructor(config: CollectorExporterConfigNode = {}) {
    super(config);
    this._protocol =
      typeof config.protocolNode !== 'undefined'
        ? config.protocolNode
        : CollectorProtocolNode.GRPC;
    if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
      this.logger.debug('CollectorExporter - using json over http');
      if (config.metadata) {
        this.logger.warn('Metadata cannot be set when using json');
      }
    } else {
      this.logger.debug('CollectorExporter - using grpc');
      if (config.headers) {
        this.logger.warn('Headers cannot be set when using grpc');
      }
    }
    this.grpcQueue = [];
    this.credentials = config.credentials || grpc.credentials.createInsecure();
    this.metadata = config.metadata;
    this.headers =
      parseHeaders(config.headers, this.logger) || this.DEFAULT_HEADERS;
  }

  onInit(config: CollectorExporterConfigNode): void {
    this._isShutdown = false;
    if (config.protocolNode === CollectorProtocolNode.HTTP_JSON) {
      this.initWithJson();
    } else {
      this.initWithGrpc();
    }
  }

  send(
    spans: ExportItem[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void {
    if (this._isShutdown) {
      this.logger.debug('Shutdown already started. Cannot send spans');
      return;
    }
    if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
      this.sendWithJson(spans, onSuccess, onError);
    } else {
      this.sendWithGrpc(spans, onSuccess, onError);
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

  protected initWithJson(): void {
    // Nothing to be done for JSON yet
  }

  /**
   * Initialize
   */
  protected initWithGrpc(): void {
    const serverAddress = removeProtocol(this.url);
    const includeDirs = [path.resolve(__dirname, 'protos')];

    protoLoader
      .load(this.getServiceProtoPath(), {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs,
      })
      .then(packageDefinition => {
        const packageObject: any = grpc.loadPackageDefinition(
          packageDefinition
        );
        this.serviceClient = this.getServiceClient(
          packageObject,
          serverAddress
        );
        if (this.grpcQueue.length > 0) {
          const queue = this.grpcQueue.splice(0);
          queue.forEach((item: GRPCQueueItem<ExportItem>) => {
            this.send(item.objects, item.onSuccess, item.onError);
          });
        }
      });
  }

  protected sendWithGrpc(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void {
    if (this.serviceClient) {
      const serviceRequest = this.convert(objects);

      this.serviceClient.export(
        serviceRequest,
        this.metadata,
        (err: collectorTypes.ExportServiceError) => {
          if (err) {
            this.logger.error('Service request', serviceRequest);
            onError(err);
          } else {
            this.logger.debug('spans sent');
            onSuccess();
          }
        }
      );
    } else {
      this.grpcQueue.push({
        objects,
        onSuccess,
        onError,
      });
    }
  }

  protected sendWithJson(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void {
    const serviceRequest = this.convert(objects);
    const body = JSON.stringify(serviceRequest);
    const parsedUrl = new url.URL(this.url);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'application/json',
        ...this.headers,
      },
    };

    const request =
      parsedUrl.protocol === 'http:' ? http.request : https.request;
    const req = request(options, (res: http.IncomingMessage) => {
      if (res.statusCode && res.statusCode < 299) {
        this.logger.debug(`statusCode: ${res.statusCode}`);
        onSuccess();
      } else {
        this.logger.error(`statusCode: ${res.statusCode}`);
        onError({
          code: res.statusCode,
          message: res.statusMessage,
        });
      }
    });

    req.on('error', (error: Error) => {
      this.logger.error('error', error.message);
      onError({
        message: error.message,
      });
    });
    req.write(body);
    req.end();
  }

  abstract getServiceProtoPath(): string;
  abstract getServiceClient(
    packageObject: any,
    serverAddress: string
  ): ServiceClient;
}
