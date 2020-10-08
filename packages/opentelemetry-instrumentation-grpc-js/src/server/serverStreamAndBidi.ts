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

import { Span, CanonicalCode } from '@opentelemetry/api';
import { RpcAttribute } from '@opentelemetry/semantic-conventions';
import type * as grpcJs from '@grpc/grpc-js';
import type { GrpcJsPlugin } from '../grpcJs';
import { GrpcEmitter } from '../types';
import { CALL_SPAN_ENDED, grpcStatusCodeToCanonicalCode } from '../utils';

/**
 * Handle patching for serverStream and Bidi type server handlers
 */
export function serverStreamAndBidiHandler<RequestType, ResponseType>(
  plugin: GrpcJsPlugin,
  span: Span,
  call: GrpcEmitter,
  original:
    | grpcJs.handleBidiStreamingCall<RequestType, ResponseType>
    | grpcJs.handleServerStreamingCall<RequestType, ResponseType>
): void {
  let spanEnded = false;
  const endSpan = () => {
    if (!spanEnded) {
      spanEnded = true;
      span.end();
    }
  };

  plugin.tracer.bind(call);
  call.on('finish', () => {
    // @grpc/js does not expose a way to check if this call also emitted an error,
    // e.g. call.status.code !== 0
    if (call[CALL_SPAN_ENDED]) {
      return;
    }

    // Set the "grpc call had an error" flag
    call[CALL_SPAN_ENDED] = true;

    span.setStatus({
      code: CanonicalCode.OK,
    });
    span.setAttribute(
      RpcAttribute.GRPC_STATUS_CODE,
      CanonicalCode.OK.toString()
    );

    endSpan();
  });

  call.on('error', (err: grpcJs.ServiceError) => {
    if (call[CALL_SPAN_ENDED]) {
      return;
    }

    // Set the "grpc call had an error" flag
    call[CALL_SPAN_ENDED] = true;

    span.setStatus({
      code: grpcStatusCodeToCanonicalCode(err.code),
      message: err.message,
    });
    span.setAttributes({
      [RpcAttribute.GRPC_ERROR_NAME]: err.name,
      [RpcAttribute.GRPC_ERROR_MESSAGE]: err.message,
    });
    endSpan();
  });

  // Types of parameters 'call' and 'call' are incompatible.
  return (original as Function).call({}, call);
}
