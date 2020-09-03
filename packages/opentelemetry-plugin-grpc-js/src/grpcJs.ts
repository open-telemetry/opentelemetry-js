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
import { BasePlugin } from '@opentelemetry/core';
import * as shimmer from 'shimmer';
import { patchClient, patchLoadPackageDefinition } from './client';
import { patchServer } from './server';
import { VERSION } from './version';
import { Tracer, Logger } from '@opentelemetry/api';
import { GrpcPluginOptions } from './types';

/**
 * @grpc/grpc-js gRPC instrumentation plugin for Opentelemetry
 * https://www.npmjs.com/package/@grpc/grpc-js
 */
export class GrpcJsPlugin extends BasePlugin<typeof grpcJs> {
  static readonly component = '@grpc/grpc-js';

  readonly supportedVersions = ['1.*'];

  protected _config!: GrpcPluginOptions;

  constructor(readonly moduleName: string) {
    super('@opentelemetry/plugin-grpc-js', VERSION);
  }

  /**
   * @internal
   * Public reference to the protected BasePlugin `_tracer` instance to be used by this
   * plugin's external helper functions
   */
  get tracer(): Tracer {
    return this._tracer;
  }

  /**
   * @internal
   * Public reference to the protected BasePlugin `_logger` instance to be used by this
   * plugin's external helper functions
   */
  get logger(): Logger {
    return this._logger;
  }

  protected patch(): typeof grpcJs {
    // Patch Server methods
    shimmer.wrap(
      this._moduleExports.Server.prototype,
      'register',
      patchServer.call(this)
    );

    // Patch Client methods
    shimmer.wrap(
      this._moduleExports,
      'makeClientConstructor',
      patchClient.call(this)
    );
    shimmer.wrap(
      this._moduleExports,
      'makeGenericClientConstructor',
      patchClient.call(this)
    );
    shimmer.wrap(
      this._moduleExports,
      'loadPackageDefinition',
      patchLoadPackageDefinition.call(this)
    );

    return this._moduleExports;
  }

  protected unpatch(): void {
    this._logger.debug(
      'removing patch to %s@%s',
      this.moduleName,
      this.version
    );

    // Unpatch server
    shimmer.unwrap(this._moduleExports.Server.prototype, 'register');

    // Unpatch client
    shimmer.unwrap(this._moduleExports, 'makeClientConstructor');
    shimmer.unwrap(this._moduleExports, 'makeGenericClientConstructor');
    shimmer.unwrap(this._moduleExports, 'loadPackageDefinition');
  }
}

export const plugin = new GrpcJsPlugin(GrpcJsPlugin.component);
