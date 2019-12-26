/*!
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
import * as redisTypes from 'redis';
import * as shimmer from 'shimmer';
import {
  getTracedCreateClient,
  getTracedCreateStreamTrace,
  getTracedInternalSendCommand,
} from './utils';
import { VERSION } from './version';

export class RedisPlugin extends BasePlugin<typeof redisTypes> {
  static readonly COMPONENT = 'redis';
  readonly supportedVersions = ['^2.6.0']; // equivalent to >= 2.6.0 <3

  constructor(readonly moduleName: string) {
    super('@opentelemetry/plugin-redis', VERSION);
  }

  protected patch() {
    if (this._moduleExports.RedisClient) {
      this._logger.debug(
        'Patching redis.RedisClient.prototype.internal_send_command'
      );
      shimmer.wrap(
        this._moduleExports.RedisClient.prototype,
        'internal_send_command',
        this._getPatchInternalSendCommand()
      );

      this._logger.debug('patching redis.create_stream');
      shimmer.wrap(
        this._moduleExports.RedisClient.prototype,
        'create_stream',
        this._getPatchCreateStream()
      );

      this._logger.debug('patching redis.createClient');
      shimmer.wrap(
        this._moduleExports,
        'createClient',
        this._getPatchCreateClient()
      );
    }
    return this._moduleExports;
  }

  protected unpatch(): void {
    if (this._moduleExports) {
      shimmer.unwrap(
        this._moduleExports.RedisClient.prototype,
        'internal_send_command'
      );
      shimmer.unwrap(
        this._moduleExports.RedisClient.prototype,
        'create_stream'
      );
      shimmer.unwrap(this._moduleExports, 'createClient');
    }
  }

  /**
   * Patch internal_send_command(...) to trace requests
   */
  private _getPatchInternalSendCommand() {
    const tracer = this._tracer;
    return function internal_send_command(original: Function) {
      return getTracedInternalSendCommand(tracer, original);
    };
  }

  private _getPatchCreateClient() {
    const tracer = this._tracer;
    return function createClient(original: Function) {
      return getTracedCreateClient(tracer, original);
    };
  }

  private _getPatchCreateStream() {
    const tracer = this._tracer;
    return function createReadStream(original: Function) {
      return getTracedCreateStreamTrace(tracer, original);
    };
  }
}

export const plugin = new RedisPlugin(RedisPlugin.COMPONENT);
