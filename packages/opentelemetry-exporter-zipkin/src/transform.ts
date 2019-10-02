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

import * as types from '@opentelemetry/types';
import { ReadableSpan } from '@opentelemetry/tracer-basic';
import { hrTimeToMicroseconds } from '@opentelemetry/core';
import * as zipkinTypes from './types';

const ZIPKIN_SPAN_KIND_MAPPING = {
  [types.SpanKind.CLIENT]: zipkinTypes.SpanKind.CLIENT,
  [types.SpanKind.SERVER]: zipkinTypes.SpanKind.SERVER,
  [types.SpanKind.CONSUMER]: zipkinTypes.SpanKind.CONSUMER,
  [types.SpanKind.PRODUCER]: zipkinTypes.SpanKind.PRODUCER,
  // When absent, the span is local.
  [types.SpanKind.INTERNAL]: undefined,
};

export const statusCodeTagName = 'ot.status_code';
export const statusDescriptionTagName = 'ot.status_description';

/**
 * Translate OpenTelemetry ReadableSpan to ZipkinSpan format
 * @param span Span to be translated
 */
export function toZipkinSpan(
  span: ReadableSpan,
  serviceName: string,
  statusCodeTagName: string,
  statusDescriptionTagName: string
): zipkinTypes.Span {
  const zipkinSpan: zipkinTypes.Span = {
    traceId: span.spanContext.traceId,
    parentId: span.parentSpanId,
    name: span.name,
    id: span.spanContext.spanId,
    kind: ZIPKIN_SPAN_KIND_MAPPING[span.kind],
    timestamp: hrTimeToMicroseconds(span.startTime),
    duration: hrTimeToMicroseconds(span.duration),
    localEndpoint: { serviceName },
    tags: _toZipkinTags(
      span.attributes,
      span.status,
      statusCodeTagName,
      statusDescriptionTagName
    ),
    annotations: span.events.length
      ? _toZipkinAnnotations(span.events)
      : undefined,
  };

  return zipkinSpan;
}

/** Converts OpenTelemetry Attributes and Status to Zipkin Tags format. */
export function _toZipkinTags(
  attributes: types.Attributes,
  status: types.Status,
  statusCodeTagName: string,
  statusDescriptionTagName: string
): zipkinTypes.Tags {
  const tags: { [key: string]: string } = {};
  for (const key of Object.keys(attributes)) {
    tags[key] = String(attributes[key]);
  }
  tags[statusCodeTagName] = String(types.CanonicalCode[status.code]);
  if (status.message) {
    tags[statusDescriptionTagName] = status.message;
  }
  return tags;
}

/**
 * Converts OpenTelemetry Events to Zipkin Annotations format.
 */
export function _toZipkinAnnotations(
  events: types.TimedEvent[]
): zipkinTypes.Annotation[] {
  return events.map(event => ({
    timestamp: hrTimeToMicroseconds(event.time),
    value: event.name,
  }));
}
