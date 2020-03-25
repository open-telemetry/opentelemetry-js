/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { Attributes, Link, TimedEvent, TraceState } from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/tracing';
import { opentelemetryProto } from './types';
import * as collectorTypes from './types';
import ValueType = opentelemetryProto.common.v1.ValueType;
import { SDK_INFO } from '@opentelemetry/base';

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
 * convert attributes to proto
 * @param attributes
 */
export function toCollectorAttributes(
  attributes: Attributes
): opentelemetryProto.common.v1.AttributeKeyValue[] {
  const keys = Object.keys(attributes);
  const protoAttributes: opentelemetryProto.common.v1.AttributeKeyValue[] = [];
  keys.forEach(key => {
    protoAttributes.push(toCollectorEventValue(key, attributes[key]));
  });

  return protoAttributes;
}

/**
 * convert event value
 * @param value event value
 */
export function toCollectorEventValue(
  key: string,
  value: unknown
): opentelemetryProto.common.v1.AttributeKeyValue {
  let aType: opentelemetryProto.common.v1.ValueType = ValueType.STRING;
  const attributeValue: opentelemetryProto.common.v1.AttributeKeyValue = {
    key,
    type: 0,
  };
  if (typeof value === 'string') {
    attributeValue.stringValue = value;
  } else if (typeof value === 'boolean') {
    aType = ValueType.BOOL;
    attributeValue.boolValue = value;
  } else if (typeof value === 'number') {
    // all numbers will be treated as double
    aType = ValueType.DOUBLE;
    attributeValue.doubleValue = value;
  }

  attributeValue.type = aType;

  return attributeValue;
}

/**
 *
 * convert events to proto
 * @param events array of events
 */
export function toCollectorEvents(
  timedEvents: TimedEvent[]
): opentelemetryProto.trace.v1.Span.Event[] {
  const protoEvents: opentelemetryProto.trace.v1.Span.Event[] = [];
  timedEvents.forEach(timedEvent => {
    const timeUnixNano = core.hrTimeToNanoseconds(timedEvent.time);
    const name = timedEvent.name;
    const attributes = toCollectorAttributes(timedEvent.attributes || {});
    const droppedAttributesCount = 0;

    const protoEvent: opentelemetryProto.trace.v1.Span.Event = {
      timeUnixNano,
      name,
      attributes,
      droppedAttributesCount,
    };

    protoEvents.push(protoEvent);
  });
  return protoEvents;
}

export function toCollectorLinks(
  span: ReadableSpan
): opentelemetryProto.trace.v1.Span.Link[] {
  const protoLinks: opentelemetryProto.trace.v1.Span.Link[] = span.links.map(
    (link: Link) => {
      const protoLink: opentelemetryProto.trace.v1.Span.Link = {
        traceId: core.hexToBytes(link.context.traceId),
        spanId: core.hexToBytes(link.context.spanId),
        attributes: toCollectorAttributes(link.attributes || {}),
        droppedAttributesCount: 0,
      };
      return protoLink;
    }
  );
  return protoLinks;
}

export function toCollectorSpan(
  span: ReadableSpan
): opentelemetryProto.trace.v1.Span {
  return {
    traceId: core.hexToBytes(span.spanContext.traceId),
    spanId: core.hexToBytes(span.spanContext.spanId),
    parentSpanId: span.parentSpanId
      ? core.hexToBytes(span.parentSpanId)
      : undefined,
    traceState: toCollectorTraceState(span.spanContext.traceState),
    name: toCollectorTruncatableString(span.name),
    kind: span.kind + 1,
    startTimeUnixNano: core.hrTimeToNanoseconds(span.startTime),
    endTimeUnixNano: core.hrTimeToNanoseconds(span.endTime),
    attributes: toCollectorAttributes(span.attributes),
    droppedAttributesCount: 0,
    events: toCollectorEvents(span.events),
    droppedEventsCount: 0,
    status: span.status,
    links: toCollectorLinks(span),
    droppedLinksCount: 0,
  };
}

export function toCollectorResource(
  resource?: Resource
): opentelemetryProto.resource.v1.Resource {
  const resourceProto: opentelemetryProto.resource.v1.Resource = {
    attributes: toCollectorAttributes(resource ? resource.labels : {}),
    droppedAttributesCount: 0,
  };

  return resourceProto;
}

/**
 * @param traceState
 */
export function toCollectorTraceState(
  traceState?: TraceState
): opentelemetryProto.trace.v1.Span.TraceState | undefined {
  if (!traceState) return undefined;
  return traceState.serialize();
}

/**
 *
 * @param spans spans in proto format
 * @param resource Resource in proto format
 * @param [name] Instrumentation Library Name
 */
export function toCollectorExportTraceServiceRequest(
  spans: opentelemetryProto.trace.v1.Span[],
  resource: opentelemetryProto.resource.v1.Resource,
  name: string = ''
): opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
  const instrumentationLibrarySpans: opentelemetryProto.trace.v1.InstrumentationLibrarySpans = {
    spans,
    instrumentationLibrary: {
      name: name || `${SDK_INFO.NAME} - ${SDK_INFO.LANGUAGE}`,
      version: SDK_INFO.VERSION,
    },
  };
  const resourceSpan: opentelemetryProto.trace.v1.ResourceSpans = {
    resource,
    instrumentationLibrarySpans: [instrumentationLibrarySpans],
  };

  return {
    resourceSpans: [resourceSpan],
  };
}
