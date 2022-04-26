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
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import type { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import { toAttributes } from '../common/internal';
import { EStatusCode, IEvent, ILink, ISpan } from './types';
import * as core from '@opentelemetry/core';

export function sdkSpanToOtlpSpan(
  span: ReadableSpan,
  useHex?: boolean
): ISpan {
  const ctx = span.spanContext();
  const status = span.status;
  const parentSpanId = useHex? span.parentSpanId : span.parentSpanId != null? core.hexToBase64(span.parentSpanId): undefined;
  return {
    traceId: useHex? ctx.traceId : core.hexToBase64(ctx.traceId),
    spanId: useHex? ctx.spanId : core.hexToBase64(ctx.spanId),
    parentSpanId: parentSpanId,
    name: span.name,
    // Span kind is offset by 1 because the API does not define a value for unset
    kind: span.kind == null ? 0 : span.kind + 1,
    startTimeUnixNano: hrTimeToNanoseconds(span.startTime),
    endTimeUnixNano: hrTimeToNanoseconds(span.endTime),
    attributes: toAttributes(span.attributes),
    droppedAttributesCount: 0,
    events: span.events.map(toOtlpSpanEvent),
    droppedEventsCount: 0,
    status: {
      // API and proto enums share the same values
      code: status.code as unknown as EStatusCode,
      message: status.message,
    },
    links: span.links.map(link => toOtlpLink(link, useHex)),
    droppedLinksCount: 0,
  };
}

export function toOtlpLink(link: Link, useHex?: boolean): ILink {
  return {
    attributes: link.attributes ? toAttributes(link.attributes) : [],
    spanId: useHex? link.context.spanId : core.hexToBase64(link.context.spanId),
    traceId: useHex? link.context.traceId : core.hexToBase64(link.context.traceId),
    droppedAttributesCount: 0,
  };
}

export function toOtlpSpanEvent(
  timedEvent: TimedEvent
): IEvent {
  return {
    attributes: timedEvent.attributes ? toAttributes(timedEvent.attributes) : [],
    name: timedEvent.name,
    timeUnixNano: hrTimeToNanoseconds(timedEvent.time),
    droppedAttributesCount: 0,
  };
}
