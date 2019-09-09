/**
 * Copyright 2019, OpenTelemetry Authors
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

import { BasePlugin } from '@opentelemetry/core';
import {
  SpanKind,
  SpanOptions,
  Span,
  Status,
  CanonicalCode,
  SpanContext,
} from '@opentelemetry/types';
import { AttributeNames } from './enums/AttributeNames';
import {
  grpc,
  ModuleExportsMapping,
  ModuleNameToFilePath,
  GrpcPluginOptions,
  ServerCallWithMeta,
  SendUnaryDataCallback,
  GrpcClientFunc,
} from './types';
import {
  findIndex,
  _grpcStatusCodeToCanonicalCode,
  _grpcStatusCodeToSpanStatus,
} from './utils';

import * as events from 'events';
import * as grpcModule from 'grpc';
import * as shimmer from 'shimmer';
import * as semver from 'semver';
import * as path from 'path';

/** The metadata key under which span context is stored as a binary value. */
export const GRPC_TRACE_KEY = 'grpc-trace-bin';

let grpcClientModule: object;

export class GrpcPlugin extends BasePlugin<grpc> {
  static readonly component = 'grpc';

  options!: GrpcPluginOptions;

  constructor(public moduleName: string, public version: string) {
    super();
    // TODO: remove this once options will be passed
    // see https://github.com/open-telemetry/opentelemetry-js/issues/210
    this.options = {};
  }

  // TODO: Delete if moving internal file loaders to BasePlugin
  // --- Note: Incorrectly ordered: Begin internal file loader --- //
  // tslint:disable-next-line:no-any
  protected internalFilesExports: { [key: string]: any } | undefined;
  protected readonly internalFileList: ModuleExportsMapping = {
    '0.13 - 1.6': { client: 'src/node/src/client.js' },
    '^1.7': { client: 'src/client.js' },
  };

  /**
   * Load internal files according to version range
   */
  private _loadInternalFiles(): ModuleExportsMapping {
    let result: ModuleExportsMapping = {};
    if (this.internalFileList) {
      this._logger.debug('loadInternalFiles %o', this.internalFileList);
      Object.keys(this.internalFileList).forEach(versionRange => {
        if (semver.satisfies(this.version, versionRange)) {
          if (result) {
            this._logger.warn(
              'Plugin for %s@%s, has overlap version range (%s) for internal files: %o',
              this.moduleName,
              this.version,
              versionRange,
              this.internalFileList
            );
          }
          result = this._loadInternalModuleFiles(
            this.internalFileList[versionRange],
            basedir
          );
        }
      });
      if (Object.keys(result).length === 0) {
        this._logger.debug(
          'No internal file could be loaded for %s@%s',
          this.moduleName,
          this.version
        );
      }
    }
    return result;
  }

  /**
   * Load internal files from a module and set internalFilesExports
   */
  private _loadInternalModuleFiles(
    extraModulesList: ModuleNameToFilePath,
    basedir: string
  ): ModuleExportsMapping {
    const extraModules: ModuleExportsMapping = {};
    if (extraModulesList) {
      Object.keys(extraModulesList).forEach(moduleName => {
        try {
          this._logger.debug('loading File %s', extraModulesList[moduleName]);
          extraModules[moduleName] = require(path.join(
            basedir,
            extraModulesList[moduleName]
          ));
        } catch (e) {
          this._logger.error(
            'Could not load internal file %s of module %s. Error: %s',
            path.join(basedir, extraModulesList[moduleName]),
            this.moduleName,
            e.message
          );
        }
      });
    }
    return extraModules;
  }
  // --- End of internal file loader stuff --- //

