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
import { CollectorExporterConfigNode } from '../../types';
import { GRPCMetricQueueItem, ServiceClient } from './types';
import { removeProtocol } from './util';
import * as path from 'path';
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from 'grpc';
import { toCollectorExportMetricServiceRequest } from '../../transform';
import { CollectorMetricExporterBase } from '../../CollectorMetricExporterBase';

const DEFAULT_COLLECTOR_URL = 'localhost:55678';

/**
 * Collector Metric Exporter for Node
 */
export class CollectorMetricExporter extends CollectorMetricExporterBase<
  CollectorExporterConfigNode
> {
  isShutDown: boolean = false;
  grpcMetricsQueue: GRPCMetricQueueItem[] = [];
  metricServiceClient?: ServiceClient = undefined;
  credentials: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;

  constructor(config: CollectorExporterConfigNode = {}) {
    super(config);
    this.grpcMetricsQueue = [];
    this.credentials = config.credentials || grpc.credentials.createInsecure();
    this.metadata = config.metadata;
  }

  onShutdown(): void {
    this.isShutDown = true;
    if (this.metricServiceClient) {
      this.metricServiceClient.close();
    }
  }

  onInit(): void {
    this.isShutDown = false;
    const serverAddress = removeProtocol(this.url);
    const metricServiceProtoPath =
      'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
    const includeDirs = [path.resolve(__dirname, 'protos')];
    protoLoader
      .load(metricServiceProtoPath, {
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
        this.metricServiceClient = new packageObject.opentelemetry.proto.collector.metrics.v1.MetricsService(
          serverAddress,
          this.credentials
        );
        if (this.grpcMetricsQueue.length > 0) {
          const queue = this.grpcMetricsQueue.splice(0);
          queue.forEach((item: GRPCMetricQueueItem) => {
            this.sendMetrics(item.metrics, item.onSuccess, item.onError);
          });
        }
      });
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
    if (this.metricServiceClient) {
      const exportMetricServiceRequest = toCollectorExportMetricServiceRequest(
        metrics,
        this._startTime,
        this
      );
      this.metricServiceClient.export(
        exportMetricServiceRequest,
        this.metadata,
        (
          err: collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceError
        ) => {
          if (err) {
            this.logger.error(
              'exportMetricServiceRequest',
              exportMetricServiceRequest
            );
            onError(err);
          } else {
            onSuccess();
          }
        }
      );
    } else {
      this.grpcMetricsQueue.push({
        metrics,
        onSuccess,
        onError,
      });
    }
  }

  getDefaultUrl(url: string | undefined): string {
    return url || DEFAULT_COLLECTOR_URL;
  }
}
