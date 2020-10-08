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
import * as shimmer from 'shimmer';
import { getMethodsToWrap, getPatchedClientMethods } from './utils';

type MakeClientConstructorFunction = typeof grpcJs.makeGenericClientConstructor;

/**
 * Entry point for applying client patches to `grpc.makeClientConstructor(...)` equivalents
 * @param this GrpcJsPlugin
 */
export function patchClient(
  this: GrpcJsPlugin
): (original: MakeClientConstructorFunction) => MakeClientConstructorFunction {
  const plugin = this;
  return (original: MakeClientConstructorFunction) => {
    plugin._logger.debug('patching client');
    return function makeClientConstructor(
      this: typeof grpcJs.Client,
      methods: grpcJs.ServiceDefinition,
      serviceName: string,
      options?: object
    ) {
      const client = original.call(this, methods, serviceName, options);
      shimmer.massWrap<typeof client.prototype, string>(
        client.prototype,
        getMethodsToWrap.call(plugin, client, methods),
        getPatchedClientMethods.call(plugin)
      );
      return client;
    };
  };
}
