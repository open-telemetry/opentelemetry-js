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
import type * as grpcJs from '@grpc/grpc-js';
import {
  InstrumentationNodeModuleDefinition,
  isWrapped,
} from '@opentelemetry/instrumentation';
import { patchServer } from './server/patches';
import { patchClient, patchLoadPackageDefinition } from './client/patches';

export const getGrpcJsPatches = function (this: GrpcInstrumentation) {
  return [
    new InstrumentationNodeModuleDefinition<typeof grpcJs>(
      '@grpc/grpc-js',
      ['1.*'],
      (moduleExports, version) => {
        this._logger.debug(`Applying patch for @grpc/grpc-js@${version}`);
        if (isWrapped(moduleExports.Server.prototype.register)) {
          this._unwrap(moduleExports.Server.prototype, 'register');
        }
        // Patch Server methods
        this._wrap(
          moduleExports.Server.prototype,
          'register',
          patchServer.call(this) as any
        );
        // Patch Client methods
        if (isWrapped(moduleExports.makeGenericClientConstructor)) {
          this._unwrap(moduleExports, 'makeGenericClientConstructor');
        }
        this._wrap(
          moduleExports,
          'makeGenericClientConstructor',
          patchClient.call(this, moduleExports)
        );
        if (isWrapped(moduleExports.makeClientConstructor)) {
          this._unwrap(moduleExports, 'makeClientConstructor');
        }
        this._wrap(
          moduleExports,
          'makeClientConstructor',
          patchClient.call(this, moduleExports)
        );
        if (isWrapped(moduleExports.loadPackageDefinition)) {
          this._unwrap(moduleExports, 'loadPackageDefinition');
        }
        this._wrap(
          moduleExports,
          'loadPackageDefinition',
          patchLoadPackageDefinition.call(this, moduleExports)
        );
        return moduleExports;
      },
      (moduleExports, version) => {
        if (moduleExports === undefined) return;
        this._logger.debug(`Removing patch for @grpc/grpc-js@${version}`);

        this._unwrap(moduleExports.Server.prototype, 'register');
        this._unwrap(moduleExports, 'makeClientConstructor');
        this._unwrap(moduleExports, 'makeGenericClientConstructor');
        this._unwrap(moduleExports, 'loadPackageDefinition');
      }
    ),
  ];
};
