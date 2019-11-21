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

export const getTracedSendCommand = (tracer: Tracer, original: Function) => {
  return function sendCommandTrace(
    this: ioredisTypes.Redis & IORedisPluginClientTypes,
    cmd?: IORedisCommand
  ) {
    const parentSpan = tracer.getCurrentSpan();

    if (arguments.length === 1 && typeof cmd === 'object') {
      const span = tracer.startSpan(`${IORedisPlugin.COMPONENT}-${cmd.name}`, {
        kind: SpanKind.CLIENT,
        parent: parentSpan || undefined,
        attributes: {
          [AttributeNames.COMPONENT]: IORedisPlugin.COMPONENT,
          [AttributeNames.DB_STATEMENT]: cmd.name,
        },
      });

      // Set attributes for not explicitly typed IORedisPluginClientTypes
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
        (arguments[0] as IORedisCommand).callback = function callback<T>(
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
