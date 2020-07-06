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
import { CollectorTraceExporterBase } from '../../CollectorTraceExporterBase';
import * as collectorTypes from '../../types';

import { CollectorProtocolNode } from '../../enums';
import { parseHeaders } from '../../util';
import {
  GRPCSpanQueueItem,
  ServiceClient,
  CollectorExporterConfigNode,
} from './types';

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

/**
 * Collector Trace Exporter for Node
 */
export class CollectorTraceExporter extends CollectorTraceExporterBase<
  CollectorExporterConfigNode
> {
  DEFAULT_HEADERS: Record<string, string> = {
    [collectorTypes.OT_REQUEST_HEADER]: '1',
  };
  isShutDown: boolean = false;
  traceServiceClient?: ServiceClient = undefined;
  grpcSpansQueue: GRPCSpanQueueItem[] = [];
  metadata?: grpc.Metadata;
  headers: Record<string, string>;
  private readonly _protocol: CollectorProtocolNode;

  /**
   * @param config
   */
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
    this.metadata = config.metadata;
    this.headers =
      parseHeaders(config.headers, this.logger) || this.DEFAULT_HEADERS;
  }

  onShutdown(): void {
    this.isShutDown = true;
    if (this.traceServiceClient) {
      this.traceServiceClient.close();
    }
  }

  onInit(config: CollectorExporterConfigNode): void {
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
      this.logger.debug('Shutdown already started. Cannot send spans');
      return;
    }
    if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
      sendSpansUsingJson(this, spans, onSuccess, onError);
    } else {
      sendSpansUsingGrpc(this, spans, onSuccess, onError);
    }
  }

  getDefaultUrl(config: CollectorExporterConfigNode): string {
    if (!config.url) {
      return config.protocolNode === CollectorProtocolNode.HTTP_JSON
        ? DEFAULT_COLLECTOR_URL_JSON
        : DEFAULT_COLLECTOR_URL_GRPC;
    }
    return config.url;
  }
}
