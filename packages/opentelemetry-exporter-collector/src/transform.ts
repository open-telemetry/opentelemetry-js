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
import { CollectorExporter } from './CollectorExporter';
import { opentelemetryProto } from './types';
import ValueType = opentelemetryProto.common.v1.ValueType;
import { SDK_INFO } from '@opentelemetry/base';

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
    protoAttributes.push(toCollectorAttributeKeyValue(key, attributes[key]));
  });

  return protoAttributes;
}

/**
 * convert event value
 * @param value event value
 */
export function toCollectorAttributeKeyValue(
  key: string,
  value: unknown
): opentelemetryProto.common.v1.AttributeKeyValue {
  let aType: opentelemetryProto.common.v1.ValueType = ValueType.STRING;
  const AttributeKeyValue: opentelemetryProto.common.v1.AttributeKeyValue = {
    key,
    type: 0,
  };
  if (typeof value === 'string') {
    AttributeKeyValue.stringValue = value;
  } else if (typeof value === 'boolean') {
    aType = ValueType.BOOL;
    AttributeKeyValue.boolValue = value;
  } else if (typeof value === 'number') {
    // all numbers will be treated as double
    aType = ValueType.DOUBLE;
    AttributeKeyValue.doubleValue = value;
  }

  AttributeKeyValue.type = aType;

  return AttributeKeyValue;
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
        traceId: core.hexToBase64(link.context.traceId),
        spanId: core.hexToBase64(link.context.spanId),
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
    traceId: core.hexToBase64(span.spanContext.traceId),
    spanId: core.hexToBase64(span.spanContext.spanId),
    parentSpanId: span.parentSpanId
      ? core.hexToBase64(span.parentSpanId)
      : undefined,
    traceState: toCollectorTraceState(span.spanContext.traceState),
    name: span.name,
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
  resource?: Resource,
  additionalAttributes: { [key: string]: any } = {}
): opentelemetryProto.resource.v1.Resource {
  const attr = Object.assign(
    {},
    additionalAttributes,
    resource ? resource.labels : {}
  );
  const resourceProto: opentelemetryProto.resource.v1.Resource = {
    attributes: toCollectorAttributes(attr),
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
 * @param spans spans
 * @param collectorExporter
 * @param [name] Instrumentation Library Name
 */
export function toCollectorExportTraceServiceRequest(
  spans: ReadableSpan[],
  collectorExporter: CollectorExporter,
  name: string = ''
): opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
  const spansToBeSent: opentelemetryProto.trace.v1.Span[] = spans.map(span =>
    toCollectorSpan(span)
  );
  const resource: Resource | undefined =
    spans.length > 0 ? spans[0].resource : Resource.empty();

  const additionalAttributes = Object.assign(
    {},
    collectorExporter.attributes || {},
    {
      'service.name': collectorExporter.serviceName,
    }
  );
  const protoResource: opentelemetryProto.resource.v1.Resource = toCollectorResource(
    resource,
    additionalAttributes
  );
  const instrumentationLibrarySpans: opentelemetryProto.trace.v1.InstrumentationLibrarySpans = {
    spans: spansToBeSent,
    instrumentationLibrary: {
      name: name || `${SDK_INFO.NAME} - ${SDK_INFO.LANGUAGE}`,
      version: SDK_INFO.VERSION,
    },
  };
  const resourceSpan: opentelemetryProto.trace.v1.ResourceSpans = {
    resource: protoResource,
    instrumentationLibrarySpans: [instrumentationLibrarySpans],
  };

  return {
    resourceSpans: [resourceSpan],
  };
}
