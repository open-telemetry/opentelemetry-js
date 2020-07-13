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

import { MetricRecord } from '@opentelemetry/metrics';
import * as collectorTypes from '../../types';
import { CollectorExporterConfigNode } from './types';
import { GRPCMetricQueueItem, ServiceClient } from './types';
import * as grpc from 'grpc';
import { CollectorMetricExporterBase } from '../../CollectorMetricExporterBase';
import { parseHeaders } from '../../util';
import { CollectorProtocolNode } from '../../enums';
import { sendMetricsUsingJson, metricInitWithJson } from './utilWithJson';
import { metricInitWithGrpc, sendMetricsUsingGrpc } from './utilWithGrpc';

const DEFAULT_COLLECTOR_URL_GRPC = 'localhost:55680';
const DEFAULT_COLLECTOR_URL_JSON = 'http://localhost:55680/v1/metrics';

/**
 * Collector Metric Exporter for Node
 */
export class CollectorMetricExporter extends CollectorMetricExporterBase<
  CollectorExporterConfigNode
> {
  DEFAULT_HEADERS: Record<string, string> = {
    [collectorTypes.OT_REQUEST_HEADER]: '1',
  };
  isShutDown: boolean = false;
  grpcMetricsQueue: GRPCMetricQueueItem[] = [];
  metricServiceClient?: ServiceClient = undefined;
  credentials: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
  headers: Record<string, string>;
  private readonly _protocol: CollectorProtocolNode;

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
    this.grpcMetricsQueue = [];
    this.credentials = config.credentials || grpc.credentials.createInsecure();
    this.metadata = config.metadata;
    this.headers =
      parseHeaders(config.headers, this.logger) || this.DEFAULT_HEADERS;
  }

  onShutdown(): void {
    this.isShutDown = true;
    if (this.metricServiceClient) {
      this.metricServiceClient.close();
    }
  }

  onInit(): void {
    this.isShutDown = false;

    if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
      metricInitWithJson(this);
    } else {
      metricInitWithGrpc(this);
    }
  }

  sendMetrics(
    metrics: MetricRecord[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void {
    if (this.isShutDown) {
      this.logger.debug('Shutdown already started. Cannot send metrics');
      return;
    }
    if (this._protocol === CollectorProtocolNode.HTTP_JSON) {
      sendMetricsUsingJson(this, metrics, this._startTime, onSuccess, onError);
    } else {
      sendMetricsUsingGrpc(this, metrics, this._startTime, onSuccess, onError);
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
