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
  CanonicalCode,
  Status,
  propagation,
} from '@opentelemetry/api';
import {
  GeneralAttribute,
  RpcAttribute,
} from '@opentelemetry/semantic-conventions';
import type * as grpcJs from '@grpc/grpc-js';
import {
  grpcStatusCodeToSpanStatus,
  findIndex,
  grpcStatusCodeToCanonicalCode,
  CALL_SPAN_ENDED,
} from '../utils';
import { EventEmitter } from 'events';

/**
 * Parse a package method list and return a list of methods to patch
 * with both possible casings e.g. "TestMethod" & "testMethod"
 */
export function getMethodsToWrap(
  client: typeof grpcJs.Client,
  methods: { [key: string]: { originalName?: string } }
): string[] {
  const methodsToWrap = [
    ...Object.keys(methods),
    ...(Object.keys(methods)
      .map(methodName => methods[methodName].originalName)
      .filter(
        originalName =>
          // eslint-disable-next-line no-prototype-builtins
          !!originalName && client.prototype.hasOwnProperty(originalName)
      ) as string[]),
  ];
  return methodsToWrap;
}

/**
 * Parse initial client call properties and start a span to trace its execution
 */
export function getPatchedClientMethods(this: GrpcJsPlugin) {
  const plugin = this;
  return (original: GrpcClientFunc) => {
    plugin._logger.debug('patch all client methods');
    return function clientMethodTrace(this: grpcJs.Client) {
      const name = `grpc.${original.path.replace('/', '')}`;
      const args = Array.prototype.slice.call(arguments);
      const span = plugin.tracer
        .startSpan(name, {
          kind: SpanKind.CLIENT,
        })
        // @todo: component attribute is deprecated
        .setAttribute(GeneralAttribute.COMPONENT, GrpcJsPlugin.component);
      return plugin.tracer.withSpan(span, () =>
        makeGrpcClientRemoteCall(original, args, this, plugin)(span)
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
        span.setStatus({ code: CanonicalCode.OK });
        span.setAttribute(
          RpcAttribute.GRPC_STATUS_CODE,
          CanonicalCode.OK.toString()
        );
      }

      span.end();
      callback(err, res);
    };
    return plugin.tracer.bind(wrappedFn);
  }

  return (span: Span) => {
    const metadata = getMetadata.call(plugin, original, args);
    // if unary or clientStream
    if (!original.responseStream) {
      const callbackFuncIndex = findIndex(args, arg => {
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
          code: grpcStatusCodeToCanonicalCode(err.code),
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
  args: unknown[]
): grpcJs.Metadata {
  let metadata: grpcJs.Metadata;

  // This finds an instance of Metadata among the arguments.
  // A possible issue that could occur is if the 'options' parameter from
  // the user contains an '_internal_repr' as well as a 'getMap' function,
  // but this is an extremely rare case.
  let metadataIndex = findIndex(args, (arg: grpcJs.Metadata) => {
    return (
      arg &&
      typeof arg === 'object' &&
      arg['internalRepr'] && // changed from _internal_repr in grpc --> @grpc/grpc-js
      typeof arg.getMap === 'function'
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
  propagation.inject(metadata, (metadata, k, v) =>
    metadata.set(k, v as grpcJs.MetadataValue)
  );
}
