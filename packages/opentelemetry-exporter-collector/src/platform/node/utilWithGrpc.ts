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
import { ServiceClientType } from '../../types';
import * as collectorTypes from '../../types';

import { CollectorExporterConfigNode, GRPCQueueItem } from './types';
import { removeProtocol } from './util';
import { CollectorExporterNodeBase } from './CollectorExporterNodeBase';

export function initWithGrpc<ExportItem, ServiceRequest>(
  collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>,
  config: CollectorExporterConfigNode
): void {
  collector.grpcQueue = [];
  const serverAddress = removeProtocol(collector.url);
  const credentials: grpc.ChannelCredentials =
    config.credentials || grpc.credentials.createInsecure();

  const includeDirs = [path.resolve(__dirname, 'protos')];

  protoLoader
    .load(collector.getServiceProtoPath(), {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs,
    })
    .then(packageDefinition => {
      const packageObject: any = grpc.loadPackageDefinition(packageDefinition);

      if (collector.getServiceClientType() === ServiceClientType.SPANS) {
        collector.serviceClient = new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(
          serverAddress,
          credentials
        );
      } else {
        collector.serviceClient = new packageObject.opentelemetry.proto.collector.metrics.v1.MetricsService(
          serverAddress,
          credentials
        );
      }

      if (collector.grpcQueue.length > 0) {
        const queue = collector.grpcQueue.splice(0);
        queue.forEach((item: GRPCQueueItem<ExportItem>) => {
          collector.send(item.objects, item.onSuccess, item.onError);
        });
      }
    });
}

export function sendWithGrpc<ExportItem, ServiceRequest>(
  collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>,
  objects: ExportItem[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  if (collector.serviceClient) {
    const serviceRequest = collector.convert(objects);

    collector.serviceClient.export(
      serviceRequest,
      collector.metadata,
      (err: collectorTypes.ExportServiceError) => {
        if (err) {
          collector.logger.error('Service request', serviceRequest);
          onError(err);
        } else {
          collector.logger.debug('Objects sent');
          onSuccess();
        }
      }
    );
  } else {
    collector.grpcQueue.push({
      objects,
      onSuccess,
      onError,
    });
  }
}
