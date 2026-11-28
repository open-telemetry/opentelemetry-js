/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createOtlpGrpcExporterTransport,
} from '../../src/grpc-exporter-transport';
import { loadedGrpcJsFiles } from './loaded-grpc-js-files';

async function main() {
  const before = loadedGrpcJsFiles();
  let metadataCalls = 0;
  let credentialCalls = 0;

  const transport = createOtlpGrpcExporterTransport({
    address: '127.0.0.1:1',
    compression: 'none',
    metadata: () => {
      metadataCalls++;
      assert.ok(loadedGrpcJsFiles() > 0);
      return createEmptyMetadata();
    },
    credentials: () => {
      credentialCalls++;
      assert.ok(loadedGrpcJsFiles() > 0);
      return createInsecureCredentials();
    },
    grpcName: 'MetricsExportService',
    grpcPath: '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export',
  });

  const beforeSend = loadedGrpcJsFiles();
  const result = await transport.send(new Uint8Array([1, 2, 3]), 50);
  transport.shutdown();

  process.stdout.write(
    [
      before,
      beforeSend,
      loadedGrpcJsFiles() > 0,
      metadataCalls,
      credentialCalls,
      result.status,
    ].join(' ')
  );
}

void main();
