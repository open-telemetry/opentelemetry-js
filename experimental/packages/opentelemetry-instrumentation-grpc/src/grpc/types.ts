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

import type * as grpcTypes from 'grpc';
import * as events from 'events';

export type SendUnaryDataCallback = (
  error: grpcTypes.ServiceError | null,
  value?: any,
  trailer?: grpcTypes.Metadata,
  flags?: grpcTypes.writeFlags
) => void;

interface GrpcStatus {
  code: number;
  details: string;
  metadata: grpcTypes.Metadata;
}

export type ServerCall =
  | typeof grpcTypes.ServerUnaryCall
  | typeof grpcTypes.ServerReadableStream
  | typeof grpcTypes.ServerWritableStream
  | typeof grpcTypes.ServerDuplexStream;

export type ServerCallWithMeta = ServerCall & {
  metadata: grpcTypes.Metadata;
  status: GrpcStatus;
  request?: unknown;
} & events.EventEmitter;

export type GrpcClientFunc = typeof Function & {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
};

export type GrpcInternalClientTypes = {
  makeClientConstructor: typeof grpcTypes.makeGenericClientConstructor;
};
