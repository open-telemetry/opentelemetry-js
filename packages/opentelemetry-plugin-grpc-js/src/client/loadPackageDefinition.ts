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
import type * as grpcJs from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/grpc-js/build/src/make-client';
import * as shimmer from 'shimmer';
import { getMethodsToWrap, getPatchedClientMethods } from './utils';

/**
 * Entry point for client patching for grpc.loadPackageDefinition(...)
 * @param this - GrpcJsPlugin
 */
export function patchLoadPackageDefinition(this: GrpcJsPlugin) {
  return (original: typeof grpcJs.loadPackageDefinition) => {
    const plugin = this;

    plugin._logger.debug('patching loadPackageDefinition');

    return function patchedLoadPackageDefinition(
      this: null,
      packageDef: PackageDefinition
    ) {
      const result: grpcJs.GrpcObject = original.call(
        this,
        packageDef
      ) as grpcJs.GrpcObject;
      _patchLoadedPackage.call(plugin, result);
      return result;
    } as typeof grpcJs.loadPackageDefinition;
  };
}

/**
 * Utility function to patch *all* functions loaded through a proto file.
 * Recursively searches for Client classes and patches all methods, reversing the
 * parsing done by grpc.loadPackageDefinition
 * https://github.com/grpc/grpc-node/blob/1d14203c382509c3f36132bd0244c99792cb6601/packages/grpc-js/src/make-client.ts#L200-L217
 */
function _patchLoadedPackage(
  this: GrpcJsPlugin,
  result: grpcJs.GrpcObject
): void {
  Object.values(result).forEach(service => {
    if (typeof service === 'function') {
      shimmer.massWrap<typeof service.prototype, string>(
        service.prototype,
        getMethodsToWrap.call(this, service, service.service),
        getPatchedClientMethods.call(this)
      );
    } else if (typeof service.format !== 'string') {
      // GrpcObject
      _patchLoadedPackage.call(this, service as grpcJs.GrpcObject);
    }
  });
}
