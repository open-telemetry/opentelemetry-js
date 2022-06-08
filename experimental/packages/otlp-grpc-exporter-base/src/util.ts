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
import { getEnv, globalErrorHandler } from '@opentelemetry/core';
import * as path from 'path';
import { OTLPGRPCExporterNodeBase } from './OTLPGRPCExporterNodeBase';
import { URL } from 'url';
import * as fs from 'fs';
import { GRPCQueueItem, OTLPGRPCExporterConfigNode, ServiceClientType, } from './types';
import { CompressionAlgorithm, ExportServiceError, OTLPExporterError } from '@opentelemetry/otlp-exporter-base';

export const DEFAULT_COLLECTOR_URL = 'http://localhost:4317';

export function onInit<ExportItem, ServiceRequest>(
  collector: OTLPGRPCExporterNodeBase<ExportItem, ServiceRequest>,
  config: OTLPGRPCExporterConfigNode
): void {
  collector.grpcQueue = [];

  const credentials: grpc.ChannelCredentials = configureSecurity(config.credentials, collector.getUrlFromConfig(config));

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

      const options = { 'grpc.default_compression_algorithm': collector.compression };

      if (collector.getServiceClientType() === ServiceClientType.SPANS) {
        collector.serviceClient =
          new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(
            collector.url,
            credentials,
            options,
          );
      } else {
        collector.serviceClient =
          new packageObject.opentelemetry.proto.collector.metrics.v1.MetricsService(
            collector.url,
            credentials,
            options,
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
  collector: OTLPGRPCExporterNodeBase<ExportItem, ServiceRequest>,
  objects: ExportItem[],
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void
): void {
  if (collector.serviceClient) {
    const serviceRequest = collector.convert(objects);
    const deadline = Date.now() + collector.timeoutMillis;

    collector.serviceClient.export(
      serviceRequest,
      collector.metadata || new grpc.Metadata(),
      { deadline: deadline },
      (err: ExportServiceError) => {
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
  if (target.protocol !== '' && !target.protocol?.match(/^(http)s?:$/)) {
    diag.warn(
      'URL protocol should be http(s)://. Using http://.'
    );
  }
  return target.host;
}

export function configureSecurity(credentials: grpc.ChannelCredentials | undefined, endpoint: string):
  grpc.ChannelCredentials {

  let insecure: boolean;

  if (credentials) {
    return credentials;
  } else if (endpoint.startsWith('https://')) {
    insecure = false;
  } else if (endpoint.startsWith('http://') || endpoint === DEFAULT_COLLECTOR_URL) {
    insecure = true;
  } else {
    insecure = getSecurityFromEnv();
  }

  if (insecure) {
    return grpc.credentials.createInsecure();
  } else {
    return useSecureConnection();
  }
}

function getSecurityFromEnv(): boolean {
  const definedInsecure =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_INSECURE ||
    getEnv().OTEL_EXPORTER_OTLP_INSECURE;

  if (definedInsecure) {
    return definedInsecure.toLowerCase() === 'true';
  } else {
    return false;
  }
}

export function useSecureConnection(): grpc.ChannelCredentials {
  const rootCertPath = retrieveRootCert();
  const privateKeyPath = retrievePrivateKey();
  const certChainPath = retrieveCertChain();

  return grpc.credentials.createSsl(rootCertPath, privateKeyPath, certChainPath);
}

function retrieveRootCert(): Buffer | undefined {
  const rootCertificate =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE ||
    getEnv().OTEL_EXPORTER_OTLP_CERTIFICATE;

  if (rootCertificate) {
    try {
      return fs.readFileSync(path.resolve(process.cwd(), rootCertificate));
    } catch {
      diag.warn('Failed to read root certificate file');
      return undefined;
    }
  } else {
    return undefined;
  }
}

function retrievePrivateKey(): Buffer | undefined {
  const clientKey =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY ||
    getEnv().OTEL_EXPORTER_OTLP_CLIENT_KEY;

  if (clientKey) {
    try {
      return fs.readFileSync(path.resolve(process.cwd(), clientKey));
    } catch {
      diag.warn('Failed to read client certificate private key file');
      return undefined;
    }
  } else {
    return undefined;
  }
}

function retrieveCertChain(): Buffer | undefined {
  const clientChain =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE ||
    getEnv().OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE;

  if (clientChain) {
    try {
      return fs.readFileSync(path.resolve(process.cwd(), clientChain));
    } catch {
      diag.warn('Failed to read client certificate chain file');
      return undefined;
    }
  } else {
    return undefined;
  }
}

function toGrpcCompression(compression: CompressionAlgorithm): GrpcCompressionAlgorithm {
  if (compression === CompressionAlgorithm.NONE)
    return GrpcCompressionAlgorithm.NONE;
  else if (compression === CompressionAlgorithm.GZIP)
    return GrpcCompressionAlgorithm.GZIP;
  return GrpcCompressionAlgorithm.NONE;
}

/**
 * These values are defined by grpc client
 */
export enum GrpcCompressionAlgorithm {
  NONE = 0,
  GZIP = 2
}

export function configureCompression(compression: CompressionAlgorithm | undefined): GrpcCompressionAlgorithm {
  if (compression) {
    return toGrpcCompression(compression);
  } else {
    const definedCompression = getEnv().OTEL_EXPORTER_OTLP_TRACES_COMPRESSION || getEnv().OTEL_EXPORTER_OTLP_COMPRESSION;

    return definedCompression === 'gzip' ? GrpcCompressionAlgorithm.GZIP : GrpcCompressionAlgorithm.NONE;
  }
}
