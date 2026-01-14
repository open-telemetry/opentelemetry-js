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

// NOTE: do not change these type imports to actual imports. Doing so WILL break `@opentelemetry/instrumentation-http`,
// as they'd be imported before the http/https modules can be wrapped.
import type {
  Metadata,
  ServiceError,
  ChannelCredentials,
  Client,
  ServiceClientConstructor,
} from '@grpc/grpc-js';
import { status } from '@grpc/grpc-js';
import {
  ExportResponse,
  IExporterTransport,
} from '@opentelemetry/otlp-exporter-base';
import { VERSION } from './version';

const DEFAULT_USER_AGENT = `OTel-OTLP-Exporter-JavaScript/${VERSION}`;

function createUserAgent(userAgent: string | undefined) {
  if (userAgent) {
    return `${userAgent} ${DEFAULT_USER_AGENT}`;
  }
  return DEFAULT_USER_AGENT;
}

// values taken from '@grpc/grpc-js` so that we don't need to require/import it.
const GRPC_COMPRESSION_NONE = 0;
const GRPC_COMPRESSION_GZIP = 2;

/**
 * The maximum number of deadline exceeded errors that will be tolerated before the client is closed.
 */
const MAX_DEADLINE_EXCEEDED_COUNT = 5;

function toGrpcCompression(compression: 'gzip' | 'none'): number {
  return compression === 'gzip' ? GRPC_COMPRESSION_GZIP : GRPC_COMPRESSION_NONE;
}

export function createInsecureCredentials(): ChannelCredentials {
  // Lazy-load so that we don't need to require/import '@grpc/grpc-js' before it can be wrapped by instrumentation.
  const {
    credentials,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require('@grpc/grpc-js');
  return credentials.createInsecure();
}

export function createSslCredentials(
  rootCert?: Buffer,
  privateKey?: Buffer,
  certChain?: Buffer
): ChannelCredentials {
  // Lazy-load so that we don't need to require/import '@grpc/grpc-js' before it can be wrapped by instrumentation.
  const {
    credentials,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require('@grpc/grpc-js');
  return credentials.createSsl(rootCert, privateKey, certChain);
}

export function createEmptyMetadata(): Metadata {
  // Lazy-load so that we don't need to require/import '@grpc/grpc-js' before it can be wrapped by instrumentation.
  const {
    Metadata,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require('@grpc/grpc-js');
  return new Metadata();
}

export interface GrpcExporterTransportParameters {
  grpcPath: string;
  grpcName: string;
  address: string;
  /**
   * NOTE: Ensure that you're only importing/requiring gRPC inside the function providing the channel credentials,
   * otherwise, gRPC and http/https instrumentations may break.
   *
   * For common cases, you can avoid to import/require gRPC your function by using
   *   - {@link createSslCredentials}
   *   - {@link createInsecureCredentials}
   */
  credentials: () => ChannelCredentials;
  /**
   * NOTE: Ensure that you're only importing/requiring gRPC inside the function providing the metadata,
   * otherwise, gRPC and http/https instrumentations may break.
   *
   * To avoid having to import/require gRPC from your function to create a new Metadata object,
   * use {@link createEmptyMetadata}
   */
  metadata: () => Metadata;
  compression: 'gzip' | 'none';
  userAgent?: string;
}

export class GrpcExporterTransport implements IExporterTransport {
  private _client?: Client;
  private _metadata?: Metadata;
  private _parameters: GrpcExporterTransportParameters;
  private _deadlineExceededCount: number;

  constructor(parameters: GrpcExporterTransportParameters) {
    this._parameters = parameters;
    this._deadlineExceededCount = 0;
  }

  shutdown() {
    this._client?.close();
  }

  send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    // We need to make a for gRPC
    const buffer = Buffer.from(data);

    if (this._client == null) {
      // Lazy require to ensure that grpc is not loaded before instrumentations can wrap it
      const {
        createServiceClientConstructor,
        // eslint-disable-next-line @typescript-eslint/no-require-imports
      } = require('./create-service-client-constructor');

      try {
        this._metadata = this._parameters.metadata();
      } catch (error) {
        return Promise.resolve({
          status: 'failure',
          error: error,
        });
      }

      const clientConstructor: ServiceClientConstructor =
        createServiceClientConstructor(
          this._parameters.grpcPath,
          this._parameters.grpcName
        );

      try {
        this._client = new clientConstructor(
          this._parameters.address,
          this._parameters.credentials(),
          {
            'grpc.default_compression_algorithm': toGrpcCompression(
              this._parameters.compression
            ),
            'grpc.primary_user_agent': createUserAgent(
              this._parameters.userAgent
            ),
          }
        );
        this._deadlineExceededCount = 0;
      } catch (error) {
        return Promise.resolve({
          status: 'failure',
          error: error,
        });
      }
    }

    return new Promise<ExportResponse>(resolve => {
      const deadline = Date.now() + timeoutMillis;

      // this should never happen
      if (this._metadata == null) {
        return resolve({
          error: new Error('metadata was null'),
          status: 'failure',
        });
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore The gRPC client constructor is created on runtime, so we don't have any types for the resulting client.
      this._client.export(
        buffer,
        this._metadata,
        { deadline: deadline },
        (err: ServiceError, response: Buffer) => {
          if (err) {
            resolve({
              status: 'failure',
              error: err,
            });

            if (err.code === status.DEADLINE_EXCEEDED) {
              this._deadlineExceededCount++;
              if (this._deadlineExceededCount > MAX_DEADLINE_EXCEEDED_COUNT) {
                this._client?.close();
                this._client = undefined;
              }
            }
          } else {
            resolve({
              data: response,
              status: 'success',
            });
            // Reset the deadline exceeded count when we get a successful response.
            this._deadlineExceededCount = 0;
          }
        }
      );
    });
  }
}

export function createOtlpGrpcExporterTransport(
  options: GrpcExporterTransportParameters
): IExporterTransport {
  return new GrpcExporterTransport(options);
}
