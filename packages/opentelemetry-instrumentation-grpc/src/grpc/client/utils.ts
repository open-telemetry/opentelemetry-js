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
import type * as events from 'events';
import { SendUnaryDataCallback, GrpcClientFunc } from '../types';
import { GrpcInstrumentation } from '../../instrumentation';
import { RpcAttribute } from '@opentelemetry/semantic-conventions';
import {
  context,
  Span,
  StatusCode,
  SpanKind,
  setSpan,
  Status,
  propagation,
} from '@opentelemetry/api';
import {
  _methodIsIgnored,
  _grpcStatusCodeToSpanStatus,
  _grpcStatusCodeToOpenTelemetryStatusCode,
  findIndex,
} from '../../utils';

export const getMethodsToWrap = function (
  instrumentation: GrpcInstrumentation,
  client: typeof grpcTypes.Client,
  methods: { [key: string]: { originalName?: string } }
): string[] {
  const methodList: string[] = [];

  // For a method defined in .proto as "UnaryMethod"
  Object.entries(methods).forEach(([name, { originalName }]) => {
    if (
      !_methodIsIgnored(name, instrumentation.getConfig().ignoreGrpcMethods)
    ) {
      methodList.push(name); // adds camel case method name: "unaryMethod"
      if (
        originalName &&
        // eslint-disable-next-line no-prototype-builtins
        client.prototype.hasOwnProperty(originalName) &&
        name !== originalName // do not add duplicates
      ) {
        // adds original method name: "UnaryMethod",
        methodList.push(originalName);
      }
    }
  });
  return methodList;
};

export const getPatchedClientMethods = function (
  this: GrpcInstrumentation,
  grpcClient: typeof grpcTypes
) {
  const instrumentation = this;
  return (original: GrpcClientFunc) => {
    instrumentation.getLogger().debug('patch all client methods');
    return function clientMethodTrace(this: grpcTypes.Client) {
      const name = `grpc.${original.path.replace('/', '')}`;
      const args = Array.prototype.slice.call(arguments);
      const metadata = getMetadata(grpcClient, original, args);
      const span = instrumentation.getTracer().startSpan(name, {
        kind: SpanKind.CLIENT,
      });
      return context.with(setSpan(context.active(), span), () =>
        makeGrpcClientRemoteCall(
          grpcClient,
          original,
          args,
          metadata,
          this
        )(span)
      );
    };
  };
};

/**
 * This method handles the client remote call
 */
const makeGrpcClientRemoteCall = function (
  grpcClient: typeof grpcTypes,
  original: GrpcClientFunc,
  args: any[],
  metadata: grpcTypes.Metadata,
  self: grpcTypes.Client
) {
  /**
   * Patches a callback so that the current span for this trace is also ended
   * when the callback is invoked.
   */
  function patchedCallback(
    span: Span,
    callback: SendUnaryDataCallback,
    _metadata: grpcTypes.Metadata
  ) {
    const wrappedFn = (err: grpcTypes.ServiceError, res: any) => {
      if (err) {
        if (err.code) {
          span.setStatus(_grpcStatusCodeToSpanStatus(err.code));
          span.setAttribute(RpcAttribute.GRPC_STATUS_CODE, err.code.toString());
        }
        span.setAttributes({
          [RpcAttribute.GRPC_ERROR_NAME]: err.name,
          [RpcAttribute.GRPC_ERROR_MESSAGE]: err.message,
        });
      } else {
        span.setStatus({ code: StatusCode.UNSET });
        span.setAttribute(
          RpcAttribute.GRPC_STATUS_CODE,
          grpcClient.status.OK.toString()
        );
      }

      span.end();
      callback(err, res);
    };
    return context.bind(wrappedFn);
  }

  return (span: Span) => {
    if (!span) {
      return original.apply(self, args);
    }

    // if unary or clientStream
    if (!original.responseStream) {
      const callbackFuncIndex = findIndex(args, arg => {
        return typeof arg === 'function';
      });
      if (callbackFuncIndex !== -1) {
        args[callbackFuncIndex] = patchedCallback(
          span,
          args[callbackFuncIndex],
          metadata
        );
      }
    }

    span.addEvent('sent');
    span.setAttributes({
      [RpcAttribute.GRPC_METHOD]: original.path,
      [RpcAttribute.GRPC_KIND]: SpanKind.CLIENT,
    });

    setSpanContext(metadata);
    const call = original.apply(self, args);

    // if server stream or bidi
    if (original.responseStream) {
      // Both error and status events can be emitted
      // the first one emitted set spanEnded to true
      let spanEnded = false;
      const endSpan = () => {
        if (!spanEnded) {
          span.end();
          spanEnded = true;
        }
      };
      context.bind(call);
      ((call as unknown) as events.EventEmitter).on(
        'error',
        (err: grpcTypes.ServiceError) => {
          span.setStatus({
            code: _grpcStatusCodeToOpenTelemetryStatusCode(err.code),
            message: err.message,
          });
          span.setAttributes({
            [RpcAttribute.GRPC_ERROR_NAME]: err.name,
            [RpcAttribute.GRPC_ERROR_MESSAGE]: err.message,
          });
          endSpan();
        }
      );

      ((call as unknown) as events.EventEmitter).on(
        'status',
        (status: Status) => {
          span.setStatus({ code: StatusCode.UNSET });
          span.setAttribute(
            RpcAttribute.GRPC_STATUS_CODE,
            status.code.toString()
          );
          endSpan();
        }
      );
    }
    return call;
  };
};

const getMetadata = function (
  grpcClient: typeof grpcTypes,
  original: GrpcClientFunc,
  args: any[]
): grpcTypes.Metadata {
  let metadata: grpcTypes.Metadata;

  // This finds an instance of Metadata among the arguments.
  // A possible issue that could occur is if the 'options' parameter from
  // the user contains an '_internal_repr' as well as a 'getMap' function,
  // but this is an extremely rare case.
  let metadataIndex = findIndex(args, (arg: any) => {
    return (
      arg &&
      typeof arg === 'object' &&
      arg._internal_repr &&
      typeof arg.getMap === 'function'
    );
  });
  if (metadataIndex === -1) {
    metadata = new grpcClient.Metadata();
    if (!original.requestStream) {
      // unary or server stream
      if (args.length === 0) {
        // No argument (for the gRPC call) was provided, so we will have to
        // provide one, since metadata cannot be the first argument.
        // The internal representation of argument defaults to undefined
        // in its non-presence.
        // Note that we can't pass null instead of undefined because the
        // serializer within gRPC doesn't accept it.
        args.push(undefined);
      }
      metadataIndex = 1;
    } else {
      // client stream or bidi
      metadataIndex = 0;
    }
    args.splice(metadataIndex, 0, metadata);
  } else {
    metadata = args[metadataIndex];
  }
  return metadata;
};

const setSpanContext = function (metadata: grpcTypes.Metadata): void {
  propagation.inject(context.active(), metadata, {
    set: (metadata, k, v) => metadata.set(k, v as grpcTypes.MetadataValue),
  });
};
