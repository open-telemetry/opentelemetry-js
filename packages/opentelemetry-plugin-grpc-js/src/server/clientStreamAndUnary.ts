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

import { context, Span, SpanStatusCode } from '@opentelemetry/api';
import type { ServerCallWithMeta, SendUnaryDataCallback } from '../types';
import { grpcStatusCodeToOpenTelemetryStatusCode } from '../utils';
import type { GrpcJsPlugin } from '../grpcJs';
import type * as grpcJs from '@grpc/grpc-js';
import { AttributeNames } from '../enums';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Handle patching for clientStream and unary type server handlers
 */
export function clientStreamAndUnaryHandler<RequestType, ResponseType>(
  plugin: GrpcJsPlugin,
  span: Span,
  call: ServerCallWithMeta<RequestType, ResponseType>,
  callback: SendUnaryDataCallback<ResponseType>,
  original:
    | grpcJs.handleUnaryCall<RequestType, ResponseType>
    | grpcJs.ClientReadableStream<RequestType>
): void {
  const patchedCallback: SendUnaryDataCallback<ResponseType> = (
    err: grpcJs.ServiceError | null,
    value?: ResponseType
  ) => {
    if (err) {
      if (err.code) {
        span.setStatus({
          code: grpcStatusCodeToOpenTelemetryStatusCode(err.code),
          message: err.message,
        });
        span.setAttribute(
          SemanticAttributes.RPC_GRPC_STATUS_CODE,
          err.code.toString()
        );
      }
      span.setAttributes({
        [AttributeNames.GRPC_ERROR_NAME]: err.name,
        [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
      });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttribute(
        SemanticAttributes.RPC_GRPC_STATUS_CODE,
        SpanStatusCode.OK.toString()
      );
    }

    span.end();
    return callback(err, value);
  };

  context.bind(call);
  return (original as Function).call({}, call, patchedCallback);
}
