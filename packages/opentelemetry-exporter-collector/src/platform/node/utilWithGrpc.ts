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
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { CollectorTraceExporter } from './CollectorTraceExporter';
import { CollectorExporterConfigNode, GRPCSpanQueueItem } from './types';
import { removeProtocol } from './util';

export const DEFAULT_COLLECTOR_URL_GRPC = 'localhost:55680';

export function onInitWithGrpc(
  collector: CollectorTraceExporter,
  config: CollectorExporterConfigNode
): void {
  collector.grpcSpansQueue = [];
  const serverAddress = removeProtocol(collector.url);
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
      const packageObject: any = grpc.loadPackageDefinition(packageDefinition);
      collector.traceServiceClient = new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(
        serverAddress,
        credentials
      );
      if (collector.grpcSpansQueue.length > 0) {
        const queue = collector.grpcSpansQueue.splice(0);
        queue.forEach((item: GRPCSpanQueueItem) => {
          collector.sendSpans(item.spans, item.onSuccess, item.onError);
        });
      }
    });
}

export function sendSpansUsingGrpc(
  collector: CollectorTraceExporter,
  spans: ReadableSpan[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  if (collector.traceServiceClient) {
    const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
      spans,
      collector
    );
    collector.traceServiceClient.export(
      exportTraceServiceRequest,
      collector.metadata,
      (err: collectorTypes.ExportServiceError) => {
        if (err) {
          collector.logger.error(
            'exportTraceServiceRequest',
            exportTraceServiceRequest
          );
          onError(err);
        } else {
          collector.logger.debug('spans sent');
          onSuccess();
        }
      }
    );
  } else {
    collector.grpcSpansQueue.push({
      spans,
      onSuccess,
      onError,
    });
  }
}
