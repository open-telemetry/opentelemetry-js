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
import {
  CompressionAlgorithm,
  OTLPExporterConfigBase,
  OTLPExporterError,
} from '@opentelemetry/otlp-exporter-base';

/**
 * Queue item to be used to save temporary spans/metrics/logs in case the GRPC service
 * hasn't been fully initialized yet
 */
export interface GRPCQueueItem<ExportedItem> {
  objects: ExportedItem[];
  onSuccess: () => void;
  onError: (error: OTLPExporterError) => void;
}

/**
 * Service Client for sending spans/metrics/logs
 */
export interface ServiceClient {
  export: (
    request: any,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: Function
  ) => {};

  close(): void;
}

/**
 * OTLP Exporter Config for Node
 */
export interface OTLPGRPCExporterConfigNode extends OTLPExporterConfigBase {
  credentials?: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
  compression?: CompressionAlgorithm;
}

export enum ServiceClientType {
  SPANS,
  METRICS,
  LOGS,
}
