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

import { BasePlugin } from '@opentelemetry/core';
import { VERSION } from './version';
import * as path from 'path';

import * as grpcJs from '@grpc/grpc-js';

/**
 * @grpc/grpc-js gRPC instrumentation plugin for Opentelemetry
 * https://www.npmjs.com/package/@grpc/grpc-js
 */
export class GrpcJsPlugin extends BasePlugin<typeof grpcJs> {
  static readonly component = '@grpc/grpc-js';
  readonly supportedVersions = ['1.*'];

  constructor(readonly moduleName: string, readonly version: string) {
    super('@opentelemetry/plugin-grpc-js', VERSION);
  }

  protected patch(): typeof grpcJs {
    throw new Error('Method not implemented.');
  }
  protected unpatch(): void {
    throw new Error('Method not implemented.');
  }
}

const basedir = path.dirname(require.resolve(GrpcJsPlugin.component));
const version = require(path.join(basedir, 'package.json')).version;
export const plugin = new GrpcJsPlugin(GrpcJsPlugin.component, version);
