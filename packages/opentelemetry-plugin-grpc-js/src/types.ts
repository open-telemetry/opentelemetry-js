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

import type * as grpcJs from '@grpc/grpc-js';
import * as events from 'events';

export type grpc = typeof grpcJs;

export type SendUnaryDataCallback<T> = grpcJs.requestCallback<T>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GrpcPluginOptions {}

interface GrpcStatus {
  code: number;
  details: string;
  metadata: grpcJs.Metadata;
}

export type ServerCall<T, U> =
  | grpcJs.ServerUnaryCall<T, U>
  | grpcJs.ServerReadableStream<T, U>
  | grpcJs.ServerWritableStream<T, U>
  | grpcJs.ServerDuplexStream<T, U>;

export type ServerCallWithMeta<T, U> = ServerCall<T, U> & {
  metadata: grpcJs.Metadata;
  status: GrpcStatus;
  request?: unknown;
} & events.EventEmitter;

export type GrpcClientFunc = typeof Function & {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
};

export type GrpcInternalClientTypes = {
  makeClientConstructor: typeof grpcJs.makeGenericClientConstructor;
};

// TODO: Delete if moving internal file loaders to BasePlugin
/**
 * Maps a name (key) representing a internal file module and its exports
 */
export interface ModuleNameToFilePath {
  client: string; // path/to/file
  [wildcard: string]: string; // string indexer
}

/**
 * Maps a semver to a module:filepath Map
 */
export interface ModuleExportsMapping {
  [semver: string]: ModuleNameToFilePath;
}
