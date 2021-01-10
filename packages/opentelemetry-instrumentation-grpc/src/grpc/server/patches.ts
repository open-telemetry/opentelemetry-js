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
import { SendUnaryDataCallback, ServerCallWithMeta } from '../types';
import { GrpcInstrumentation } from '../../instrumentation';
import { RpcAttribute } from '@opentelemetry/semantic-conventions';
import {
  context,
  propagation,
  SpanOptions,
  SpanKind,
  setSpan,
} from '@opentelemetry/api';
import { _methodIsIgnored } from '../../utils';
import {
  clientStreamAndUnaryHandler,
  serverStreamAndBidiHandler,
} from './utils';

export const patchServer = function (
  this: GrpcInstrumentation,
  grpcModule: typeof grpcTypes
) {
  const instrumentation = this;
  return (originalRegister: typeof grpcTypes.Server.prototype.register) => {
    instrumentation.getLogger().debug('patched gRPC server');

    return function register<RequestType, ResponseType>(
      this: grpcTypes.Server & { handlers: any },
      name: string,
      handler: grpcTypes.handleCall<RequestType, ResponseType>,
      serialize: grpcTypes.serialize<RequestType>,
      deserialize: grpcTypes.deserialize<RequestType>,
      type: string
    ) {
      const originalResult = originalRegister.apply(this, arguments as any);
      const handlerSet = this.handlers[name];

      instrumentation
        .getShimmer()
        .wrap(
          handlerSet,
          'func',
          (originalFunc: grpcTypes.handleCall<RequestType, ResponseType>) => {
            return function func(
              this: typeof handlerSet,
              call: ServerCallWithMeta,
              callback: SendUnaryDataCallback
            ) {
              const self = this;
              if (shouldNotTraceServerCall(instrumentation, call, name)) {
                switch (type) {
                  case 'unary':
                  case 'client_stream':
                    return (originalFunc as Function).call(
                      self,
                      call,
                      callback
                    );
                  case 'server_stream':
                  case 'bidi':
                    return (originalFunc as Function).call(self, call);
                  default:
                    return originalResult;
                }
              }
              const spanName = `grpc.${name.replace('/', '')}`;
              const spanOptions: SpanOptions = {
                kind: SpanKind.SERVER,
              };

              instrumentation
                .getLogger()
                .debug('patch func: %s', JSON.stringify(spanOptions));

              context.with(
                propagation.extract(context.active(), call.metadata, {
                  get: (metadata, key) => metadata.get(key).map(String),
                  keys: metadata => Object.keys(metadata.getMap()),
                }),
                () => {
                  const span = instrumentation
                    .getTracer()
                    .startSpan(spanName, spanOptions)
                    .setAttributes({
                      [RpcAttribute.GRPC_KIND]: spanOptions.kind,
                    });

                  context.with(setSpan(context.active(), span), () => {
                    switch (type) {
                      case 'unary':
                      case 'client_stream':
                        return clientStreamAndUnaryHandler(
                          instrumentation,
                          grpcModule,
                          span,
                          call,
                          callback,
                          originalFunc,
                          self
                        );
                      case 'server_stream':
                      case 'bidi':
                        return serverStreamAndBidiHandler(
                          instrumentation,
                          span,
                          call,
                          originalFunc,
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
    };
  };
};

/**
 * Returns true if the server call should not be traced.
 */
const shouldNotTraceServerCall = function (
  instrumentation: GrpcInstrumentation,
  call: ServerCallWithMeta,
  name: string
): boolean {
  const parsedName = name.split('/');
  return _methodIsIgnored(
    parsedName[parsedName.length - 1] || name,
    instrumentation.getConfig().ignoreGrpcMethods
  );
};
