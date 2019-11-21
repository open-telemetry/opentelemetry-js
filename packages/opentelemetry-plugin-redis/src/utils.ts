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

import * as redisTypes from 'redis';
import { Tracer, SpanKind, Span, CanonicalCode } from '@opentelemetry/types';
import {
  RedisPluginStreamTypes,
  RedisPluginClientTypes,
  RedisCommand,
} from './types';
import { EventEmitter } from 'events';
import { RedisPlugin } from './redis';
import { AttributeNames } from './enums';

const endSpan = (span: Span, err?: Error | null) => {
  if (err) {
    span.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: err.message,
    });
  } else {
    span.setStatus({ code: CanonicalCode.OK });
  }
  span.end();
};

export const getTracedCreateClient = (tracer: Tracer, original: Function) => {
  return function createClientTrace(this: redisTypes.RedisClient) {
    const client: redisTypes.RedisClient = original.apply(this, arguments);
    return tracer.bind(client);
  };
};

export const getTracedCreateStreamTrace = (
  tracer: Tracer,
  original: Function
) => {
  return function create_stream_trace(this: RedisPluginStreamTypes) {
    if (!this.stream) {
      Object.defineProperty(this, 'stream', {
        get() {
          return this._patched_redis_stream;
        },
        set(val: EventEmitter) {
          tracer.bind(val);
          this._patched_redis_stream = val;
        },
      });
    }
    return original.apply(this, arguments);
  };
};

export const getTracedInternalSendCommand = (
  tracer: Tracer,
  original: Function
) => {
  return function internal_send_command_trace(
    this: redisTypes.RedisClient & RedisPluginClientTypes,
    cmd?: RedisCommand
  ) {
    const parentSpan = tracer.getCurrentSpan();

    // New versions of redis (2.4+) use a single options object
    // instead of named arguments
    if (arguments.length === 1 && typeof cmd === 'object') {
      const span = tracer.startSpan(`${RedisPlugin.COMPONENT}-${cmd.command}`, {
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
      if (originalCallback) {
        (arguments[0] as RedisCommand).callback = function callback<T>(
          this: unknown,
          err: Error | null,
          _reply: T
        ) {
          endSpan(span, err);
          return originalCallback.apply(this, arguments);
        };
      }
      try {
        // Span will be ended in callback
        return original.apply(this, arguments);
      } catch (rethrow) {
        endSpan(span, rethrow);
        throw rethrow; // rethrow after ending span
      }
    }

    // We don't know how to trace this call, so don't start/stop a span
    return original.apply(this, arguments);
  };
};
