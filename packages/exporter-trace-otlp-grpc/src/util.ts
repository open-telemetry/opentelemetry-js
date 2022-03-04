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

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { diag } from '@opentelemetry/api';
import { globalErrorHandler, getEnv } from '@opentelemetry/core';
import { otlpTypes } from '@opentelemetry/exporter-trace-otlp-http';
import * as path from 'path';
import { OTLPExporterNodeBase } from './OTLPExporterNodeBase';
import { URL } from 'url';
import {
  OTLPExporterConfigNode,
  GRPCQueueItem,
  ServiceClientType,
} from './types';
import * as fs from 'fs';

export function onInit<ExportItem, ServiceRequest>(
  collector: OTLPExporterNodeBase<ExportItem, ServiceRequest>,
  config: OTLPExporterConfigNode
): void {
  collector.grpcQueue = [];

  const credentials: grpc.ChannelCredentials = configureSecurity(config.url, config.credentials);

  const includeDirs = [path.resolve(__dirname, '..', 'protos')];

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
        collector.serviceClient =
          new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(
            collector.url,
            credentials,
          );
      } else {
        collector.serviceClient =
          new packageObject.opentelemetry.proto.collector.metrics.v1.MetricsService(
            collector.url,
            credentials,
          );
      }

      if (collector.grpcQueue.length > 0) {
        const queue = collector.grpcQueue.splice(0);
        queue.forEach((item: GRPCQueueItem<ExportItem>) => {
          collector.send(item.objects, item.onSuccess, item.onError);
        });
      }
    })
    .catch(err => {
      globalErrorHandler(err);
    });
}

export function send<ExportItem, ServiceRequest>(
  collector: OTLPExporterNodeBase<ExportItem, ServiceRequest>,
  objects: ExportItem[],
  onSuccess: () => void,
  onError: (error: otlpTypes.OTLPExporterError) => void
): void {
  if (collector.serviceClient) {
    const serviceRequest = collector.convert(objects);

    collector.serviceClient.export(
      serviceRequest,
      collector.metadata || new grpc.Metadata(),
      (err: otlpTypes.ExportServiceError) => {
        if (err) {
          diag.error('Service request', serviceRequest);
          onError(err);
        } else {
          diag.debug('Objects sent');
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

export function validateAndNormalizeUrl(url: string): string {
  const hasProtocol = url.match(/^([\w]{1,8}):\/\//);
  if (!hasProtocol) {
    url = `https://${url}`;
  }
  const target = new URL(url);
  if (target.pathname && target.pathname !== '/') {
    diag.warn(
      'URL path should not be set when using grpc, the path part of the URL will be ignored.'
    );
  }
  if (target.protocol !== '' && !target.protocol?.match(/(http|grpc)s?/)) {
    diag.warn(
      'URL protocol should be http(s):// or grpc(s)://. Using grpc://.'
    );
  }
  return target.host;
}

export function configureSecurity(endpoint: string | undefined,
  credentials: grpc.ChannelCredentials | undefined):
  grpc.ChannelCredentials {
  // if endpoing has https scheme it indicates a secure connection and
  // override insecure configuration settings
  const definedEndpoint = endpoint ||
    getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    getEnv().OTEL_EXPORTER_OTLP_ENDPOINT;

  if (definedEndpoint && definedEndpoint.includes('https')) {
    return useSecureConnection();
  } else if (credentials) {
    return credentials;
  } else {
    return getSecurityFromEnv();
  }
}

function getSecurityFromEnv(): grpc.ChannelCredentials {
  const definedSecurity =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_INSECURE ||
    getEnv().OTEL_EXPORTER_OTLP_INSECURE;

  if (definedSecurity === 'true') {
    return useSecureConnection();
  } else {
    return grpc.credentials.createInsecure();
  }
}

function useSecureConnection(): grpc.ChannelCredentials {
  const loadedCertificate = retrieveCertificate();

  return loadedCertificate
    ? grpc.credentials.createSsl(loadedCertificate)
    : grpc.credentials.createSsl();
}

function retrieveCertificate(): Buffer | undefined {
  const certificate =
    getEnv().OTEL_EXPORTER_OTLP_CERTIFICATE ||
    getEnv().OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE;

  return certificate ? fs.readFileSync(certificate) : undefined;
}
