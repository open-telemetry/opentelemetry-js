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

import { GrpcInstrumentation } from '../instrumentation';
import type * as grpcTypes from 'grpc';
import {
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  isWrapped,
} from '@opentelemetry/instrumentation';
import { patchServer } from './server/patches';
import { patchClient } from './client/patches';
import { GrpcInternalClientTypes } from './types';

/**
 * Holding reference to grpc module here to access constant of grpc modules
 * instead of just requiring it avoid directly depending on grpc itself.
 */
let grpcClient: typeof grpcTypes;

export const getGrpcPatches = function (this: GrpcInstrumentation) {
  return [
    new InstrumentationNodeModuleDefinition<typeof grpcTypes>(
      'grpc',
      ['1.*'],
      (moduleExports, version) => {
        this._logger.debug(`Applying patch for grpc@${version}`);
        if (isWrapped(moduleExports.Server.prototype.register)) {
          this._unwrap(moduleExports.Server.prototype, 'register');
        }
        grpcClient = moduleExports;
        this._wrap(
          moduleExports.Server.prototype,
          'register',
          patchServer.call(this, moduleExports) as any
        );
        // Wrap the externally exported client constructor
        if (isWrapped(moduleExports.makeGenericClientConstructor)) {
          this._unwrap(moduleExports, 'makeGenericClientConstructor');
        }
        this._wrap(
          moduleExports,
          'makeGenericClientConstructor',
          patchClient.call(this, moduleExports)
        );
        return moduleExports;
      },
      (moduleExports, version) => {
        if (moduleExports === undefined) return;
        this._logger.debug(`Removing patch for grpc@${version}`);

        this._unwrap(moduleExports.Server.prototype, 'register');
      },
      getInternalPatchs.apply(this)
    ),
  ];
};

const getInternalPatchs = function (this: GrpcInstrumentation) {
  const onPatch = (
    moduleExports: GrpcInternalClientTypes,
    version?: string
  ) => {
    this._logger.debug(`Applying internal patch for grpc@${version}`);
    if (isWrapped(moduleExports.makeClientConstructor)) {
      this._unwrap(moduleExports, 'makeClientConstructor');
    }
    this._wrap(
      moduleExports,
      'makeClientConstructor',
      patchClient.call(this, grpcClient)
    );
    return moduleExports;
  };
  const onUnPatch = (
    moduleExports?: GrpcInternalClientTypes,
    version?: string
  ) => {
    if (moduleExports === undefined) return;
    this._logger.debug(`Removing internal patch for grpc@${version}`);
    this._unwrap(moduleExports, 'makeClientConstructor');
  };
  return [
    new InstrumentationNodeModuleFile<GrpcInternalClientTypes>(
      'grpc/src/node/src/client.js',
      ['0.13 - 1.6'],
      onPatch,
      onUnPatch
    ),
    new InstrumentationNodeModuleFile<GrpcInternalClientTypes>(
      'grpc/src/client.js',
      ['^1.7'],
      onPatch,
      onUnPatch
    ),
  ];
};
