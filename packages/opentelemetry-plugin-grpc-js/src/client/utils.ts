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

import { GrpcJsPlugin } from '../grpcJs';
import type { GrpcClientFunc, SendUnaryDataCallback } from '../types';
import {
  SpanKind,
  Span,
  StatusCode,
  Status,
  propagation,
  context,
} from '@opentelemetry/api';
import { RpcAttribute } from '@opentelemetry/semantic-conventions';
import type * as grpcJs from '@grpc/grpc-js';
import {
  grpcStatusCodeToSpanStatus,
  grpcStatusCodeToOpenTelemetryStatusCode,
  CALL_SPAN_ENDED,
  methodIsIgnored,
} from '../utils';
import { EventEmitter } from 'events';

/**
 * Parse a package method list and return a list of methods to patch
 * with both possible casings e.g. "TestMethod" & "testMethod"
 */
export function getMethodsToWrap(
  this: GrpcJsPlugin,
  client: typeof grpcJs.Client,
  methods: { [key: string]: { originalName?: string } }
): string[] {
  const methodList: string[] = [];

  // For a method defined in .proto as "UnaryMethod"
  Object.entries(methods).forEach(([name, { originalName }]) => {
    if (!methodIsIgnored(name, this._config.ignoreGrpcMethods)) {
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
}

/**
 * Parse initial client call properties and start a span to trace its execution
 */
export function getPatchedClientMethods(
  this: GrpcJsPlugin
): (original: GrpcClientFunc) => () => EventEmitter {
  const plugin = this;
  return (original: GrpcClientFunc) => {
    plugin._logger.debug('patch all client methods');
    return function clientMethodTrace(this: grpcJs.Client) {
      const name = `grpc.${original.path.replace('/', '')}`;
      const args = [...arguments];
      const metadata = getMetadata.call(plugin, original, args);
      const span = plugin.tracer.startSpan(name, {
        kind: SpanKind.CLIENT,
      });
      return plugin.tracer.withSpan(span, () =>
        makeGrpcClientRemoteCall(original, args, metadata, this, plugin)(span)
      );
    };
  };
}

/**
 * Execute grpc client call. Apply completitionspan properties and end the
 * span on callback or receiving an emitted event.
 */
export function makeGrpcClientRemoteCall(
  original: GrpcClientFunc,
  args: unknown[],
  metadata: grpcJs.Metadata,
  self: grpcJs.Client,
  plugin: GrpcJsPlugin
): (span: Span) => EventEmitter {
  /**
   * Patches a callback so that the current span for this trace is also ended
   * when the callback is invoked.
   */
  function patchedCallback(
    span: Span,
    callback: SendUnaryDataCallback<ResponseType>
  ) {
    const wrappedFn: SendUnaryDataCallback<ResponseType> = (
      err: grpcJs.ServiceError | null,
      res
    ) => {
      if (err) {
        if (err.code) {
          span.setStatus(grpcStatusCodeToSpanStatus(err.code));
          span.setAttribute(RpcAttribute.GRPC_STATUS_CODE, err.code.toString());
        }
        span.setAttributes({
          [RpcAttribute.GRPC_ERROR_NAME]: err.name,
          [RpcAttribute.GRPC_ERROR_MESSAGE]: err.message,
        });
      } else {
        span.setStatus({ code: StatusCode.OK });
        span.setAttribute(
          RpcAttribute.GRPC_STATUS_CODE,
          StatusCode.OK.toString()
        );
      }

      span.end();
      callback(err, res);
    };
    return plugin.tracer.bind(wrappedFn);
  }

  return (span: Span) => {
    // if unary or clientStream
    if (!original.responseStream) {
      const callbackFuncIndex = args.findIndex(arg => {
        return typeof arg === 'function';
      });
      if (callbackFuncIndex !== -1) {
        args[callbackFuncIndex] = patchedCallback(
          span,
          args[callbackFuncIndex] as SendUnaryDataCallback<ResponseType>
        );
      }
    }

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
      plugin.tracer.bind(call);
      call.on('error', (err: grpcJs.ServiceError) => {
        if (call[CALL_SPAN_ENDED]) {
          return;
        }
        call[CALL_SPAN_ENDED] = true;

        span.setStatus({
          code: grpcStatusCodeToOpenTelemetryStatusCode(err.code),
          message: err.message,
        });
        span.setAttributes({
          [RpcAttribute.GRPC_ERROR_NAME]: err.name,
          [RpcAttribute.GRPC_ERROR_MESSAGE]: err.message,
        });

        endSpan();
      });

      call.on('status', (status: Status) => {
        if (call[CALL_SPAN_ENDED]) {
          return;
        }
        call[CALL_SPAN_ENDED] = true;

        span.setStatus(grpcStatusCodeToSpanStatus(status.code));

        endSpan();
      });
    }
    return call;
  };
}

/**
 * Returns the metadata argument from user provided arguments (`args`)
 */
function getMetadata(
  this: GrpcJsPlugin,
  original: GrpcClientFunc,
  args: Array<unknown | grpcJs.Metadata>
): grpcJs.Metadata {
  let metadata: grpcJs.Metadata;

  // This finds an instance of Metadata among the arguments.
  // A possible issue that could occur is if the 'options' parameter from
  // the user contains an '_internal_repr' as well as a 'getMap' function,
  // but this is an extremely rare case.
  let metadataIndex = args.findIndex((arg: unknown | grpcJs.Metadata) => {
    return (
      arg &&
      typeof arg === 'object' &&
      (arg as grpcJs.Metadata)['internalRepr'] && // changed from _internal_repr in grpc --> @grpc/grpc-js https://github.com/grpc/grpc-node/blob/95289edcaf36979cccf12797cc27335da8d01f03/packages/grpc-js/src/metadata.ts#L88
      typeof (arg as grpcJs.Metadata).getMap === 'function'
    );
  });
  if (metadataIndex === -1) {
    metadata = new this._moduleExports.Metadata();
    if (!original.requestStream) {
      // unary or server stream
      metadataIndex = 1;
    } else {
      // client stream or bidi
      metadataIndex = 0;
    }
    args.splice(metadataIndex, 0, metadata);
  } else {
    metadata = args[metadataIndex] as grpcJs.Metadata;
  }
  return metadata;
}

/**
 * Inject opentelemetry trace context into `metadata` for use by another
 * grpc receiver
 * @param metadata
 */
export function setSpanContext(metadata: grpcJs.Metadata): void {
  propagation.inject(context.active(), metadata, {
    set: (metadata, k, v) => metadata.set(k, v as grpcJs.MetadataValue),
  });
}
