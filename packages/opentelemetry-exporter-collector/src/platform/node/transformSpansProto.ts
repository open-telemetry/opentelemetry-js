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

/* eslint @typescript-eslint/no-var-requires: 0 */

// import * as pgTrace from '../../../generated/opentelemetry/proto/trace/v1/trace';
// import * as pgResource from '../../../generated/opentelemetry/proto/resource/v1/resource';
// import * as pgCommon from '../../../generated/opentelemetry/proto/common/v1/common';
// import * as pgCollector from '../../../generated/opentelemetry/proto/collector/trace/v1/trace_service';
const pgTrace = require('../../../generated/opentelemetry/proto/trace/v1/trace_pb');
const pgResource = require('../../../generated/opentelemetry/proto/resource/v1/resource_pb');
const pgCommon = require('../../../generated/opentelemetry/proto/common/v1/common_pb');
const pgCollector = require('../../../generated/opentelemetry/proto/collector/trace/v1/trace_service_pb');

import {
  Attributes,
  Link,
  SpanKind,
  Status,
  TimedEvent,
  TraceState,
} from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/tracing';
import { CollectorTraceExporterBase } from '../../CollectorTraceExporterBase';
import { groupSpansByResourceAndLibrary } from '../../transform';
import { COLLECTOR_SPAN_KIND_MAPPING, opentelemetryProto } from '../../types';
import ValueType = opentelemetryProto.common.v1.ValueType;
import { InstrumentationLibrary } from '@opentelemetry/core';
import { CollectorExporterConfigNode } from './types';

/**
 * Converts attributes
 * @param attributes
 */
export function toCollectorAttributes(attributes: Attributes) {
  //: pgCommon.opentelemetry.proto.common.v1.AttributeKeyValue[] {
  return Object.keys(attributes).map(key => {
    return toCollectorAttributeKeyValue(key, attributes[key]);
  });
}

/**
 * Converts key and value to AttributeKeyValue
 * @param value event value
 */
export function toCollectorAttributeKeyValue(key: string, value: unknown) {
  //: pgCommon.opentelemetry.proto.common.v1.AttributeKeyValue {
  const attributeKeyValue = new pgCommon.AttributeKeyValue();
  attributeKeyValue.setKey(key);

  if (typeof value === 'string') {
    attributeKeyValue.setStringValue(value);
    attributeKeyValue.setType(ValueType.STRING);
  } else if (typeof value === 'boolean') {
    attributeKeyValue.setBoolValue(value);
    attributeKeyValue.setType(ValueType.BOOL);
  } else if (typeof value === 'number') {
    // all numbers will be treated as double
    attributeKeyValue.setDoubleValue(value);
    attributeKeyValue.setType(ValueType.DOUBLE);
  }
  return attributeKeyValue;
}

/**
 *
 * Converts events
 * @param events array of events
 */
export function toCollectorEvents(timedEvents: TimedEvent[]) {
  //: pgTrace.opentelemetry.proto.trace.v1.Span.Event[] {
  return timedEvents.map(timedEvent => {
    const timeUnixNano = core.hrTimeToNanoseconds(timedEvent.time);
    const name = timedEvent.name;
    const attributes = toCollectorAttributes(timedEvent.attributes || {});
    const droppedAttributesCount = 0;
    const protoEvent = new pgTrace.Span.Event();
    protoEvent.setTimeUnixNano(timeUnixNano);
    protoEvent.setName(name);
    protoEvent.setAttributesList(attributes);
    protoEvent.setDroppedAttributesCount(droppedAttributesCount);

    return protoEvent;
  });
}

/**
 * Converts links
 * @param span
 */
export function toCollectorLinks(span: ReadableSpan) {
  //: pgTrace.opentelemetry.proto.trace.v1.Span.Link[] {
  return span.links.map((link: Link) => {
    const protoLink = new pgTrace.Span.Link();
    protoLink.setTraceId(hexToBuffer(link.context.traceId));
    protoLink.setSpanId(hexToBuffer(link.context.spanId));
    protoLink.setAttributesList(toCollectorAttributes(link.attributes || {}));
    protoLink.setDroppedAttributesCount(0);
    return protoLink;
  });
}

export function toCollectorStatus(status: Status) {
  //: pgTrace.opentelemetry.proto.trace.v1.Status {
  const protoStatus = new pgTrace.Status();
  protoStatus.setCode(status.code);
  protoStatus.setMessage(status.message);
  return protoStatus;
}

/**
 * Converts span
 * @param span
 */
export function toCollectorSpan(span: ReadableSpan) {
  //: pgTrace.opentelemetry.proto.trace.v1.Span {
  const protoSpan = new pgTrace.Span();

  protoSpan.setTraceId(hexToBuffer(span.spanContext.traceId));
  protoSpan.setSpanId(hexToBuffer(span.spanContext.spanId));
  if (span.parentSpanId) {
    protoSpan.setParentSpanId(hexToBuffer(span.parentSpanId));
  }
  protoSpan.setTraceState(toCollectorTraceState(span.spanContext.traceState));
  protoSpan.setName(span.name);
  protoSpan.setKind(toCollectorKind(span.kind));
  protoSpan.setStartTimeUnixNano(core.hrTimeToNanoseconds(span.startTime));
  protoSpan.setEndTimeUnixNano(core.hrTimeToNanoseconds(span.endTime));

  protoSpan.setAttributesList(toCollectorAttributes(span.attributes));
  protoSpan.setDroppedAttributesCount(0);

  protoSpan.setEventsList(toCollectorEvents(span.events));
  protoSpan.setDroppedEventsCount(0);

  protoSpan.setStatus(toCollectorStatus(span.status));

  protoSpan.setLinksList(toCollectorLinks(span));
  protoSpan.setDroppedLinksCount(0);

  return protoSpan;
}

