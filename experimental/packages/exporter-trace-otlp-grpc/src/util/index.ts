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

import * as grpc from "@grpc/grpc-js";
import { diag } from "@opentelemetry/api";
import { baggageUtils, ENVIRONMENT } from "@opentelemetry/core";
import { CompressionAlgorithm, ConnectionOptions, OTLPGRPCTraceExporterConfig } from "../types";
import { getCredentials } from "./security";

const DEFAULT_COLLECTOR_URL = 'http://localhost:4317'

export function getConnectionOptions(config: OTLPGRPCTraceExporterConfig, env: Required<ENVIRONMENT>): ConnectionOptions {
  const metadata = getMetadata(config, env);
  const url = getUrl(config, env);
  const host = getHost(url);
  const compression = configureCompression(config, env);

  if (url == null) {
    return {
      metadata,
      credentials: config.credentials ?? grpc.credentials.createInsecure(),
      host,
      compression,
    }
  }

  const credentials = config.credentials ?? getCredentials(url, env);

  return {
    metadata,
    credentials,
    host,
    compression,
  }
}

export function configureCompression(config: OTLPGRPCTraceExporterConfig, env: Required<ENVIRONMENT>): grpc.compressionAlgorithms {
  switch (config.compression) {
    case CompressionAlgorithm.GZIP:
      return grpc.compressionAlgorithms.gzip
    case CompressionAlgorithm.NONE:
      return grpc.compressionAlgorithms.identity
  }

  const definedCompression = env.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION || env.OTEL_EXPORTER_OTLP_COMPRESSION;
  return definedCompression === 'gzip' ? grpc.compressionAlgorithms.gzip : grpc.compressionAlgorithms.identity;
}

function getMetadata(config: OTLPGRPCTraceExporterConfig, env: Required<ENVIRONMENT>) {
  const metadata = config.metadata ?? new grpc.Metadata();
  const metadataMap = metadata.getMap();

  const envHeaders = baggageUtils.parseKeyPairsIntoRecord(env.OTEL_EXPORTER_OTLP_HEADERS);
  const envTraceHeaders = baggageUtils.parseKeyPairsIntoRecord(env.OTEL_EXPORTER_OTLP_TRACES_HEADERS);
  const headers = config.headers ?? {};

  console.log('env', env.OTEL_EXPORTER_OTLP_TRACES_HEADERS)
  console.log('config', config.headers)
  console.log('env headers', envHeaders)

  for (const [k, v] of Object.entries(headers)) {
    if (metadataMap[k] == null) {
      metadata.set(k, String(v));
    }
  }

  for (const [k, v] of Object.entries(envTraceHeaders)) {
    if (metadataMap[k] == null) {
      metadata.set(k, v);
    }
  }

  for (const [k, v] of Object.entries(envHeaders)) {
    if (metadataMap[k] == null) {
      metadata.set(k, v);
    }
  }

  return metadata;
}

function getUrl(config: OTLPGRPCTraceExporterConfig, env: Required<ENVIRONMENT>): string {
  if (typeof config.url === 'string') {
    return config.url;
  }

  return env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    DEFAULT_COLLECTOR_URL;
}

function getHost(url: string): string {
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

