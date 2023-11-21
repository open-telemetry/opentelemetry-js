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
import type { Link } from '@opentelemetry/api';
import type { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import type { Encoder } from '../common';
import { toAttributes } from '../common/internal';
import { EStatusCode, IEvent, ILink, ISpan } from './types';

export function sdkSpanToOtlpSpan(span: ReadableSpan, encoder: Encoder): ISpan {
  const ctx = span.spanContext();
  const status = span.status;
  return {
    traceId: encoder.encodeSpanContext(ctx.traceId),
    spanId: encoder.encodeSpanContext(ctx.spanId),
    parentSpanId: encoder.encodeOptionalSpanContext(span.parentSpanId),
    traceState: ctx.traceState?.serialize(),
    name: span.name,
    // Span kind is offset by 1 because the API does not define a value for unset
    kind: span.kind == null ? 0 : span.kind + 1,
    startTimeUnixNano: encoder.encodeHrTime(span.startTime),
    endTimeUnixNano: encoder.encodeHrTime(span.endTime),
    attributes: toAttributes(span.attributes),
    droppedAttributesCount: span.droppedAttributesCount,
    events: span.events.map(event => toOtlpSpanEvent(event, encoder)),
    droppedEventsCount: span.droppedEventsCount,
    status: {
      // API and proto enums share the same values
      code: status.code as unknown as EStatusCode,
      message: status.message,
    },
    links: span.links.map(link => toOtlpLink(link, encoder)),
    droppedLinksCount: span.droppedLinksCount,
  };
}

export function toOtlpLink(link: Link, encoder: Encoder): ILink {
  return {
    attributes: link.attributes ? toAttributes(link.attributes) : [],
    spanId: encoder.encodeSpanContext(link.context.spanId),
    traceId: encoder.encodeSpanContext(link.context.traceId),
    traceState: link.context.traceState?.serialize(),
    droppedAttributesCount: link.droppedAttributesCount || 0,
  };
}

export function toOtlpSpanEvent(
  timedEvent: TimedEvent,
  encoder: Encoder
): IEvent {
  return {
    attributes: timedEvent.attributes
      ? toAttributes(timedEvent.attributes)
      : [],
    name: timedEvent.name,
    timeUnixNano: encoder.encodeHrTime(timedEvent.time),
    droppedAttributesCount: timedEvent.droppedAttributesCount || 0,
  };
}
