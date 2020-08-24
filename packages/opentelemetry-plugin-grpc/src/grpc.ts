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

import {
  CanonicalCode,
  context,
  propagation,
  Span,
  SpanKind,
  SpanOptions,
  Status,
} from '@opentelemetry/api';
import { RpcAttribute } from '@opentelemetry/semantic-conventions';
import { BasePlugin } from '@opentelemetry/core';
import * as events from 'events';
import * as grpcTypes from 'grpc';
import * as path from 'path';
import * as shimmer from 'shimmer';
import {
  grpc,
  GrpcClientFunc,
  GrpcInternalClientTypes,
  GrpcPluginOptions,
  ModuleExportsMapping,
  SendUnaryDataCallback,
  ServerCallWithMeta,
} from './types';
import {
  findIndex,
  _grpcStatusCodeToCanonicalCode,
  _grpcStatusCodeToSpanStatus,
  _methodIsIgnored,
  _containsOtelMetadata,
} from './utils';
import { VERSION } from './version';

/** The metadata key under which span context is stored as a binary value. */
export const GRPC_TRACE_KEY = 'grpc-trace-bin';

let grpcClientModule: GrpcInternalClientTypes;

export class GrpcPlugin extends BasePlugin<grpc> {
  static readonly component = 'grpc';
  readonly supportedVersions = ['1.*'];

  protected _config!: GrpcPluginOptions;

  constructor(readonly moduleName: string, readonly version: string) {
    super('@opentelemetry/plugin-grpc', VERSION);
    this._config = {};
  }

  protected readonly _internalFilesList: ModuleExportsMapping = {
    '0.13 - 1.6': { client: 'src/node/src/client.js' },
    '^1.7': { client: 'src/client.js' },
  };
  protected readonly _basedir = basedir;

  protected patch(): typeof grpcTypes {
    this._logger.debug(
      'applying patch to %s@%s',
      this.moduleName,
      this.version
    );

    if (this._moduleExports.Server) {
      shimmer.wrap(
        this._moduleExports.Server.prototype,
        'register',
        this._patchServer() as any
      );
    }

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
        this._patchClient()
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

    if (this._moduleExports.Server) {
      shimmer.unwrap(this._moduleExports.Server.prototype, 'register');
    }

    shimmer.unwrap(this._moduleExports, 'makeGenericClientConstructor');

    if (grpcClientModule) {
      shimmer.unwrap(grpcClientModule, 'makeClientConstructor');
    }
  }

  private _setSpanContext(metadata: grpcTypes.Metadata): void {
    propagation.inject(metadata, (metadata, k, v) =>
      metadata.set(k, v as grpcTypes.MetadataValue)
    );
  }

  private _patchServer() {
    return (originalRegister: typeof grpcTypes.Server.prototype.register) => {
      const plugin = this;
      plugin._logger.debug('patched gRPC server');

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

        shimmer.wrap(
          handlerSet,
          'func',
          (originalFunc: grpcTypes.handleCall<RequestType, ResponseType>) => {
            return function func(
              this: typeof handlerSet,
              call: ServerCallWithMeta,
              callback: SendUnaryDataCallback
            ) {
              const self = this;
              if (plugin._shouldNotTraceServerCall(call, name)) {
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
                      [RpcAttribute.GRPC_KIND]: spanOptions.kind,
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
      };
    };
  }

  /**
   * Returns true if the server call should not be traced.
   */
  private _shouldNotTraceServerCall(
    call: ServerCallWithMeta,
    name: string
  ): boolean {
    const parsedName = name.split('/');
    return (
      _containsOtelMetadata(call.metadata) ||
      _methodIsIgnored(
        parsedName[parsedName.length - 1] || name,
        this._config.ignoreGrpcMethods
      )
    );
  }

  private _clientStreamAndUnaryHandler<RequestType, ResponseType>(
    plugin: GrpcPlugin,
    span: Span,
    call: ServerCallWithMeta,
    callback: SendUnaryDataCallback,
    original:
      | grpcTypes.handleCall<RequestType, ResponseType>
      | grpcTypes.ClientReadableStream<RequestType>,
    self: {}
  ) {
    function patchedCallback(
      err: grpcTypes.ServiceError,
      value: any,
      trailer: grpcTypes.Metadata,
      flags: grpcTypes.writeFlags
    ) {
      if (err) {
        if (err.code) {
          span.setStatus({
            code: _grpcStatusCodeToCanonicalCode(err.code),
            message: err.message,
          });
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
          plugin._moduleExports.status.OK.toString()
        );
      }
      span.addEvent('received');

      // end the span
      span.end();
      return callback(err, value, trailer, flags);
    }

    plugin._tracer.bind(call);
    return (original as Function).call(self, call, patchedCallback);
  }

  private _serverStreamAndBidiHandler<RequestType, ResponseType>(
    plugin: GrpcPlugin,
    span: Span,
    call: ServerCallWithMeta,
    original: grpcTypes.handleCall<RequestType, ResponseType>,
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
        RpcAttribute.GRPC_STATUS_CODE,
        call.status.code.toString()
      );

      // if there is an error, span will be ended on error event, otherwise end it here
      if (call.status.code === 0) {
        span.addEvent('finished');
        endSpan();
      }
    });

    call.on('error', (err: grpcTypes.ServiceError) => {
      span.setStatus({
        code: _grpcStatusCodeToCanonicalCode(err.code),
        message: err.message,
      });
      span.addEvent('finished with error');
      span.setAttributes({
        [RpcAttribute.GRPC_ERROR_NAME]: err.name,
        [RpcAttribute.GRPC_ERROR_MESSAGE]: err.message,
      });
      endSpan();
    });

    return (original as any).call(self, call);
  }

