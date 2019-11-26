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

import * as ioredisTypes from 'ioredis';
import { Tracer, SpanKind, Span, CanonicalCode } from '@opentelemetry/types';
import { IORedisPluginClientTypes, IORedisCommand } from './types';
import { IORedisPlugin } from './ioredis';
import { AttributeNames } from './enums';

const endSpan = (span: Span, err: Error | null) => {
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

export const getTracedSendCommand = (tracer: Tracer, original: Function) => {
  return function sendCommandTrace(
    this: ioredisTypes.Redis & IORedisPluginClientTypes,
    cmd?: IORedisCommand
  ) {
    const parentSpan = tracer.getCurrentSpan();

    if (arguments.length === 1 && typeof cmd === 'object') {
      const span = tracer.startSpan(cmd.name, {
        kind: SpanKind.CLIENT,
        parent: parentSpan || undefined,
        attributes: {
          [AttributeNames.COMPONENT]: IORedisPlugin.COMPONENT,
          [AttributeNames.DB_TYPE]: 'redis',
          [AttributeNames.DB_STATEMENT]: `${cmd.name} ${cmd.args.join(' ')}`,
        },
      });

      // Set attributes for not explicitly typed IORedisPluginClientTypes
      if (this.options) {
        const { host, port } = this.options;
        span.setAttributes({
          [AttributeNames.PEER_HOSTNAME]: host,
          [AttributeNames.PEER_PORT]: port,
          [AttributeNames.PEER_ADDRESS]: `redis://${host}:${port}`,
        });
      }

      const originalCallback = cmd.callback;
      const originalPromise = cmd.promise;
      if (originalCallback) {
        (cmd as IORedisCommand).callback = function callback<T>(
          this: unknown,
          err: Error | null,
          _reply: T
        ) {
          endSpan(span, err);
          return originalCallback.apply(this, arguments);
        };
        try {
          // Span will be ended in callback
          return original.apply(this, arguments);
        } catch (error) {
          endSpan(span, error);
          throw error;
        }
      } else if (originalPromise) {
        // Perform the original query
        const result = original.apply(this, arguments);
        // Bind promise to parent span and end the span
        return result
          .then((result: unknown) => {
            // Return a pass-along promise which ends the span and then goes to user's orig resolvers
            return new Promise((resolve, _) => {
              endSpan(span, null);
              resolve(result);
            });
          })
          .catch((error: Error) => {
            return new Promise((_, reject) => {
              endSpan(span, error);
              reject(error);
            });
          });
      }
    }

    // We don't know how to trace this call, so don't start/stop a span
    return original.apply(this, arguments);
  };
};
