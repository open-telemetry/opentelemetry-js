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
import type { HandleCall } from '@grpc/grpc-js/build/src/server-call';
import { GrpcJsPlugin } from '../grpcJs';
import * as shimmer from 'shimmer';
import { ServerCallWithMeta, SendUnaryDataCallback } from '../types';
import {
  context,
  SpanOptions,
  SpanKind,
  propagation,
} from '@opentelemetry/api';
import {
  RpcAttribute,
  GeneralAttribute,
} from '@opentelemetry/semantic-conventions';
import { clientStreamAndUnaryHandler } from './clientStreamAndUnary';
import { serverStreamAndBidiHandler } from './serverStreamAndBidi';

export function patchServer(this: GrpcJsPlugin) {
  return (originalRegister: typeof grpcJs.Server.prototype.register) => {
    const plugin = this;

    plugin.logger.debug('patched gRPC server');
    return function register<RequestType, ResponseType>(
      this: grpcJs.Server,
      name: string,
      handler: HandleCall<unknown, unknown>,
      serialize: grpcJs.serialize<unknown>,
      deserialize: grpcJs.deserialize<unknown>,
      type: string
    ): boolean {
      const originalResult = originalRegister.call(
        this,
        name,
        handler,
        serialize,
        deserialize,
        type
      );
      const handlerSet = this['handlers'].get(name);

      shimmer.wrap(
        handlerSet,
        'func',
        (originalFunc: HandleCall<RequestType, ResponseType>) => {
          return function func(
            this: typeof handlerSet,
            call: ServerCallWithMeta<RequestType, ResponseType>,
            callback: SendUnaryDataCallback<ResponseType>
          ) {
            const self = this;

            const spanName = `grpc.${name.replace('/', '')}`;
            const spanOptions: SpanOptions = {
              kind: SpanKind.SERVER,
            };

            plugin.logger.debug('patch func: %s', JSON.stringify(spanOptions));

            context.with(
              propagation.extract(call.metadata, (carrier, key) =>
                carrier.get(key)
              ),
              () => {
                const span = plugin.tracer
                  .startSpan(spanName, spanOptions)
                  .setAttributes({
                    [RpcAttribute.GRPC_KIND]: spanOptions.kind,
                    // todo: component is deprecated
                    [GeneralAttribute.COMPONENT]: GrpcJsPlugin.component,
                  });

                plugin.tracer.withSpan(span, () => {
                  switch (type) {
                    case 'unary':
                    case 'clientStream':
                    case 'client_stream':
                      return clientStreamAndUnaryHandler(
                        plugin,
                        span,
                        call,
                        callback,
                        originalFunc,
                        self
                      );
                    case 'serverStream':
                    case 'server_stream':
                    case 'bidi':
                      return serverStreamAndBidiHandler(
                        plugin,
                        span,
                        call as
                          | grpcJs.ServerWritableStream<
                              RequestType,
                              ResponseType
                            >
                          | grpcJs.ServerDuplexStream<
                              RequestType,
                              ResponseType
                            >,
                        originalFunc as
                          | grpcJs.handleServerStreamingCall<
                              RequestType,
                              ResponseType
                            >
                          | grpcJs.handleBidiStreamingCall<
                              RequestType,
                              ResponseType
                            >,
                        self
                      );
                    default:
                      break;
                  }
                });
              }
            );
          };
        }
      );
      return originalResult;
    } as typeof grpcJs.Server.prototype.register;
  };
}
