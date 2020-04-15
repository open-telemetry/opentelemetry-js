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
import { ReadableSpan } from '@opentelemetry/tracing';
import * as grpc from 'grpc';
import * as path from 'path';

import { CollectorExporter } from '../../CollectorExporter';
import * as collectorTypes from '../../types';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { CollectorData, GRPCQueueItem } from './types';
import { removeProtocol } from './util';

const traceServiceClients: WeakMap<
  CollectorExporter,
  CollectorData
> = new WeakMap<CollectorExporter, CollectorData>();

/**
 * function that is called once when {@link ExporterCollector} is initialised
 * @param collectorExporter CollectorExporter {@link ExporterCollector}
 */
export function onInit(collectorExporter: CollectorExporter) {
  traceServiceClients.set(collectorExporter, {
    isShutDown: false,
    grpcSpansQueue: [],
  });
  const serverAddress = removeProtocol(collectorExporter.url);
  const credentials: grpc.ChannelCredentials = grpc.credentials.createInsecure();

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
      const packageObject: any = grpc.loadPackageDefinition(packageDefinition);
      const exporter = traceServiceClients.get(collectorExporter);
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
          sendSpans(
            item.spans,
            item.onSuccess,
            item.onError,
            collectorExporter
          );
        });
      }
    });
}

/**
 * function to be called once when {@link ExporterCollector} is shutdown
 * @param collectorExporter CollectorExporter {@link ExporterCollector}
 */
export function onShutdown(collectorExporter: CollectorExporter) {
  const exporter = traceServiceClients.get(collectorExporter);
  if (!exporter) {
    return;
  }
  exporter.isShutDown = true;

  if (exporter.traceServiceClient) {
    exporter.traceServiceClient.close();
  }
}

/**
 * function to send spans to the [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
 *     using the standard http/https node module
 * @param spans
 * @param onSuccess
 * @param onError
 * @param collectorExporter
 */
export function sendSpans(
  spans: ReadableSpan[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void,
  collectorExporter: CollectorExporter
) {
  const exporter = traceServiceClients.get(collectorExporter);
  if (!exporter || exporter.isShutDown) {
    return;
  }
  if (exporter.traceServiceClient) {
    const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
      spans,
      collectorExporter
    );

    exporter.traceServiceClient.export(
      exportTraceServiceRequest,
      (
        err: collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceError
      ) => {
        if (err) {
          collectorExporter.logger.error(
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
