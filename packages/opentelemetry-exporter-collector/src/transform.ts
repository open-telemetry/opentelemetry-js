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

import {
  Attributes,
  Link,
  SpanKind,
  TimedEvent,
  TraceState,
} from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/tracing';
import { CollectorExporter } from './CollectorExporter';
import { COLLETOR_SPAN_KIND_MAPPING, opentelemetryProto } from './types';
import ValueType = opentelemetryProto.common.v1.ValueType;

/**
 * Converts attributes
 * @param attributes
 */
export function toCollectorAttributes(
  attributes: Attributes
): opentelemetryProto.common.v1.AttributeKeyValue[] {
  return Object.keys(attributes).map(key => {
    return toCollectorAttributeKeyValue(key, attributes[key]);
  });
}

/**
 * Converts key and value to AttributeKeyValue
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
 * Converts events
 * @param events array of events
 */
export function toCollectorEvents(
  timedEvents: TimedEvent[]
): opentelemetryProto.trace.v1.Span.Event[] {
  return timedEvents.map(timedEvent => {
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

    return protoEvent;
  });
}

/**
 * Converts links
 * @param span
 */
export function toCollectorLinks(
  span: ReadableSpan
): opentelemetryProto.trace.v1.Span.Link[] {
  return span.links.map((link: Link) => {
    const protoLink: opentelemetryProto.trace.v1.Span.Link = {
      traceId: core.hexToBase64(link.context.traceId),
      spanId: core.hexToBase64(link.context.spanId),
      attributes: toCollectorAttributes(link.attributes || {}),
      droppedAttributesCount: 0,
    };
    return protoLink;
  });
}

/**
 * Converts span
 * @param span
 */
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
    kind: toCollectorKind(span.kind),
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

/**
 * Converts resource
 * @param resource
 * @param additionalAttributes
 */
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
 * Converts span kind
 * @param kind
 */
export function toCollectorKind(
  kind: SpanKind
): opentelemetryProto.trace.v1.Span.SpanKind {
  const collectorKind = COLLETOR_SPAN_KIND_MAPPING[kind];
  return typeof collectorKind === 'number'
    ? collectorKind
    : opentelemetryProto.trace.v1.Span.SpanKind.SPAN_KIND_UNSPECIFIED;
}

/**
 * Converts traceState
 * @param traceState
 */
export function toCollectorTraceState(
  traceState?: TraceState
): opentelemetryProto.trace.v1.Span.TraceState | undefined {
  if (!traceState) return undefined;
  return traceState.serialize();
}

/**
 * Prepares trace service request to be sent to collector
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
  const resource: Resource =
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
      name: name || `${core.SDK_INFO.NAME} - ${core.SDK_INFO.LANGUAGE}`,
      version: core.SDK_INFO.VERSION,
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
