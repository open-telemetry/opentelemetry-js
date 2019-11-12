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
import {
  RedisPluginStreamTypes,
  RedisPluginClientTypes,
  RedisCommand,
} from './types';
import { EventEmitter } from 'events';

export class RedisPlugin extends BasePlugin<typeof redisTypes> {
  static readonly COMPONENT = 'redis';
  readonly supportedVersions = ['^2.6.0']; // should be >= 2.6.0

  constructor(readonly moduleName: string) {
    super();
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
          const span = plugin._tracer.startSpan(
            `${RedisPlugin.COMPONENT}-${cmd.command}`,
            {
              kind: SpanKind.CLIENT,
              parent: parentSpan || undefined,
              attributes: {
                [AttributeNames.COMPONENT]: RedisPlugin.COMPONENT,
                [AttributeNames.DB_STATEMENT]: cmd.command,
              },
            }
          );

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

          let spanEnded = false;
          const endSpan = (err?: Error | null) => {
            if (spanEnded) return; // never
            if (err) {
              span.setStatus({
                code: CanonicalCode.UNKNOWN,
                message: err.message,
              });
            } else {
              span.setStatus({ code: CanonicalCode.OK });
            }
            span.end();
            spanEnded = true;
          };

          const originalCallback = arguments[0].callback;
          if (originalCallback) {
            (arguments[0] as RedisCommand).callback = function callback<T>(
              this: unknown,
              err: Error | null,
              _reply: T
            ) {
              endSpan(err);
              return originalCallback.apply(this, arguments);
            };
          }
          try {
            // Span will be ended in callback
            return original.apply(this, arguments);
          } catch (rethrow) {
            endSpan(rethrow);
            throw rethrow; // rethrow after ending span
          }
        }

        // We don't know how to trace this call, so don't start/stop a span
        return original.apply(this, arguments);
      };
    };
  }

  private _getPatchCreateClient() {
    const plugin = this;
    return function createClient(original: Function) {
      return function createClientTrace(this: redisTypes.RedisClient) {
        const client: redisTypes.RedisClient = original.apply(this, arguments);
        return plugin._tracer.bind(client);
      };
    };
  }

  private _getPatchCreateStream() {
    const plugin = this;
    return function createReadStream(original: Function) {
      return function create_stream_trace(this: RedisPluginStreamTypes) {
        if (!this.stream) {
          Object.defineProperty(this, 'stream', {
            get() {
              return this._patched_redis_stream;
            },
            set(val: EventEmitter) {
              plugin._tracer.bind(val);
              this._patched_redis_stream = val;
            },
          });
        }
        return original.apply(this, arguments);
      };
    };
  }
}

export const plugin = new RedisPlugin(RedisPlugin.COMPONENT);
