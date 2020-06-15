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
import { CanonicalCode, context, propagation, Span, SpanKind, SpanOptions, Status } from '@opentelemetry/api';
import { BasePlugin } from '@opentelemetry/core';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as shimmer from 'shimmer';
import { AttributeNames } from './enums/AttributeNames';
import { GrpcClientFunc, GrpcInternalClientTypes, SendUnaryDataCallback, ServerCallWithMeta } from './types';
import { findIndex, _grpcStatusCodeToCanonicalCode, _grpcStatusCodeToSpanStatus } from './utils';
import { VERSION } from './version';

let grpcClientModule: GrpcInternalClientTypes;

/**
 * @grpc/grpc-js gRPC instrumentation plugin for Opentelemetry
 * https://www.npmjs.com/package/@grpc/grpc-js
 */
export class GrpcJsPlugin extends BasePlugin<typeof grpcJs> {
  static readonly component = '@grpc/grpc-js';
  readonly supportedVersions = ['1.*'];

  protected readonly _internalFilesList = {
    '1.*': { client: 'src/client.js' },
  };

  constructor(readonly moduleName: string, readonly version: string) {
    super('@opentelemetry/plugin-grpc-js', VERSION);
  }

  protected patch(): typeof grpcJs {
    shimmer.wrap(this._moduleExports.Server.prototype, 'register', this._patchServer());

    // Wrap the externally exported client constructor
    shimmer.wrap(
      this._moduleExports,
      'makeGenericClientConstructor',
      this._patchClient()
    );

    if (this._internalFilesExports['client']) {
      grpcClientModule = this._internalFilesExports[
        'client'
      ] as GrpcInternalClientTypes;

      // Wrap the internally used client constructor
      shimmer.wrap(
        grpcClientModule,
        'makeClientConstructor',
        this._patchClient(),
      );
    } else {
      this._logger.warn(
        `internalFilesExports for ${GrpcJsPlugin.component} could not be found. Module patching may be incomplete`
      );
    }

    return this._moduleExports;
  }

  protected unpatch(): void {
    this._logger.debug(
      'removing patch to %s@%s',
      this.moduleName,
      this.version
    );

    shimmer.unwrap(this._moduleExports.Server.prototype, 'register');

    shimmer.unwrap(this._moduleExports, 'makeGenericClientConstructor');

    if (grpcClientModule) {
      shimmer.unwrap(grpcClientModule, 'makeClientConstructor');
    }
  }

