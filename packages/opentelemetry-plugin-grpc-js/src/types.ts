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
import type { EventEmitter } from 'events';
import type { CALL_SPAN_ENDED } from './utils';
import { PluginConfig } from '@opentelemetry/api';

export type IgnoreMatcher = string | RegExp | ((str: string) => boolean);

export interface GrpcPluginOptions extends PluginConfig {
  /* Omits tracing on any gRPC methods that match any of
   * the IgnoreMatchers in the ignoreGrpcMethods list
   */
  ignoreGrpcMethods?: IgnoreMatcher[];
}

/**
 * Server Unary callback type
 */
export type SendUnaryDataCallback<T> = grpcJs.requestCallback<T>;

/**
 * Intersection type of all grpc server call types
 */
export type ServerCall<T, U> =
  | grpcJs.ServerUnaryCall<T, U>
  | grpcJs.ServerReadableStream<T, U>
  | grpcJs.ServerWritableStream<T, U>
  | grpcJs.ServerDuplexStream<T, U>;

/**
 * {@link ServerCall} ServerCall extended with misc. missing utility types
 */
export type ServerCallWithMeta<T, U> = ServerCall<T, U> & {
  metadata: grpcJs.Metadata;
};

/**
 * EventEmitter with span ended symbol indicator
 */
export type GrpcEmitter = EventEmitter & { [CALL_SPAN_ENDED]?: boolean };

/**
 * Grpc client callback function extended with missing utility types
 */
export type GrpcClientFunc = ((...args: unknown[]) => GrpcEmitter) & {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
};