  protected patch(): typeof grpcModule {
    if (!this.internalFilesExports) {
      this.internalFilesExports = this._loadInternalFiles();
    }
    this._logger.debug(
      'applying patch to %s@%s',
      this.moduleName,
      this.version
    );

    if (this._moduleExports.Server) {
      shimmer.wrap(
        this._moduleExports.Server.prototype,
        'register',
        // tslint:disable-next-line:no-any
        this._patchServer() as any
      );
    }

    if (this.internalFilesExports && this.internalFilesExports['client']) {
      grpcClientModule = this.internalFilesExports['client'];

      shimmer.wrap(
        grpcClientModule,
        'makeClientConstructor' as never,
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

    if (grpcClientModule) {
      shimmer.unwrap(grpcClientModule, 'makeClientConstructor' as never);
    }
  }

  private _getSpanContext(metadata: grpcModule.Metadata): SpanContext | null {
    const metadataValue = metadata.getMap()[GRPC_TRACE_KEY] as Buffer;
    // Entry doesn't exist
    if (!metadataValue) {
      return null;
    }
    return this._tracer.getBinaryFormat().fromBytes(metadataValue);
  }

  private _setSpanContext(
    metadata: grpcModule.Metadata,
    spanContext: SpanContext
  ): void {
    const serializedSpanContext = this._tracer
      .getBinaryFormat()
      .toBytes(spanContext);
    const buffer = Buffer.from(serializedSpanContext);
    metadata.set(GRPC_TRACE_KEY, buffer);
  }

  private _patchServer() {
    return (originalRegister: typeof grpcModule.Server.prototype.register) => {
      const plugin = this;
      plugin._logger.debug('patched gRPC server');

      return function register<RequestType, ResponseType>(
        // tslint:disable-next-line:no-any
        this: grpcModule.Server & { handlers: any },
        name: string,
        handler: grpcModule.handleCall<RequestType, ResponseType>,
        serialize: grpcModule.serialize<RequestType>,
        deserialize: grpcModule.deserialize<RequestType>,
        type: string
      ) {
        // tslint:disable-next-line:no-any
        const originalResult = originalRegister.apply(this, arguments as any);
        const handlerSet = this.handlers[name];

        shimmer.wrap(
          handlerSet,
          'func',
          (originalFunc: grpcModule.handleCall<RequestType, ResponseType>) => {
            return function func(
              this: typeof handlerSet,
              call: ServerCallWithMeta,
              callback: SendUnaryDataCallback
            ) {
              const self = this;

              const spanName = `grpc.${name.replace('/', '')}`;
              const parentSpan = plugin._getSpanContext(call.metadata);
              const spanOptions: SpanOptions = {
                kind: SpanKind.SERVER,
                parent: parentSpan || undefined,
              };

              plugin._logger.debug(
                'patch func: %s',
                JSON.stringify(spanOptions)
              );

              const span = plugin._tracer
                .startSpan(spanName, spanOptions)
                .setAttributes({
                  [AttributeNames.GRPC_KIND]: spanOptions.kind,
                  [AttributeNames.COMPONENT]: GrpcPlugin.component,
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
            };
          }
        );

        return originalResult;
      };
    };
  }

  private _clientStreamAndUnaryHandler<RequestType, ResponseType>(
    plugin: GrpcPlugin,
    span: Span,
    call: ServerCallWithMeta,
    callback: SendUnaryDataCallback,
    original:
      | grpcModule.handleCall<RequestType, ResponseType>
      | grpcModule.ClientReadableStream<RequestType>,
    self: {}
  ) {
    function patchedCallback(
      err: grpcModule.ServiceError,
      // tslint:disable-next-line:no-any
      value: any,
      trailer: grpcModule.Metadata,
      flags: grpcModule.writeFlags
    ) {
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
          grpcModule.status.OK.toString()
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
    original: grpcModule.handleCall<RequestType, ResponseType>,
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

    call.on('error', (err: grpcModule.ServiceError) => {
      span.addEvent('finished with error');
      span.setAttributes({
        [AttributeNames.GRPC_ERROR_NAME]: err.name,
        [AttributeNames.GRPC_ERROR_MESSAGE]: err.message,
      });
      endSpan();
    });

    // tslint:disable-next-line:no-any
    return (original as any).call(self, call);
  }

  private _patchClient() {
    const plugin = this;
    return (
      original: typeof grpcModule.makeGenericClientConstructor
    ): never => {
      plugin._logger.debug('patching client');
      return function makeClientConstructor<ImplementationType>(
        this: typeof grpcModule.Client,
        methods: grpcModule.ServiceDefinition<ImplementationType>,
        serviceName: string,
        options: grpcModule.GenericClientOptions
      ) {
        // tslint:disable-next-line:no-any
        const client = original.apply(this, arguments as any);
        shimmer.massWrap(
          client.prototype as never,
          Object.keys(methods) as never[],
          // tslint:disable-next-line:no-any
          plugin._getPatchedClientMethods() as any
        );
        return client;
      } as never;
    };
  }

  private _getPatchedClientMethods() {
    const plugin = this;
    return (original: GrpcClientFunc) => {
      plugin._logger.debug('patch all client methods');
      return function clientMethodTrace(this: grpcModule.Client) {
        const name = `grpc.${original.path.replace('/', '')}`;
        const args = Array.prototype.slice.call(arguments);
        const currentSpan = plugin._tracer.getCurrentSpan();
        const span = plugin._tracer
          .startSpan(name, {
            kind: SpanKind.CLIENT,
            parent: currentSpan || undefined,
          })
          .setAttribute(AttributeNames.COMPONENT, GrpcPlugin.component);
        return plugin._makeGrpcClientRemoteCall(original, args, this, plugin)(
          span
        );
      };
    };
  }

  /**
   * This method handles the client remote call
   */
  private _makeGrpcClientRemoteCall(
    original: GrpcClientFunc,
    // tslint:disable-next-line:no-any
    args: any[],
    self: grpcModule.Client,
    plugin: GrpcPlugin
  ) {
    /**
     * Patches a callback so that the current span for this trace is also ended
     * when the callback is invoked.
     */
    function patchedCallback(
      span: Span,
      callback: SendUnaryDataCallback,
      metadata: grpcModule.Metadata
    ) {
      // tslint:disable-next-line:no-any
      const wrappedFn = (err: grpcModule.ServiceError, res: any) => {
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
            grpcModule.status.OK.toString()
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

      this._setSpanContext(metadata, span.context());
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
          (err: grpcModule.ServiceError) => {
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

        ((call as unknown) as events.EventEmitter).on(
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
    // tslint:disable-next-line:no-any
    args: any[]
  ): grpcModule.Metadata {
    let metadata: grpcModule.Metadata;

    // This finds an instance of Metadata among the arguments.
    // A possible issue that could occur is if the 'options' parameter from
    // the user contains an '_internal_repr' as well as a 'getMap' function,
    // but this is an extremely rare case.
    // tslint:disable-next-line:no-any
    let metadataIndex = findIndex(args, (arg: any) => {
      return (
        arg &&
        typeof arg === 'object' &&
        arg._internal_repr &&
        typeof arg.getMap === 'function'
      );
    });
    if (metadataIndex === -1) {
      metadata = new grpcModule.Metadata();
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
const plugin = new GrpcPlugin(GrpcPlugin.component, version);
export { plugin };
