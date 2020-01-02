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

const endSpan = (span: Span, err: NodeJS.ErrnoException | null | undefined) => {
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

export const traceConnection = (tracer: Tracer, original: Function) => {
  return function(this: ioredisTypes.Redis & IORedisPluginClientTypes) {
    const parentSpan = tracer.getCurrentSpan();
    const span = tracer.startSpan('connect', {
      kind: SpanKind.CLIENT,
      parent: parentSpan,
      attributes: {
        [AttributeNames.COMPONENT]: IORedisPlugin.COMPONENT,
        [AttributeNames.DB_TYPE]: IORedisPlugin.DB_TYPE,
        [AttributeNames.DB_STATEMENT]: 'connect',
      },
    });
    const { host, port } = this.options;

    span.setAttributes({
      [AttributeNames.PEER_HOSTNAME]: host,
      [AttributeNames.PEER_PORT]: port,
      [AttributeNames.PEER_ADDRESS]: `redis://${host}:${port}`,
    });
    try {
      const client = original.apply(this, arguments);
      endSpan(span, null);
      return client;
    } catch (error) {
      endSpan(span, error);
      throw error;
    }
  };
};

export const traceSendCommand = (tracer: Tracer, original: Function) => {
  return function(
    this: ioredisTypes.Redis & IORedisPluginClientTypes,
    cmd?: IORedisCommand
  ) {
    const parentSpan = tracer.getCurrentSpan();

    if (arguments.length >= 1 && typeof cmd === 'object') {
      const span = tracer.startSpan(cmd.name, {
        kind: SpanKind.CLIENT,
        parent: parentSpan,
        attributes: {
          [AttributeNames.COMPONENT]: IORedisPlugin.COMPONENT,
          [AttributeNames.DB_TYPE]: IORedisPlugin.DB_TYPE,
          [AttributeNames.DB_STATEMENT]:
            Array.isArray(cmd.args) && cmd.args.length
              ? `${cmd.name} ${cmd.args.join(' ')}`
              : cmd.name,
        },
      });

      const { host, port } = this.options;

      span.setAttributes({
        [AttributeNames.PEER_HOSTNAME]: host,
        [AttributeNames.PEER_PORT]: port,
        [AttributeNames.PEER_ADDRESS]: `redis://${host}:${port}`,
      });

      try {
        const result = original.apply(this, arguments);
        endSpan(span, null);
        return result;
      } catch (error) {
        endSpan(span, error);
        throw error;
      }
    } else return original.apply(this, arguments);
  };
};
