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
