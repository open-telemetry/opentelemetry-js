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

import { ReadableSpan } from '@opentelemetry/tracing';
import * as grpc from 'grpc';
import {
  CollectorExporterBase,
  CollectorExporterConfigBase,
} from '../../CollectorExporterBase';
import { CollectorProtocolNode } from '../../enums';
import * as collectorTypes from '../../types';
import {
  DEFAULT_COLLECTOR_URL_GRPC,
  onInitWithGrpc,
  sendSpansUsingGrpc,
} from './utilWithGrpc';
import {
  DEFAULT_COLLECTOR_URL_JSON,
  onInitWithJson,
  sendSpansUsingJson,
} from './utilWithJson';
import { GRPCQueueItem, TraceServiceClient } from './types';

/**
 * Collector Exporter Config for Node
 * headers will only work if useJson is set to true
 */
export interface CollectorExporterConfig extends CollectorExporterConfigBase {
  credentials?: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
  headers?: Record<string, string>;
  protocolNode?: CollectorProtocolNode;
}

/**
 * Collector Exporter for Node
 */
export class CollectorExporter extends CollectorExporterBase<
  CollectorExporterConfig
> {
  DEFAULT_HEADERS: { [key: string]: string } = {
    [collectorTypes.OT_REQUEST_HEADER]: '1',
  };
  isShutDown: boolean = false;
  traceServiceClient?: TraceServiceClient = undefined;
  grpcSpansQueue: GRPCQueueItem[] = [];
  metadata?: grpc.Metadata;
  headers: { [key: string]: string };
  private readonly _protocol: CollectorProtocolNode;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfig = {}) {
    super(config);
    this._protocol =
      typeof config.protocolNode !== 'undefined'
        ? config.protocolNode
        : CollectorProtocolNode.GRPC;
    if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
      this.logger.debug('CollectorExporter - using json over http');
    } else {
      this.logger.debug('CollectorExporter - using grpc');
    }
    this.metadata = config.metadata;
    this.headers = config.headers || this.DEFAULT_HEADERS;
  }

  onShutdown(): void {
    this.isShutDown = true;
    if (this.traceServiceClient) {
      this.traceServiceClient.close();
    }
  }

  onInit(config: CollectorExporterConfig): void {
    this.isShutDown = false;

    if (config.protocolNode === CollectorProtocolNode.HTTP_JSON) {
      onInitWithJson(this, config);
    } else {
      onInitWithGrpc(this, config);
    }
  }

  sendSpans(
    spans: ReadableSpan[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void {
    if (this.isShutDown) {
      return;
    }
    if (this._protocol) {
      sendSpansUsingJson(this, spans, onSuccess, onError);
    } else {
      sendSpansUsingGrpc(this, spans, onSuccess, onError);
    }
  }

  getDefaultUrl(config: CollectorExporterConfig): string {
    if (!config.url) {
      return config.protocolNode === CollectorProtocolNode.HTTP_JSON
        ? DEFAULT_COLLECTOR_URL_JSON
        : DEFAULT_COLLECTOR_URL_GRPC;
    }
    return config.url;
  }
}
