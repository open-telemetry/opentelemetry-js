/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { createServiceClientConstructor } from '../../src/create-service-client-constructor';
import { loadedGrpcJsFiles } from './loaded-grpc-js-files';

async function main() {
  const before = loadedGrpcJsFiles();
  const Client = await createServiceClientConstructor(
    '/test/Export',
    'TestService'
  );
  process.stdout.write(
    [
      before,
      loadedGrpcJsFiles() > 0,
      typeof Client,
      typeof Client.service.export,
    ].join(' ')
  );
}

void main();
