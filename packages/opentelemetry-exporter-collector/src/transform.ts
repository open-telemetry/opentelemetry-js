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

import {
  Attributes,
  Link,
  SpanKind,
  TimedEvent,
  TraceState,
  Labels,
} from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/tracing';
import { CollectorTraceExporterBase } from './CollectorTraceExporterBase';
import { CollectorMetricExporterBase } from './CollectorMetricExporterBase';
import {
  COLLECTOR_SPAN_KIND_MAPPING,
  opentelemetryProto,
  CollectorExporterConfigBase,
} from './types';
import ValueType = opentelemetryProto.common.v1.ValueType;
import { ValueType as apiValueType } from '@opentelemetry/api';
import {
  MetricRecord,
  MetricDescriptor,
  MetricKind,
} from '@opentelemetry/metrics';

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
 * Converts labels
 * @param labels
 */
export function toCollectorLabels(
  labels: Labels
): opentelemetryProto.common.v1.StringKeyValue[] {
  return Object.keys(labels).map(key => {
    return { key: key, value: labels[key] };
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
  const collectorKind = COLLECTOR_SPAN_KIND_MAPPING[kind];
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
 * @param collectorTraceExporterBase
 * @param [name] Instrumentation Library Name
 */
export function toCollectorExportTraceServiceRequest<
  T extends CollectorExporterConfigBase
>(
  spans: ReadableSpan[],
  collectorTraceExporterBase: CollectorTraceExporterBase<T>,
  name = ''
): opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
  const groupedSpans: Map<
    Resource,
    Map<core.InstrumentationLibrary, ReadableSpan[]>
  > = groupSpansByResourceAndLibrary(spans);

  const additionalAttributes = Object.assign(
    {},
    collectorTraceExporterBase.attributes || {},
    {
      'service.name': collectorTraceExporterBase.serviceName,
    }
  );

  return {
    resourceSpans: toCollectorResourceSpans(groupedSpans, additionalAttributes),
  };
}

/**
 * Takes an array of spans and groups them by resource and instrumentation
 * library
 * @param spans spans
 */
export function groupSpansByResourceAndLibrary(
  spans: ReadableSpan[]
): Map<Resource, Map<core.InstrumentationLibrary, ReadableSpan[]>> {
  return spans.reduce((spanMap, span) => {
    //group by resource
    let resourceSpans = spanMap.get(span.resource);
    if (!resourceSpans) {
      resourceSpans = new Map<core.InstrumentationLibrary, ReadableSpan[]>();
      spanMap.set(span.resource, resourceSpans);
    }
    //group by instrumentation library
    let libSpans = resourceSpans.get(span.instrumentationLibrary);
    if (!libSpans) {
      libSpans = new Array<ReadableSpan>();
      resourceSpans.set(span.instrumentationLibrary, libSpans);
    }
    libSpans.push(span);
    return spanMap;
  }, new Map<Resource, Map<core.InstrumentationLibrary, ReadableSpan[]>>());
}

function toCollectorInstrumentationLibrarySpans(
  instrumentationLibrary: core.InstrumentationLibrary,
  spans: ReadableSpan[]
): opentelemetryProto.trace.v1.InstrumentationLibrarySpans {
  return {
    spans: spans.map(toCollectorSpan),
    instrumentationLibrary,
  };
}

/**
 * Given a MetricDescriptor, return its type in a compatible format with the collector
 * @param descriptor
 */
export function toCollectorType(
  descriptor: MetricDescriptor
): opentelemetryProto.metrics.v1.MetricDescriptorType {
  if (
    descriptor.metricKind === MetricKind.UP_DOWN_COUNTER ||
    descriptor.metricKind === MetricKind.OBSERVER
  ) {
    if (descriptor.valueType === apiValueType.INT) {
      return opentelemetryProto.metrics.v1.MetricDescriptorType.INT64;
    }
    return opentelemetryProto.metrics.v1.MetricDescriptorType.DOUBLE;
  }
  // Monotonic counter
  else if (descriptor.metricKind === MetricKind.COUNTER) {
    if (descriptor.valueType === apiValueType.INT) {
      return opentelemetryProto.metrics.v1.MetricDescriptorType.MONOTONIC_INT64;
    }
    return opentelemetryProto.metrics.v1.MetricDescriptorType.MONOTONIC_DOUBLE;
  } else {
    // Other types not yet implemented
    return opentelemetryProto.metrics.v1.MetricDescriptorType.INVALID_TYPE;
  }
}

/**
 * Given a MetricDescriptor, return its temporality in a compatible format with the collector
 * @param descriptor
 */
export function toCollectorTemporality(
  descriptor: MetricDescriptor
): opentelemetryProto.metrics.v1.MetricDescriptorTemporality {
  if (descriptor.metricKind === MetricKind.COUNTER) {
    return opentelemetryProto.metrics.v1.MetricDescriptorTemporality.CUMULATIVE;
  } else if (descriptor.metricKind === MetricKind.OBSERVER) {
    return opentelemetryProto.metrics.v1.MetricDescriptorTemporality
      .INSTANTANEOUS;
  } else if (descriptor.metricKind === MetricKind.VALUE_RECORDER) {
    return opentelemetryProto.metrics.v1.MetricDescriptorTemporality.DELTA;
  }
  return opentelemetryProto.metrics.v1.MetricDescriptorTemporality
    .INVALID_TEMPORALITY;
}

/**
 * Given a MetricRecord, return the Collector compatible type of MetricDescriptor
 * @param metric
 */
export function toCollectorMetricDescriptor(
  metric: MetricRecord
): opentelemetryProto.metrics.v1.MetricDescriptor {
  return {
    name: metric.descriptor.name,
    description: metric.descriptor.description,
    unit: metric.descriptor.unit,
    labels: toCollectorLabels(metric.labels),
    type: toCollectorType(metric.descriptor),
    temporality: toCollectorTemporality(metric.descriptor),
  };
}

/**
 * Converts a metric to be compatible with the collector
 * @param metric
 * @param startTime start time in nanoseconds
 */
export function toCollectorMetric(
  metric: MetricRecord,
  startTime: number
): opentelemetryProto.metrics.v1.Metric {
  let int64DataPoints: opentelemetryProto.metrics.v1.Int64DataPoint[] = [];
  let doubleDataPoints: opentelemetryProto.metrics.v1.DoubleDataPoint[] = [];

  const points = {
    labels: toCollectorLabels(metric.labels),
    value: metric.aggregator.toPoint().value as number,
    startTimeUnixNano: startTime,
    timeUnixNano: core.hrTimeToNanoseconds(
      metric.aggregator.toPoint().timestamp
    ),
  };

  if (metric.descriptor.valueType == apiValueType.INT) {
    int64DataPoints = [points];
  } else if (metric.descriptor.valueType === apiValueType.DOUBLE) {
    doubleDataPoints = [points];
  }

  return {
    metricDescriptor: toCollectorMetricDescriptor(metric),
    doubleDataPoints,
    int64DataPoints,
    summaryDataPoints: [],
    histogramDataPoints: [],
  };
}

/**
 * Prepares metric service request to be sent to collector
 * @param metrics metrics
 * @param startTime start time of the metric in nanoseconds
 * @param collectorMetricExporterBase
 * @param [name] Instrumentation Library Name
 */
export function toCollectorExportMetricServiceRequest<
  T extends CollectorExporterConfigBase
>(
  metrics: MetricRecord[],
  startTime: number,
  collectorMetricExporterBase: CollectorMetricExporterBase<T>,
  name = ''
): opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
  const metricsToBeSent: opentelemetryProto.metrics.v1.Metric[] = metrics.map(
    metric => toCollectorMetric(metric, startTime)
  );

  const resource: Resource =
    metrics.length > 0 ? metrics[0].resource : Resource.empty();
  const additionalAttributes = Object.assign(
    {},
    collectorMetricExporterBase.attributes || {},
    {
      'service.name': collectorMetricExporterBase.serviceName,
    }
  );
  const protoResource: opentelemetryProto.resource.v1.Resource = toCollectorResource(
    resource,
    additionalAttributes
  );

  const instrumentationLibraryMetrics: opentelemetryProto.metrics.v1.InstrumentationLibraryMetrics = {
    metrics: metricsToBeSent,
    instrumentationLibrary: {
      name: name || `${core.SDK_INFO.NAME} - ${core.SDK_INFO.LANGUAGE}`,
      version: core.SDK_INFO.VERSION,
    },
  };

  const resourceMetric: opentelemetryProto.metrics.v1.ResourceMetrics = {
    resource: protoResource,
    instrumentationLibraryMetrics: [instrumentationLibraryMetrics],
  };
  return {
    resourceMetrics: [resourceMetric],
  };
}

function toCollectorResourceSpans(
  groupedSpans: Map<Resource, Map<core.InstrumentationLibrary, ReadableSpan[]>>,
  baseAttributes: Attributes
): opentelemetryProto.trace.v1.ResourceSpans[] {
  return Array.from(groupedSpans, ([resource, libSpans]) => {
    return {
      resource: toCollectorResource(resource, baseAttributes),
      instrumentationLibrarySpans: Array.from(
        libSpans,
        ([instrumentationLibrary, spans]) =>
          toCollectorInstrumentationLibrarySpans(instrumentationLibrary, spans)
      ),
    };
  });
}