  private _patchServer() {
    return (originalRegister: typeof grpcJs.Server.prototype.register) => {
      const plugin = this;

      plugin._logger.debug('patched gRPC server');
      return function register<RequestType, ResponseType>(
        this: grpcJs.Server,
        name: string,
        handler: HandleCall<RequestType, ResponseType>,
        serialize: grpcJs.serialize<ResponseType>,
        deserialize: grpcJs.deserialize<RequestType>,
        type: string,
      ): boolean {
        const originalResult = originalRegister.apply(this, arguments as any);
        const handlerSet = this['handlers'][name];

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

              plugin._logger.debug(
                'patch func: %s',
                JSON.stringify(spanOptions)
              );

              context.with(
                propagation.extract(call.metadata, (carrier, key) =>
                  carrier.get(key)
                ),
                () => {
                  const span = plugin._tracer
                    .startSpan(spanName, spanOptions)
                    .setAttributes({
                      [AttributeNames.GRPC_KIND]: spanOptions.kind,
                      // todo: component is deprecated
                      [AttributeNames.COMPONENT]: GrpcJsPlugin.component,
                    });

                  plugin._tracer.withSpan(span, () => {
                    switch (type) {
                      case 'unary':
                      case 'client_stream':
                        return plugin._clientStreamAndUnaryHandler(
                          plugin,
                          span,
                          call,
                          callback,
                          originalFunc,
                          self
                        );
                      case 'server_stream':
                      case 'bidi':
                        return plugin._serverStreamAndBidiHandler(
                          plugin,
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
      } as typeof grpcJs.Server.prototype.register;
    };
  }

  private _clientStreamAndUnaryHandler<RequestType, ResponseType>(
    plugin: GrpcJsPlugin,
    span: Span,
    call: ServerCallWithMeta<RequestType, ResponseType>,
    callback: SendUnaryDataCallback<ResponseType>,
    original:
      | HandleCall<RequestType, ResponseType>
      | grpcJs.ClientReadableStream<RequestType>,
    self: {}
  ) {
    const patchedCallback: SendUnaryDataCallback<ResponseType> = (
      err: grpcJs.ServiceError | null,
      value?: ResponseType,
     ) => {
      if (err) {
        if (err.code) {
          span.setStatus({
            code: _grpcStatusCodeToCanonicalCode(err.code),
            message: err.message,
          });
          span.setAttribute(
            AttributeNames.GRPC_STATUS_CODE,
            err.code.toString()
          );
        }
        span.setAttributes({
          [AttributeNames.GRPC_ERROR_NAME]: err.name,
          [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
        });
      } else {
        span.setStatus({ code: CanonicalCode.OK });
        span.setAttribute(
          AttributeNames.GRPC_STATUS_CODE,
          plugin._moduleExports.status.OK.toString()
        );
      }
      span.addEvent('received');

      // end the span
      span.end();
      return callback(err, value);
    }

    plugin._tracer.bind(call);
    return (original as Function).call(self, call, patchedCallback);
  }

  private _serverStreamAndBidiHandler<RequestType, ResponseType>(
    plugin: GrpcJsPlugin,
    span: Span,
    call: ServerCallWithMeta<RequestType, ResponseType>,
    original: HandleCall<RequestType, ResponseType>,
    self: {}
  ) {
    let spanEnded = false;
    const endSpan = () => {
      if (!spanEnded) {
        spanEnded = true;
        span.end();
      }
    };

    plugin._tracer.bind(call);
    call.on('finish', () => {
      span.setStatus(_grpcStatusCodeToSpanStatus(call.status.code));
      span.setAttribute(
        AttributeNames.GRPC_STATUS_CODE,
        call.status.code.toString()
      );

      // if there is an error, span will be ended on error event, otherwise end it here
      if (call.status.code === 0) {
        span.addEvent('finished');
        endSpan();
      }
    });

    call.on('error', (err: grpcJs.ServiceError) => {
      span.setStatus({
        code: _grpcStatusCodeToCanonicalCode(err.code),
        message: err.message,
      });
      span.addEvent('finished with error');
      span.setAttributes({
        [AttributeNames.GRPC_ERROR_NAME]: err.name,
        [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
      });
      endSpan();
    });

    return (original as any).call(self, call);
  }

  private _patchClient() {
    const plugin = this;
    return (original: typeof grpcJs.makeGenericClientConstructor): never => {
      plugin._logger.debug('patching client');
      return function makeClientConstructor(
        this: typeof grpcJs.Client,
        methods: { [key: string]: { originalName?: string } },
        serviceName: string,
        options: unknown,
      ) {
        const client = original.apply(this, arguments as any);
        shimmer.massWrap(
          client.prototype as never,
          plugin._getMethodsToWrap(client, methods) as never[],
          plugin._getPatchedClientMethods() as any
        );
        return client;
      } as never;
    };
  }

  private _getMethodsToWrap(
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

  private _getPatchedClientMethods() {
    const plugin = this;
    return (original: GrpcClientFunc) => {
      plugin._logger.debug('patch all client methods');
      return function clientMethodTrace(this: grpcJs.Client) {
        const name = `grpc.${original.path.replace('/', '')}`;
        const args = Array.prototype.slice.call(arguments);
        const span = plugin._tracer
          .startSpan(name, {
            kind: SpanKind.CLIENT,
          })
          // @todo: component attribute is deprecated
          .setAttribute(AttributeNames.COMPONENT, GrpcJsPlugin.component);
        return plugin._tracer.withSpan(span, () =>
          plugin._makeGrpcClientRemoteCall(original, args, this, plugin)(span)
        );
      };
    };
  }

  /**
   * This method handles the client remote call
   */
  private _makeGrpcClientRemoteCall(
    original: GrpcClientFunc,
    args: any[],
    self: grpcJs.Client,
    plugin: GrpcJsPlugin
  ) {
    /**
     * Patches a callback so that the current span for this trace is also ended
     * when the callback is invoked.
     */
    function patchedCallback(
      span: Span,
      callback: SendUnaryDataCallback<ResponseType>,
      metadata: grpcJs.Metadata
    ) {
      const wrappedFn = (err: grpcJs.ServiceError, res: any) => {
        if (err) {
          if (err.code) {
            span.setStatus(_grpcStatusCodeToSpanStatus(err.code));
            span.setAttribute(
              AttributeNames.GRPC_STATUS_CODE,
              err.code.toString()
            );
          }
          span.setAttributes({
            [AttributeNames.GRPC_ERROR_NAME]: err.name,
            [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
          });
        } else {
          span.setStatus({ code: CanonicalCode.OK });
          span.setAttribute(
            AttributeNames.GRPC_STATUS_CODE,
            plugin._moduleExports.status.OK.toString()
          );
        }

        span.end();
        callback(err, res);
      };
      return plugin._tracer.bind(wrappedFn);
    }

    return (span: Span) => {
      if (!span) {
        return original.apply(self, args);
      }

      const metadata = this._getMetadata(original, args);
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
        [AttributeNames.GRPC_METHOD]: original.path,
        [AttributeNames.GRPC_KIND]: SpanKind.CLIENT,
      });

      this._setSpanContext(metadata);
      const call = original.apply(self, args) as unknown as EventEmitter;

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
        plugin._tracer.bind(call);
        call.on(
          'error',
          (err: grpcJs.ServiceError) => {
            span.setStatus({
              code: _grpcStatusCodeToCanonicalCode(err.code),
              message: err.message,
            });
            span.setAttributes({
              [AttributeNames.GRPC_ERROR_NAME]: err.name,
              [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
            });
            endSpan();
          }
        );

        call.on(
          'status',
          (status: Status) => {
            span.setStatus({ code: CanonicalCode.OK });
            span.setAttribute(
              AttributeNames.GRPC_STATUS_CODE,
              status.code.toString()
            );
            endSpan();
          }
        );
      }
      return call;
    };
  }

  private _getMetadata(
    original: GrpcClientFunc,
    args: any[]
  ): grpcJs.Metadata {
    let metadata: grpcJs.Metadata;

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
      metadata = new this._moduleExports.Metadata();
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
  }

  private _setSpanContext(metadata: grpcJs.Metadata): void {
    propagation.inject(metadata, (metadata, k, v) =>
      metadata.set(k, v as grpcJs.MetadataValue)
    );
  }

}

const basedir = path.dirname(require.resolve(GrpcJsPlugin.component));
const version = require(path.join(basedir, 'package.json')).version;
export const plugin = new GrpcJsPlugin(GrpcJsPlugin.component, version);
