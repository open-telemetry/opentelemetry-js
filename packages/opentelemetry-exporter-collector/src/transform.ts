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
import { Attributes, TimedEvent, TraceState } from '@opentelemetry/types';
import * as collectorTypes from './types';

const OT_MAX_STRING_LENGTH = 128;
const OT_MAX_ATTRIBUTES = 30;

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
 * @param maxAttributes - default value is 30
 */
export function toCollectorAttributes(
  attributes: Attributes,
  maxAttributes: number = OT_MAX_ATTRIBUTES
): collectorTypes.Attributes {
  const attributeMap: collectorTypes.AttributeMap = {};
  let droppedAttributesCount = 0;

  const keys = Object.keys(attributes || {});

  const countKeys = Math.min(keys.length, maxAttributes);
  if (keys.length > maxAttributes) {
    droppedAttributesCount = keys.length - maxAttributes;
  }

  for (let i = 0; i <= countKeys - 1; i++) {
    const key = keys[i];
    const eventAttributeValue = toCollectorEventValue(
      attributes && attributes[key]
    );
    if (eventAttributeValue) {
      attributeMap[key] = eventAttributeValue;
    }
  }

  return {
    droppedAttributesCount,
    attributeMap,
  };
}

/**
 * convert event value
 * @param value event value
 */
export function toCollectorEventValue(
  value: unknown
): collectorTypes.AttributeValue | undefined {
  const attributeValue: collectorTypes.AttributeValue = {};

  if (typeof value === 'string') {
    attributeValue.stringValue = toCollectorTruncatableString(value);
  } else if (typeof value === 'boolean') {
    attributeValue.boolValue = value;
  } else if (typeof value === 'number') {
    if (Math.floor(value) === value) {
      attributeValue.intValue = value;
    } else {
      attributeValue.doubleValue = value;
    }
  }

  return attributeValue;
}

/**
 * convert events
 * @param events array of events
 * @param maxAttributes - maximum number of event attributes to be converted
 */
export function toCollectorEvents(
  events: TimedEvent[],
  maxAttributes: number = OT_MAX_ATTRIBUTES
): collectorTypes.TimeEvents {
  let droppedAnnotationsCount = 0;
  let droppedMessageEventsCount = 0; // not counting yet as messageEvent is not implemented

  const timeEvent: collectorTypes.TimeEvent[] = events.map(
    (event: TimedEvent) => {
      let attributes: collectorTypes.Attributes | undefined;

      if (event && event.attributes) {
        attributes = toCollectorAttributes(event.attributes, maxAttributes);
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

      // const messageEvent: MessageEvent;

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
 * @param span
 */
export function toCollectorSpan(span: ReadableSpan): collectorTypes.Span {
  return {
    traceId: hexToBase64(span.spanContext.traceId),
    spanId: hexToBase64(span.spanContext.spanId),
    parentSpanId: span.parentSpanId
      ? hexToBase64(span.parentSpanId)
      : undefined,
    tracestate: toTraceState(span.spanContext.traceState),
    name: toCollectorTruncatableString(span.name),
    kind: span.kind,
    startTime: hrTimeToTimeStamp(span.startTime),
    endTime: hrTimeToTimeStamp(span.endTime),
    attributes: toCollectorAttributes(span.attributes),
    // stackTrace: // not implemented
    timeEvents: toCollectorEvents(span.events),
    status: span.status,
    sameProcessAsParentSpan: !!span.parentSpanId,
    // childSpanCount: // not implemented
  };
}

/**
 * @param traceState
 */
function toTraceState(traceState?: TraceState): collectorTypes.TraceState {
  if (!traceState) return {};
  const entries = traceState.serialize().split(',');
  const apiTraceState: collectorTypes.TraceState = {};
  for (const entry of entries) {
    const [key, value] = entry.split('=');
    apiTraceState[key] = value;
  }
  return apiTraceState;
}
