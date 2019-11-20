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

import {
  spanIdToBase64,
  hrTimeEndTime,
  hrTimeToTimeStamp,
} from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';
import { Attributes, TimedEvent, TraceState } from '@opentelemetry/types';
import {
  OTCAttributeMap,
  OTCAnnotation,
  OTCAttributes,
  OTCAttributeValue,
  OTCSpan,
  OTCTimeEvent,
  OTCTimeEvents,
  OTCTruncatableString,
  OTCTraceState,
} from './types';

const OC_MAX_STRING_LENGTH = 128;
const OC_MAX_ATTRIBUTES = 30;

/**
 * convert string to maximum length of 128, providing information of truncated bytes
 * @param name - string to be converted
 */
export function stringToTruncatableString(name: string): OTCTruncatableString {
  const value = name.substr(0, OC_MAX_STRING_LENGTH);
  const truncatedByteCount =
    name.length > OC_MAX_STRING_LENGTH ? name.length - OC_MAX_STRING_LENGTH : 0;

  return { value, truncatedByteCount };
}

/**
 * convert attributes
 * @param attributes
 * @param maxAttributes - default value is 30
 */
export function convertAttributesToOTCAttributes(
  attributes: Attributes,
  maxAttributes: number = OC_MAX_ATTRIBUTES
): OTCAttributes {
  const attributeMap: OTCAttributeMap = {};
  let droppedAttributesCount = 0;

  const keys = Object.keys(attributes || {});

  const countKeys = Math.min(keys.length, maxAttributes);
  if (keys.length > maxAttributes) {
    droppedAttributesCount = keys.length - maxAttributes;
  }

  for (let i = 0; i <= countKeys - 1; i++) {
    const key = keys[i];
    const eventAttributeValue = convertEventValueToOTCValue(
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
export function convertEventValueToOTCValue(
  value: unknown
): OTCAttributeValue | undefined {
  const ocAttributeValue: OTCAttributeValue = {};

  if (typeof value === 'string') {
    ocAttributeValue.stringValue = stringToTruncatableString(value);
  } else if (typeof value === 'boolean') {
    ocAttributeValue.boolValue = value;
  } else if (typeof value === 'number') {
    if (Math.floor(value) === value) {
      ocAttributeValue.intValue = value;
    } else {
      ocAttributeValue.doubleValue = value;
    }
  }

  return ocAttributeValue;
}

/**
 * convert events
 * @param events array of events
 * @param maxAttributes - maximum number of event attributes to be converted
 */
export function convertEventsToOTCEvents(
  events: TimedEvent[],
  maxAttributes: number = OC_MAX_ATTRIBUTES
): OTCTimeEvents {
  let droppedAnnotationsCount = 0;
  let droppedMessageEventsCount = 0; // not counting yet as messageEvent is not implemented

  const timeEvent: OTCTimeEvent[] = events.map((event: TimedEvent) => {
    let attributes: OTCAttributes | undefined;

    if (event && event.attributes) {
      attributes = convertAttributesToOTCAttributes(
        event.attributes,
        maxAttributes
      );
      droppedAnnotationsCount += attributes.droppedAttributesCount || 0;
    }

    let annotation: OTCAnnotation = {};
    if (event.name || attributes) {
      annotation = {};
    }

    if (event.name) {
      annotation.description = stringToTruncatableString(event.name);
    }

    if (typeof attributes !== 'undefined') {
      annotation.attributes = attributes;
    }

    // const messageEvent: MessageEvent;

    const ocTimeEvent: OTCTimeEvent = {
      time: hrTimeToTimeStamp(event.time),
      // messageEvent,
    };

    if (annotation) {
      ocTimeEvent.annotation = annotation;
    }

    return ocTimeEvent;
  });

  return {
    timeEvent,
    droppedAnnotationsCount,
    droppedMessageEventsCount,
  };
}

/**
 * @param span
 */
export function convertSpan(span: ReadableSpan): OTCSpan {
  return {
    traceId: spanIdToBase64(span.spanContext.traceId),
    spanId: spanIdToBase64(span.spanContext.spanId),
    parentSpanId: span.parentSpanId
      ? spanIdToBase64(span.parentSpanId)
      : undefined,
    tracestate: convertTraceStateToOTCTraceState(span.spanContext.traceState),
    name: stringToTruncatableString(span.name),
    kind: span.kind,
    startTime: hrTimeToTimeStamp(span.startTime),
    endTime: hrTimeToTimeStamp(hrTimeEndTime(span.startTime, span.duration)),
    attributes: convertAttributesToOTCAttributes(span.attributes),
    // stackTrace: // not implemented
    timeEvents: convertEventsToOTCEvents(span.events),
    status: span.status,
    sameProcessAsParentSpan: !!span.parentSpanId,
    // childSpanCount: // not implemented
  };
}

/**
 * @param traceState
 */
function convertTraceStateToOTCTraceState(
  traceState?: TraceState
): OTCTraceState {
  if (!traceState) return {};
  const entries = traceState.serialize().split(',');
  const apiTraceState: OTCTraceState = {};
  for (const entry of entries) {
    const [key, value] = entry.split('=');
    apiTraceState[key] = value;
  }
  return apiTraceState;
}
