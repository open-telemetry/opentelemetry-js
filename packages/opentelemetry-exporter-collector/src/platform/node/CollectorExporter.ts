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

import * as protoLoader from '@grpc/proto-loader';
import * as grpc from 'grpc';
import * as path from 'path';
import * as collectorTypes from '../../types';

import { ReadableSpan } from '@opentelemetry/tracing';
import {
  CollectorExporterBase,
  CollectorExporterConfigBase,
} from '../../CollectorExporterBase';
import { CollectorExporterError } from '../../types';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { GRPCQueueItem, TraceServiceClient } from './types';
import { removeProtocol } from './util';

const DEFAULT_COLLECTOR_URL = 'localhost:55678';

/**
 * Collector Exporter Config for Node
 */
export interface CollectorExporterConfig extends CollectorExporterConfigBase {
  credentials?: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
}

/**
 * Collector Exporter for Node
 */
export class CollectorExporter extends CollectorExporterBase<
  CollectorExporterConfig
> {
  isShutDown: boolean = false;
  traceServiceClient?: TraceServiceClient = undefined;
  grpcSpansQueue: GRPCQueueItem[] = [];
  metadata?: grpc.Metadata;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfig = {}) {
    super(config);
    this.metadata = config.metadata;
  }

  onShutdown(): void {
    this.isShutDown = true;
    if (this.traceServiceClient) {
      this.traceServiceClient.close();
    }
  }

  onInit(config: CollectorExporterConfig): void {
    this.isShutDown = false;
    this.grpcSpansQueue = [];
    const serverAddress = removeProtocol(this.url);
    const credentials: grpc.ChannelCredentials =
      config.credentials || grpc.credentials.createInsecure();

    const traceServiceProtoPath =
      'opentelemetry/proto/collector/trace/v1/trace_service.proto';
    const includeDirs = [path.resolve(__dirname, 'protos')];

    protoLoader
      .load(traceServiceProtoPath, {
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
        this.traceServiceClient = new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(
          serverAddress,
          credentials
        );
        if (this.grpcSpansQueue.length > 0) {
          const queue = this.grpcSpansQueue.splice(0);
          queue.forEach((item: GRPCQueueItem) => {
            this.sendSpans(item.spans, item.onSuccess, item.onError);
          });
        }
      });
  }

  sendSpans(
    spans: ReadableSpan[],
    onSuccess: () => void,
    onError: (error: CollectorExporterError) => void
  ): void {
    if (this.isShutDown) {
      return;
    }
    if (this.traceServiceClient) {
      const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
        spans,
        this
      );

      this.traceServiceClient.export(
        exportTraceServiceRequest,
        this.metadata,
        (
          err: collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceError
        ) => {
          if (err) {
            this.logger.error(
              'exportTraceServiceRequest',
              exportTraceServiceRequest
            );
            onError(err);
          } else {
            onSuccess();
          }
        }
      );
    } else {
      this.grpcSpansQueue.push({
        spans,
        onSuccess,
        onError,
      });
    }
  }

  getDefaultUrl(url: string | undefined): string {
    return url || DEFAULT_COLLECTOR_URL;
  }
}
