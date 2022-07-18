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
import { loadSync } from '@grpc/proto-loader';
import { ExportResult, ExportResultCode, getEnv } from '@opentelemetry/core';
import { createExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import * as path from 'path';
import type { OTLPGRPCTraceExporterConfig, TraceServiceClient } from './types';
import { getConnectionOptions } from './util';

/**
 * OTLP Trace Exporter for Node
 */
export class OTLPTraceExporter implements SpanExporter {
  private _metadata: grpc.Metadata;
  private _serviceClient: TraceServiceClient;
  public url: string;
  public compression: grpc.compressionAlgorithms;

  constructor(config: OTLPGRPCTraceExporterConfig = {}) {
    const { host, credentials, metadata, compression } = getConnectionOptions(config, getEnv());
    this.url = host;
    this.compression = compression;
    this._metadata = metadata;

    const packageDefinition = loadSync('opentelemetry/proto/collector/trace/v1/trace_service.proto', {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [
        // In webpack environments, the bundle may be at the same level as the protos/ directory
        path.resolve(__dirname, 'protos'),
        // When running typescript directly in tests or with ts-node, the protos/ directory is one level above the src/ directory
        path.resolve(__dirname, '..', 'protos'),
        // When running the compiled js, the protos directory is two levels above the build/src/ directory
        path.resolve(__dirname, '..', '..', 'protos'),
      ],
    });

    // any required here because
    const packageObject: any = grpc.loadPackageDefinition(packageDefinition);
    const channelOptions: grpc.ChannelOptions = {
      'grpc.default_compression_algorithm': this.compression,
    };
    this._serviceClient = new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(host, credentials, channelOptions);
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    // TODO
    const deadline = Date.now() + 1000;

    const req = createExportTraceServiceRequest(spans);
    this._serviceClient.export(
      req,
      this._metadata,
      { deadline },
      (...args: unknown[]) => {
        if (args[0]) {
          resultCallback({
            code: ExportResultCode.FAILED,
            error: args[0] as any,
          });
        } else {
          resultCallback({
            code: ExportResultCode.SUCCESS,
          });
        }
      },
    );
  }

  shutdown(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
