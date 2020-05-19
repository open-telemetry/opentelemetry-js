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
import { CollectorData, GRPCQueueItem } from './types';
import { removeProtocol } from './util';

const traceServiceClients: WeakMap<
  CollectorExporter,
  CollectorData
> = new WeakMap<CollectorExporter, CollectorData>();

/**
 * Collector Exporter Config
 */
export interface CollectorExporterConfig extends CollectorExporterConfigBase {
  credentials?: grpc.ChannelCredentials;
}

/**
 * Collector Exporter
 */
export class CollectorExporter extends CollectorExporterBase<
  CollectorExporterConfig
> {
  /**
   * @param config
   */
  constructor(config: CollectorExporterConfig = {}) {
    super(config);
  }

  onShutdown(): void {
    const exporter = traceServiceClients.get(this);
    if (!exporter) {
      return;
    }
    exporter.isShutDown = true;

    if (exporter.traceServiceClient) {
      exporter.traceServiceClient.close();
    }
  }

  onInit(config: CollectorExporterConfig): void {
    traceServiceClients.set(this, {
      isShutDown: false,
      grpcSpansQueue: [],
    });
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
        const exporter = traceServiceClients.get(this);
        if (!exporter) {
          return;
        }
        exporter.traceServiceClient = new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(
          serverAddress,
          credentials
        );
        if (exporter.grpcSpansQueue.length > 0) {
          const queue = exporter.grpcSpansQueue.splice(0);
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
    const exporter = traceServiceClients.get(this);
    if (!exporter || exporter.isShutDown) {
      return;
    }
    if (exporter.traceServiceClient) {
      const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
        spans,
        this
      );

      exporter.traceServiceClient.export(
        exportTraceServiceRequest,
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
      exporter.grpcSpansQueue.push({
        spans,
        onSuccess,
        onError,
      });
    }
  }
}
