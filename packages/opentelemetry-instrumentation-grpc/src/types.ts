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

import * as grpcModule from 'grpc';
import * as events from 'events';
import { PluginConfig } from '@opentelemetry/api';

export type grpc = typeof grpcModule;

export type IgnoreMatcher = string | RegExp | ((str: string) => boolean);

export type SendUnaryDataCallback = (
  error: grpcModule.ServiceError | null,
  value?: any,
  trailer?: grpcModule.Metadata,
  flags?: grpcModule.writeFlags
) => void;

export interface GrpcPluginOptions extends PluginConfig {
  /* Omits tracing on any gRPC methods that match any of
   * the IgnoreMatchers in the ignoreGrpcMethods list
   */
  ignoreGrpcMethods?: IgnoreMatcher[];
}

interface GrpcStatus {
  code: number;
  details: string;
  metadata: grpcModule.Metadata;
}

export type ServerCall =
  | typeof grpcModule.ServerUnaryCall
  | typeof grpcModule.ServerReadableStream
  | typeof grpcModule.ServerWritableStream
  | typeof grpcModule.ServerDuplexStream;

export type ServerCallWithMeta = ServerCall & {
  metadata: grpcModule.Metadata;
  status: GrpcStatus;
  request?: unknown;
} & events.EventEmitter;

export type GrpcClientFunc = typeof Function & {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
};

export type GrpcInternalClientTypes = {
  makeClientConstructor: typeof grpcModule.makeGenericClientConstructor;
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
