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

import { hexToBase64, hrTimeToTimeStamp } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';
import { Attributes, Link, TimedEvent, TraceState } from '@opentelemetry/api';
import * as collectorTypes from './types';

const OT_MAX_STRING_LENGTH = 128;

/**
 * convert string to maximum length of 128, providing information of truncated bytes
 * @param name - string to be converted
 */
export function toCollectorTruncatableString(
  name: string
): collectorTypes.TruncatableString {
  const value = name.substr(0, OT_MAX_STRING_LENGTH);
  const truncatedByteCount =
    name.length > OT_MAX_STRING_LENGTH ? name.length - OT_MAX_STRING_LENGTH : 0;

  return { value, truncatedByteCount };
}

/**
 * convert attributes
 * @param attributes
 */
export function toCollectorAttributes(
  attributes: Attributes
): collectorTypes.Attributes {
  const attributeMap: collectorTypes.AttributeMap = {};
  Object.keys(attributes || {}).forEach(key => {
    attributeMap[key] = toCollectorEventValue(attributes[key]);
  });

  return {
    droppedAttributesCount: 0,
    attributeMap,
  };
}

/**
 * convert event value
 * @param value event value
 */
export function toCollectorEventValue(
  value: unknown
): collectorTypes.AttributeValue {
  const attributeValue: collectorTypes.AttributeValue = {};

  if (typeof value === 'string') {
    attributeValue.stringValue = toCollectorTruncatableString(value);
  } else if (typeof value === 'boolean') {
    attributeValue.boolValue = value;
  } else if (typeof value === 'number') {
    // all numbers will be treated as double
    attributeValue.doubleValue = value;
  }

  return attributeValue;
}

/**
 * convert events
 * @param events array of events
 * @param maxAttributes - maximum number of event attributes to be converted
 */
export function toCollectorEvents(
  events: TimedEvent[]
): collectorTypes.TimeEvents {
  let droppedAnnotationsCount = 0;
  let droppedMessageEventsCount = 0; // not counting yet as messageEvent is not implemented

  const timeEvent: collectorTypes.TimeEvent[] = events.map(
    (event: TimedEvent) => {
      let attributes: collectorTypes.Attributes | undefined;

      if (event && event.attributes) {
        attributes = toCollectorAttributes(event.attributes);
        droppedAnnotationsCount += attributes.droppedAttributesCount || 0;
      }

      let annotation: collectorTypes.Annotation = {};
      if (event.name || attributes) {
        annotation = {};
      }

      if (event.name) {
        annotation.description = toCollectorTruncatableString(event.name);
      }

      if (typeof attributes !== 'undefined') {
        annotation.attributes = attributes;
      }

      // @TODO convert from event.attributes into appropriate MessageEvent
      // const messageEvent: collectorTypes.MessageEvent;

      const timeEvent: collectorTypes.TimeEvent = {
        time: hrTimeToTimeStamp(event.time),
        // messageEvent,
      };

      if (annotation) {
        timeEvent.annotation = annotation;
      }

      return timeEvent;
    }
  );

  return {
    timeEvent,
    droppedAnnotationsCount,
    droppedMessageEventsCount,
  };
}

/**
 * determines the type of link, only parent link type can be determined now
 * @TODO refactor this once such data is directly available from {@link Link}
 * @param span
 * @param link
 */
export function toCollectorLinkType(
  span: ReadableSpan,
  link: Link
): collectorTypes.LinkType {
  const linkSpanId = link.context.spanId;
  const linkTraceId = link.context.traceId;
  const spanParentId = span.parentSpanId;
  const spanTraceId = span.spanContext.traceId;

  if (linkSpanId === spanParentId && linkTraceId === spanTraceId) {
    return collectorTypes.LinkType.PARENT_LINKED_SPAN;
  }
  return collectorTypes.LinkType.UNSPECIFIED;
}

/**
 * converts span links
 * @param span
 */
export function toCollectorLinks(span: ReadableSpan): collectorTypes.Links {
  const collectorLinks: collectorTypes.Link[] = span.links.map((link: Link) => {
    const collectorLink: collectorTypes.Link = {
      traceId: hexToBase64(link.context.traceId),
      spanId: hexToBase64(link.context.spanId),
      type: toCollectorLinkType(span, link),
    };

    if (link.attributes) {
      collectorLink.attributes = toCollectorAttributes(link.attributes);
    }

    return collectorLink;
  });

  return {
    link: collectorLinks,
    droppedLinksCount: 0,
  };
}

/**
 * @param span
 */
export function toCollectorSpan(span: ReadableSpan): collectorTypes.Span {
  return {
    traceId: hexToBase64(span.spanContext.traceId),
    spanId: hexToBase64(span.spanContext.spanId),
    parentSpanId: span.parentSpanId
      ? hexToBase64(span.parentSpanId)
      : undefined,
    tracestate: toCollectorTraceState(span.spanContext.traceState),
    name: toCollectorTruncatableString(span.name),
    kind: span.kind,
    startTime: hrTimeToTimeStamp(span.startTime),
    endTime: hrTimeToTimeStamp(span.endTime),
    attributes: toCollectorAttributes(span.attributes),
    // stackTrace: // not implemented
    timeEvents: toCollectorEvents(span.events),
    status: span.status,
    sameProcessAsParentSpan: !!span.parentSpanId,
    links: toCollectorLinks(span),
    // childSpanCount: // not implemented
  };
}

/**
 * @param traceState
 */
function toCollectorTraceState(
  traceState?: TraceState
): collectorTypes.TraceState {
  if (!traceState) return {};
  const entries = traceState.serialize().split(',');
  const apiTraceState: collectorTypes.TraceState = {};
  for (const entry of entries) {
    const [key, value] = entry.split('=');
    apiTraceState[key] = value;
  }
  return apiTraceState;
}
