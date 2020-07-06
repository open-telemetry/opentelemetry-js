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
import { CollectorTraceExporterBase } from '../../CollectorTraceExporterBase';
import { CollectorExporterError } from '../../types';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import {
  GRPCSpanQueueItem,
  ServiceClient,
  CollectorExporterConfigNode,
} from './types';
import { removeProtocol } from './util';

const DEFAULT_COLLECTOR_URL = 'localhost:55680';

/**
 * Collector Trace Exporter for Node
 */
export class CollectorTraceExporter extends CollectorTraceExporterBase<
  CollectorExporterConfigNode
> {
  isShutDown: boolean = false;
  traceServiceClient?: ServiceClient = undefined;
  grpcSpansQueue: GRPCSpanQueueItem[] = [];
  metadata?: grpc.Metadata;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfigNode = {}) {
    super(config);
    this.metadata = config.metadata;
  }

  onShutdown(): void {
    this.isShutDown = true;
    if (this.traceServiceClient) {
      this.traceServiceClient.close();
    }
  }

  onInit(config: CollectorExporterConfigNode): void {
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
          queue.forEach((item: GRPCSpanQueueItem) => {
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
      this.logger.debug('Shutdown already started. Cannot send spans');
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
        (err: collectorTypes.ExportServiceError) => {
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
