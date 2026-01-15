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

import type { EventEmitter } from 'events';
import type { Span, SpanStatus } from '@opentelemetry/api';
import type { Client, Metadata, ServiceError } from '@grpc/grpc-js';
import type * as grpcJs from '@grpc/grpc-js';
import type { GrpcInstrumentation } from './';
import type {
  GrpcClientFunc,
  SendUnaryDataCallback,
  metadataCaptureType,
} from './internal-types';

import { propagation, context } from '@opentelemetry/api';
import { AttributeNames } from './enums/AttributeNames';
import {
  ATTR_RPC_GRPC_STATUS_CODE,
  RPC_GRPC_STATUS_CODE_VALUE_OK,
} from './semconv';
import {
  _grpcStatusCodeToSpanStatus,
  _grpcStatusCodeToOpenTelemetryStatusCode,
  _methodIsIgnored,
} from './utils';
import { errorMonitor } from 'events';

/**
 * Parse a package method list and return a list of methods to patch
 * with both possible casings e.g. "TestMethod" & "testMethod"
 */
export function getMethodsToWrap(
  this: GrpcInstrumentation,
  client: typeof Client,
  methods: { [key: string]: { originalName?: string } }
): string[] {
  const methodList: string[] = [];

  // For a method defined in .proto as "UnaryMethod"
  Object.entries(methods).forEach(([name, { originalName }]) => {
    if (!_methodIsIgnored(name, this.getConfig().ignoreGrpcMethods)) {
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
 * Patches a callback so that the current span for this trace is also ended
 * when the callback is invoked.
 */
export function patchedCallback<T>(
  span: Span,
  callback: SendUnaryDataCallback<T>
) {
  const wrappedFn: SendUnaryDataCallback<T> = (
    err: grpcJs.ServiceError | null,
    res?: T
  ) => {
    if (err) {
      if (err.code) {
        span.setStatus(_grpcStatusCodeToSpanStatus(err.code));
        span.setAttribute(ATTR_RPC_GRPC_STATUS_CODE, err.code);
      }
      span.setAttributes({
        [AttributeNames.GRPC_ERROR_NAME]: err.name,
        [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
      });
    } else {
      span.setAttribute(
        ATTR_RPC_GRPC_STATUS_CODE,
        RPC_GRPC_STATUS_CODE_VALUE_OK
      );
    }

    span.end();
    callback(err, res);
  };
  return context.bind(context.active(), wrappedFn);
}

export function patchResponseMetadataEvent(
  span: Span,
  call: EventEmitter,
  metadataCapture: metadataCaptureType
) {
  call.on('metadata', (responseMetadata: Metadata) => {
    metadataCapture.client.captureResponseMetadata(span, responseMetadata);
  });
}

export function patchResponseStreamEvents(span: Span, call: EventEmitter) {
  // Both error and status events can be emitted
  // the first one emitted set spanEnded to true
  let spanEnded = false;
  const endSpan = () => {
    if (!spanEnded) {
      span.end();
      spanEnded = true;
    }
  };
  context.bind(context.active(), call);
  call.on(errorMonitor, (err: ServiceError) => {
    if (spanEnded) {
      return;
    }

    span.setStatus({
      code: _grpcStatusCodeToOpenTelemetryStatusCode(err.code),
      message: err.message,
    });
    span.setAttributes({
      [AttributeNames.GRPC_ERROR_NAME]: err.name,
      [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
      [ATTR_RPC_GRPC_STATUS_CODE]: err.code,
    });

    endSpan();
  });

  call.on('status', (status: SpanStatus) => {
    if (spanEnded) {
      return;
    }

    span.setStatus(_grpcStatusCodeToSpanStatus(status.code));
    span.setAttribute(ATTR_RPC_GRPC_STATUS_CODE, status.code);

    endSpan();
  });
}

/**
 * Execute grpc client call. Apply completion span properties and end the
 * span on callback or receiving an emitted event.
 */
export function makeGrpcClientRemoteCall(
  metadataCapture: metadataCaptureType,
  original: GrpcClientFunc,
  args: unknown[],
  metadata: grpcJs.Metadata,
  self: grpcJs.Client
): (span: Span) => EventEmitter {
  return (span: Span) => {
    // if unary or clientStream
    if (!original.responseStream) {
      const callbackFuncIndex = args.findIndex(arg => {
        return typeof arg === 'function';
      });
      if (callbackFuncIndex !== -1) {
        args[callbackFuncIndex] = patchedCallback(
          span,
          args[callbackFuncIndex] as SendUnaryDataCallback<unknown>
        );
      }
    }

    setSpanContext(metadata);
    const call = original.apply(self, args);

    call.on('metadata', responseMetadata => {
      metadataCapture.client.captureResponseMetadata(span, responseMetadata);
    });

    // if server stream or bidi
    if (original.responseStream) {
      patchResponseStreamEvents(span, call);
    }
    return call;
  };
}

export function getMetadataIndex(args: Array<unknown | Metadata>): number {
  // This finds an instance of Metadata among the arguments.
  // A possible issue that could occur is if the 'options' parameter from
  // the user contains an '_internal_repr' as well as a 'getMap' function,
  // but this is an extremely rare case.
  return args.findIndex((arg: unknown | Metadata) => {
    return (
      arg &&
      typeof arg === 'object' &&
      (arg as Metadata)['internalRepr'] && // changed from _internal_repr in grpc --> @grpc/grpc-js https://github.com/grpc/grpc-node/blob/95289edcaf36979cccf12797cc27335da8d01f03/packages/grpc-js/src/metadata.ts#L88
      typeof (arg as Metadata).getMap === 'function'
    );
  });
}

/**
 * Returns the metadata argument from user provided arguments (`args`)
 * If no metadata is provided in `args`: adds empty metadata to `args` and returns that empty metadata
 */
export function extractMetadataOrSplice(
  grpcLib: typeof grpcJs,
  args: Array<unknown | grpcJs.Metadata>,
  spliceIndex: number
) {
  let metadata: grpcJs.Metadata;
  const metadataIndex = getMetadataIndex(args);
  if (metadataIndex === -1) {
    // Create metadata if it does not exist
    metadata = new grpcLib.Metadata();
    args.splice(spliceIndex, 0, metadata);
  } else {
    metadata = args[metadataIndex] as Metadata;
  }
  return metadata;
}

/**
 * Returns the metadata argument from user provided arguments (`args`)
 * Adds empty metadata to arguments if the default is used.
 */
export function extractMetadataOrSpliceDefault(
  grpcClient: typeof grpcJs,
  original: GrpcClientFunc,
  args: Array<unknown | grpcJs.Metadata>
): grpcJs.Metadata {
  return extractMetadataOrSplice(
    grpcClient,
    args,
    original.requestStream ? 0 : 1
  );
}

/**
 * Inject opentelemetry trace context into `metadata` for use by another
 * grpc receiver
 * @param metadata
 */
export function setSpanContext(metadata: Metadata): void {
  propagation.inject(context.active(), metadata, {
    set: (meta, k, v) => meta.set(k, v),
  });
}
