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
import { toCollectorTruncatableString } from '../../transform';
import { VERSION } from '../../version';
import { opentelemetry } from './grpc/types';
import ValueType = opentelemetry.proto.common.v1.ValueType;

/**
 * convert attributes to proto
 * @param attributes
 */
export function toCollectorProtoAttributes(
  attributes: Attributes
): opentelemetry.proto.common.v1.AttributeKeyValue[] {
  const keys = Object.keys(attributes);
  const protoAttributes: opentelemetry.proto.common.v1.AttributeKeyValue[] = [];
  keys.forEach(key => {
    protoAttributes.push(toCollectorEventProtoValue(key, attributes[key]));
  });

  return protoAttributes;
}

/**
 * convert event value
 * @param value event value
 */
export function toCollectorEventProtoValue(
  key: string,
  value: unknown
): opentelemetry.proto.common.v1.AttributeKeyValue {
  let aType: opentelemetry.proto.common.v1.ValueType = ValueType.STRING;
  const attributeValue: opentelemetry.proto.common.v1.AttributeKeyValue = {
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
export function toCollectorProtoEvents(
  timedEvents: TimedEvent[]
): opentelemetry.proto.trace.v1.Span.Event[] {
  const protoEvents: opentelemetry.proto.trace.v1.Span.Event[] = [];
  timedEvents.forEach(timedEvent => {
    const timeUnixNano = core.hrTimeToNanoseconds(timedEvent.time);
    const name = timedEvent.name;
    const attributes = toCollectorProtoAttributes(timedEvent.attributes || {});
    const droppedAttributesCount = 0;

    const protoEvent: opentelemetry.proto.trace.v1.Span.Event = {
      timeUnixNano,
      name,
      attributes,
      droppedAttributesCount,
    };

    protoEvents.push(protoEvent);
  });
  return protoEvents;
}

export function toCollectorProtoLinks(
  span: ReadableSpan
): opentelemetry.proto.trace.v1.Span.Link[] {
  const protoLinks: opentelemetry.proto.trace.v1.Span.Link[] = span.links.map(
    (link: Link) => {
      const protoLink: opentelemetry.proto.trace.v1.Span.Link = {
        traceId: Buffer.from(core.hexToBase64(link.context.traceId), 'base64'),
        spanId: Buffer.from(core.hexToBase64(link.context.spanId), 'base64'),
        attributes: toCollectorProtoAttributes(link.attributes || {}),
        droppedAttributesCount: 0,
      };
      return protoLink;
    }
  );
  return protoLinks;
}

export function toCollectorProtoSpan(
  span: ReadableSpan
): opentelemetry.proto.trace.v1.Span {
  return {
    traceId: Buffer.from(core.hexToBase64(span.spanContext.traceId), 'base64'),
    spanId: Buffer.from(core.hexToBase64(span.spanContext.spanId), 'base64'),
    parentSpanId: span.parentSpanId
      ? Buffer.from(core.hexToBase64(span.parentSpanId), 'base64')
      : undefined,
    traceState: toCollectorProtoTraceState(span.spanContext.traceState),
    name: toCollectorTruncatableString(span.name),
    kind: span.kind + 1,
    startTimeUnixNano: core.hrTimeToNanoseconds(span.startTime),
    endTimeUnixNano: core.hrTimeToNanoseconds(span.endTime),
    attributes: toCollectorProtoAttributes(span.attributes),
    droppedAttributesCount: 0,
    events: toCollectorProtoEvents(span.events),
    droppedEventsCount: 0,
    status: span.status,
    links: toCollectorProtoLinks(span),
    droppedLinksCount: 0,
  };
}

export function toCollectorProtoResource(
  resource?: Resource
): opentelemetry.proto.resource.v1.Resource {
  const resourceProto: opentelemetry.proto.resource.v1.Resource = {
    attributes: toCollectorProtoAttributes(resource ? resource.labels : {}),
    droppedAttributesCount: 0,
  };

  return resourceProto;
}

/**
 * @param traceState
 */
export function toCollectorProtoTraceState(
  traceState?: TraceState
): opentelemetry.proto.trace.v1.Span.TraceState | undefined {
  if (!traceState) return undefined;
  return traceState.serialize();
}

/**
 *
 * @param spans
 */
export function toCollectorProtoExportTraceServiceRequest(
  spans: opentelemetry.proto.trace.v1.Span[],
  resource: opentelemetry.proto.resource.v1.Resource
): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest {
  const instrumentationLibrarySpans: opentelemetry.proto.trace.v1.InstrumentationLibrarySpans = {
    spans,
    instrumentationLibrary: {
      name: '',
      version: VERSION,
    },
  };
  const resourceSpan: opentelemetry.proto.trace.v1.ResourceSpans = {
    resource,
    instrumentationLibrarySpans: [instrumentationLibrarySpans],
  };

  return {
    resourceSpans: [resourceSpan],
  };
}
