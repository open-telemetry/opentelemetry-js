/**
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

import { Link } from '@opentelemetry/types';
import { ReadableSpan } from '@opentelemetry/basic-tracer';
import {
  ThriftSpan,
  Tag,
  Log,
  ThriftTag,
  ThriftLog,
  ThriftUtils,
  Utils,
  ThriftReference,
} from './types';

const MICROS_PER_MILLI = 1000;

/**
 * Translate OpenTelemetry ReadableSpan to JaegerSpan format
 * @param span Span to be translated
 */
export function toJaegerSpan(span: ReadableSpan): ThriftSpan {
  const tags: Tag[] = [];
  // @todo: use .map
  Object.keys(span.attributes).forEach(key => {
    tags.push({ key, value: String(span.attributes[key]) });
  });

  const logs: Log[] = [];
  // @todo: use .map
  span.events.forEach(event => {
    logs.push({
      timestamp: event.time,
      fields: [{ key: 'message.id', value: event.name }],
    });
  });

  const parentSpan: string | Buffer = span.parentSpanId
    ? Utils.encodeInt64(span.parentSpanId)
    : ThriftUtils.emptyBuffer;

  const traceId = span.spanContext.traceId;
  const high = traceId.slice(0, 16);
  const low = traceId.slice(16);
  const spanTags: ThriftTag[] = ThriftUtils.getThriftTags(tags);
  const spanLogs: ThriftLog[] = ThriftUtils.getThriftLogs(logs);

  return {
    traceIdLow: Utils.encodeInt64(low),
    traceIdHigh: Utils.encodeInt64(high),
    spanId: Utils.encodeInt64(span.spanContext.spanId),
    parentSpanId: parentSpan,
    operationName: span.name,
    references: getThriftReference(span.links),
    flags: span.spanContext.traceOptions || 0x1,
    startTime: Utils.encodeInt64(span.startTime * MICROS_PER_MILLI),
    duration: Utils.encodeInt64(
      Math.round((span.endTime - span.startTime) * MICROS_PER_MILLI)
    ),
    tags: spanTags,
    logs: spanLogs,
  };
}

function getThriftReference(links: Link[]): ThriftReference[] {
  return links
    .map((link): ThriftReference | null => {
      // @todo: decide how to handle type, OT Link doesn't have type
      // information.
      const refType = null;
      if (!refType) return null;

      const traceId = link.spanContext.traceId;
      const traceIdHigh = Utils.encodeInt64(traceId.slice(0, 16));
      const traceIdLow = Utils.encodeInt64(traceId.slice(16));
      const spanId = Utils.encodeInt64(link.spanContext.traceId);
      return { traceIdLow, traceIdHigh, spanId, refType };
    })
    .filter(ref => !!ref) as ThriftReference[];
}