  private _patchClient() {
    const plugin = this;
    return (original: typeof grpcTypes.makeGenericClientConstructor): never => {
      plugin._logger.debug('patching client');
      return function makeClientConstructor(
        this: typeof grpcTypes.Client,
        methods: { [key: string]: { originalName?: string } },
        serviceName: string,
        options: grpcTypes.GenericClientOptions
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
    client: typeof grpcTypes.Client,
    methods: { [key: string]: { originalName?: string } }
  ): string[] {
    const methodList: string[] = [];

    // For a method defined in .proto as "UnaryMethod"
    Object.entries(methods).forEach(([name, { originalName }]) => {
      if (!_methodIsIgnored(name, this._config.ignoreGrpcMethods)) {
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

  private _getPatchedClientMethods() {
    const plugin = this;
    return (original: GrpcClientFunc) => {
      plugin._logger.debug('patch all client methods');
      return function clientMethodTrace(this: grpcTypes.Client) {
        const name = `grpc.${original.path.replace('/', '')}`;
        const args = Array.prototype.slice.call(arguments);
        const metadata = plugin._getMetadata(original, args);
        if (_containsOtelMetadata(metadata)) {
          return original.apply(this, args);
        }
        const span = plugin._tracer.startSpan(name, {
          kind: SpanKind.CLIENT,
        });
        return plugin._tracer.withSpan(span, () =>
          plugin._makeGrpcClientRemoteCall(
            original,
            args,
            metadata,
            this,
            plugin
          )(span)
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
    metadata: grpcTypes.Metadata,
    self: grpcTypes.Client,
    plugin: GrpcPlugin
  ) {
    /**
     * Patches a callback so that the current span for this trace is also ended
     * when the callback is invoked.
     */
    function patchedCallback(
      span: Span,
      callback: SendUnaryDataCallback,
      metadata: grpcTypes.Metadata
    ) {
      const wrappedFn = (err: grpcTypes.ServiceError, res: any) => {
        if (err) {
          if (err.code) {
            span.setStatus(_grpcStatusCodeToSpanStatus(err.code));
            span.setAttribute(
              RpcAttribute.GRPC_STATUS_CODE,
              err.code.toString()
            );
          }
          span.setAttributes({
            [RpcAttribute.GRPC_ERROR_NAME]: err.name,
            [RpcAttribute.GRPC_ERROR_MESSAGE]: err.message,
          });
        } else {
          span.setStatus({ code: CanonicalCode.OK });
          span.setAttribute(
            RpcAttribute.GRPC_STATUS_CODE,
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

      this._setSpanContext(metadata);
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
        plugin._tracer.bind(call);
        ((call as unknown) as events.EventEmitter).on(
          'error',
          (err: grpcTypes.ServiceError) => {
            span.setStatus({
              code: _grpcStatusCodeToCanonicalCode(err.code),
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
            span.setStatus({ code: CanonicalCode.OK });
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
  }

  private _getMetadata(
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
}

const basedir = path.dirname(require.resolve('grpc'));
const version = require(path.join(basedir, 'package.json')).version;
export const plugin = new GrpcPlugin(GrpcPlugin.component, version);
