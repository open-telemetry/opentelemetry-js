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
import { SpanKind, CanonicalCode } from '@opentelemetry/types';
import { AttributeNames } from './enums';

// exported from
// https://github.com/NodeRedis/node_redis/blob/master/lib/command.js
export interface RedisCommand {
  command: string;
  args: string[];
  buffer_args: boolean;
  callback: Function;
  call_on_write: boolean;
}

interface RedisPluginClientTypes {
  options?: {
    host: string;
    port: string;
  };

  address?: string;
}

export class RedisPlugin extends BasePlugin<typeof redisTypes> {
  static readonly COMPONENT = 'redis';
  readonly supportedVersions = ['^2.6.0']; // should be >= 2.6.0

  constructor(readonly moduleName: string) {
    super();
  }

  protected patch() {
    this._logger.debug(
      'Patching redis.RedisClient.prototype.internal_send_command'
    );
    shimmer.wrap(
      this._moduleExports.RedisClient.prototype,
      'internal_send_command',
      this._getPatchInternalSendCommand()
    );
    return this._moduleExports;
  }

  protected unpatch(): void {
    if (this._moduleExports) {
      shimmer.unwrap(
        this._moduleExports.RedisClient.prototype,
        'internal_send_command'
      );
    }
  }

  /**
   * Patch internal_send_command(...) to trace requests
   */
  private _getPatchInternalSendCommand() {
    const plugin = this;
    return function internal_send_command(original: Function) {
      return function internal_send_command_trace(
        this: redisTypes.RedisClient & RedisPluginClientTypes,
        cmd?: RedisCommand
      ) {
        const parentSpan = plugin._tracer.getCurrentSpan();

        // New versions of redis (2.4+) use a single options object
        // instead of named arguments
        if (arguments.length === 1 && typeof cmd === 'object') {
          const span = plugin._tracer.startSpan(`redis-${cmd.command}`, {
            kind: SpanKind.CLIENT,
            parent: parentSpan || undefined,
            attributes: {
              [AttributeNames.COMPONENT]: RedisPlugin.COMPONENT,
              [AttributeNames.DB_STATEMENT]: cmd.command,
            },
          });

          // Set attributes for not explicitly typed RedisPluginClientTypes
          if (this.options) {
            span.setAttributes({
              [AttributeNames.PEER_HOSTNAME]: this.options.host,
              [AttributeNames.PEER_PORT]: this.options.port,
            });
          }
          if (this.address) {
            span.setAttribute(
              AttributeNames.PEER_ADDRESS,
              `redis://${this.address}`
            );
          }

          const originalCallback = arguments[0].callback;
          arguments[0].callback = function callback() {
            span.setStatus({
              code: CanonicalCode.OK,
            });
            span.end();
            return originalCallback.apply(this, arguments);
          };
          return original.apply(this, arguments);
        }
        return original.apply(this, arguments);
      };
    };
  }
}

export const plugin = new RedisPlugin(RedisPlugin.COMPONENT);
