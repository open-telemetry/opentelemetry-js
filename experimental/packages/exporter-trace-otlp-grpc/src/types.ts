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

import type * as grpc from '@grpc/grpc-js';

export type ConnectionOptions = {
  host: string;
  metadata: grpc.Metadata;
  credentials: grpc.ChannelCredentials;
  compression: grpc.compressionAlgorithms;
};

export type OTLPGRPCTraceExporterConfig = {
  credentials?: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
  compression?: CompressionAlgorithm;

  headers?: Partial<Record<string, unknown>>;
  hostname?: string;
  url?: string;
  concurrencyLimit?: number;
  /** Maximum time the OTLP exporter will wait for each batch export.
   * The default value is 10000ms. */
  timeoutMillis?: number;
};

export enum CompressionAlgorithm {
  NONE = 'none',
  GZIP = 'gzip'
}

export interface TraceServiceClient extends grpc.Client {
  export: (
    request: any,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: Function
  ) => {};
}