/**
 * Converts resource
 * @param resource
 * @param additionalAttributes
 */
export function toCollectorResource(
  resource?: Resource,
  additionalAttributes: { [key: string]: unknown } = {}
) {
  //: pgResource.opentelemetry.proto.resource.v1.Resource {
  // pgResource.opentelemetry.proto.resource.v1.Resource
  // pgTrace.opentelemetry.proto. trace.v1.ResourceSpans
  const attr = Object.assign(
    {},
    additionalAttributes,
    resource ? resource.labels : {}
  );
  const resourceProto = new pgResource.Resource();
  const attributes = toCollectorAttributes(attr);
  resourceProto.setAttributesList(attributes);
  resourceProto.setDroppedAttributesCount(0);
  return resourceProto;
}

/**
 * Converts span kind
 * @param kind
 */
export function toCollectorKind(kind: SpanKind) {
  //: pgTrace.opentelemetry.proto.trace.v1.Span.SpanKind {
  const collectorKind = COLLECTOR_SPAN_KIND_MAPPING[kind];
  return typeof collectorKind === 'number'
    ? collectorKind
    : opentelemetryProto.trace.v1.Span.SpanKind.SPAN_KIND_UNSPECIFIED;
}

/**
 * Converts traceState
 * @param traceState
 */
export function toCollectorTraceState(traceState?: TraceState) {
  //: string | undefined {
  if (!traceState) {
    return undefined;
  }
  return traceState.serialize();
}

/**
 * Prepares trace service request to be sent to collector
 * @param spans spans
 * @param collectorTraceExporter
 * @param [name] Instrumentation Library Name
 */
export function toCollectorExportTraceServiceRequest<
  T extends CollectorExporterConfigNode
>(
  spans: ReadableSpan[],
  collectorTraceExporter: CollectorTraceExporterBase<T>
) {
  //: pgCollector.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest {
  const groupedSpans: Map<
    Resource,
    Map<core.InstrumentationLibrary, ReadableSpan[]>
  > = groupSpansByResourceAndLibrary(spans);

  const additionalAttributes = Object.assign(
    {},
    collectorTraceExporter.attributes || {},
    {
      'service.name': collectorTraceExporter.serviceName,
    }
  );

  const exportTraceServiceRequest = new pgCollector.ExportTraceServiceRequest();
  const resourceSpans = toCollectorResourceSpans(
    groupedSpans,
    additionalAttributes
  );
  exportTraceServiceRequest.setResourceSpansList(resourceSpans);

  return exportTraceServiceRequest;
}

function toCollectorInstrumentationLibrarySpans(
  instrumentationLibrary: InstrumentationLibrary,
  spans: ReadableSpan[]
) {
  //: pgTrace.opentelemetry.proto.trace.v1.InstrumentationLibrarySpans {
  const instrumentationLibrarySpans = new pgTrace.InstrumentationLibrarySpans();

  const protoSpans = spans.map(toCollectorSpan);
  instrumentationLibrarySpans.setSpansList(protoSpans);

  const protoInstrumentationLibrary = new pgCommon.InstrumentationLibrary();
  protoInstrumentationLibrary.setName(instrumentationLibrary.name);
  protoInstrumentationLibrary.setVersion(instrumentationLibrary.version);
  instrumentationLibrarySpans.setInstrumentationLibrary(
    protoInstrumentationLibrary
  );

  return instrumentationLibrarySpans;
}

function toCollectorResourceSpans(
  groupedSpans: Map<Resource, Map<core.InstrumentationLibrary, ReadableSpan[]>>,
  baseAttributes: Attributes
) {
  //: pgTrace.opentelemetry.proto.trace.v1.ResourceSpans[] {
  return Array.from(groupedSpans, ([resource, libSpans]) => {
    const resourceSpans = new pgTrace.ResourceSpans();
    const res = toCollectorResource(resource, baseAttributes);
    resourceSpans.setResource(res);
    const instrumentationLibrarySpans = Array.from(
      libSpans,
      ([instrumentationLibrary, spans]) =>
        toCollectorInstrumentationLibrarySpans(instrumentationLibrary, spans)
    );
    resourceSpans.setInstrumentationLibrarySpansList(
      instrumentationLibrarySpans
    );
    return resourceSpans;
  });
}

function hexToBuffer(hexStr: string): Uint8Array {
  const hexStrLen = hexStr.length;
  let hexAsciiCharsStr = '';
  for (let i = 0; i < hexStrLen; i += 2) {
    const hexPair = hexStr.substring(i, i + 2);
    const hexVal = parseInt(hexPair, 16);
    hexAsciiCharsStr += String.fromCharCode(hexVal);
  }
  return Buffer.from(hexAsciiCharsStr, 'ascii');
}
