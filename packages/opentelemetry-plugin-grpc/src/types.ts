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

import type * as grpcModule from 'grpc';
import type * as events from 'events';

/**
 * Server Unary callback type
 */
export type SendUnaryDataCallback = (
  error: grpcModule.ServiceError | null,
  value?: any,
  trailer?: grpcModule.Metadata,
  flags?: grpcModule.writeFlags
) => void;

/**
 * Intersection type of all grpc server call types
 */
export type ServerCall =
  | typeof grpcModule.ServerUnaryCall
  | typeof grpcModule.ServerReadableStream
  | typeof grpcModule.ServerWritableStream
  | typeof grpcModule.ServerDuplexStream;

  /**
   * {@link ServerCall} ServerCall extended with misc. missing utility types
   */
export type ServerCallWithMeta = ServerCall & {
  metadata: grpcModule.Metadata;
} & events.EventEmitter;

/**
 * Grpc client callback function extended with missing utility types
 */
export type GrpcClientFunc = typeof Function & {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
};
