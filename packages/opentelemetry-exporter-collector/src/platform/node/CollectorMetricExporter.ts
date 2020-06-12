/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { MetricExporter, MetricRecord } from '@opentelemetry/metrics';
import { ExportResult, NoopLogger } from '@opentelemetry/core';
import  * as collectorTypes  from '../../types';
import { GRPCMetricQueueItem, MetricsServiceClient } from './types';
import { removeProtocol } from './util';
import { Logger } from '@opentelemetry/api';
import * as path from 'path';
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from 'grpc';
import { toCollectorExportMetricServiceRequest } from '../../transform';

/**
 * Collector Exporter for Node
 */
export class CollectorMetricExporter implements MetricExporter {
  isShutDown: boolean = false;
  grpcMetricsQueue: GRPCMetricQueueItem[] = [];
  public readonly url: string;
  public readonly logger: Logger;
  metricServiceClient?: MetricsServiceClient = undefined;
  private readonly _startTime = new Date().getTime() * 1000000;

  /**
   * @param config
   */
  constructor(options: collectorTypes.ExporterOptions = {}) {
    this.logger = options.logger || new NoopLogger();
    this.url = options.url || 'http://localhost:55678/v1/metrics';
    this.grpcMetricsQueue = [];
    const serverAddress = removeProtocol(this.url);
    console.log(serverAddress);
    const metricServiceProtoPath = 'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
    const includeDirs = [path.resolve(__dirname, 'protos')];
    const credentials: grpc.ChannelCredentials = grpc.credentials.createInsecure(); // options.credentials ||  
    console.log(credentials);
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
        console.log("metric constructor");
        this.metricServiceClient = new packageObject.opentelemetry.proto.collector.metrics.v1.MetricsService(
          serverAddress,
          credentials
        );
        console.log(this.metricServiceClient);
        console.log("SETUP");
        console.log(serverAddress);
        if (this.grpcMetricsQueue.length > 0) {
          const queue = this.grpcMetricsQueue.splice(0);
          queue.forEach((item: GRPCMetricQueueItem) => {
            this.sendMetrics(item.metrics, item.onSuccess, item.onError);
          });
        }
      });
  }

  export(metrics: MetricRecord[], cb: (result: ExportResult) => void) {
    return new Promise((resolve, reject) => {
      try {
        this.logger.debug('metrics to be sent', metrics);
        this.sendMetrics(metrics, resolve, reject);
      } catch (e) {
        console.log('Error');
        console.log(e);
        reject(e);
      }
    });
  }


  sendMetrics(
    metrics: MetricRecord[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void {
    if (this.metricServiceClient) {
      const exportMetricServiceRequest = toCollectorExportMetricServiceRequest(metrics, this._startTime);
      console.log(exportMetricServiceRequest);
      this.metricServiceClient.export(exportMetricServiceRequest,  (
        err: collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceError
      ) => {
        if (err) {
          this.logger.error(
            'exportTraceServiceRequest',
            {} // exportMetricServiceRequest
          );
          onError(err);
        } else {
          onSuccess();
          console.log(exportMetricServiceRequest);
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

  /**
   * Prometheus Exporter: No shutdown
   * GCM exporter: No shutdown
   */
  shutdown(): void {
    if (this.metricServiceClient) {
      this.metricServiceClient.close();
    }
  }

}