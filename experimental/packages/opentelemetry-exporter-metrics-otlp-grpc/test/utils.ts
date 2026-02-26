/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Metadata,
  Server,
  ServerCredentials,
  ServiceDefinition,
} from '@grpc/grpc-js';

export interface ExportedData {
  request: Buffer;
  metadata: Metadata;
}

export interface ServerTestContext {
  requests: ExportedData[];
  serverResponseProvider: () => { error: Error | null; buffer?: Buffer };
}

/**
 * Starts a customizable server that saves all responses to context.responses
 * Returns data as defined in context.ServerResponseProvider
 *
 * @return shutdown handle, needs to be called to ensure that mocha exits
 * @param address address to bind to
 * @param service service to start
 * @param context context for storing responses and to define server behavior.
 */
export function startServer(
  address: string,
  service: ServiceDefinition,
  context: ServerTestContext
): Promise<() => void> {
  const server = new Server();
  server.addService(service, {
    export: (data: ExportedData, callback: any) => {
      context.requests.push(data);
      const response = context.serverResponseProvider();
      callback(response.error, response.buffer);
    },
  });

  return new Promise<() => void>((resolve, reject) => {
    server.bindAsync(
      address,
      ServerCredentials.createInsecure(),
      (error, port) => {
        server.start();
        if (error != null) {
          reject(error);
        }
        resolve(() => {
          server.forceShutdown();
        });
      }
    );
  });
}
