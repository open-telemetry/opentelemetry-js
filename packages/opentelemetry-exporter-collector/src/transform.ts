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
  MetricKind,
  LastValueAggregator,
  HistogramAggregator,
  MinMaxSumCountAggregator,
  Histogram,
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
 */
export function toCollectorExportTraceServiceRequest<
  T extends CollectorExporterConfigBase
>(
  spans: ReadableSpan[],
  collectorTraceExporterBase: CollectorTraceExporterBase<T>
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

/**
 * Takes an array of metrics and groups them by resource and instrumentation
 * library
 * @param metrics metrics
 */
export function groupMetricsByResourceAndLibrary(
  metrics: MetricRecord[]
): Map<Resource, Map<core.InstrumentationLibrary, MetricRecord[]>> {
  return metrics.reduce((metricMap, metric) => {
    //group by resource
    let resourceMetrics = metricMap.get(metric.resource);
    if (!resourceMetrics) {
      resourceMetrics = new Map<core.InstrumentationLibrary, MetricRecord[]>();
      metricMap.set(metric.resource, resourceMetrics);
    }
    //group by instrumentation library
    let libMetrics = resourceMetrics.get(metric.instrumentationLibrary);
    if (!libMetrics) {
      libMetrics = new Array<MetricRecord>();
      resourceMetrics.set(metric.instrumentationLibrary, libMetrics);
    }
    libMetrics.push(metric);
    return metricMap;
  }, new Map<Resource, Map<core.InstrumentationLibrary, MetricRecord[]>>());
}

/**
 * Convert to InstrumentationLibraryMetrics
 * @param instrumentationLibrary
 * @param metrics
 * @param startTime
 */
function toCollectorInstrumentationLibraryMetrics(
  instrumentationLibrary: core.InstrumentationLibrary,
  metrics: MetricRecord[],
  startTime: number
): opentelemetryProto.metrics.v1.InstrumentationLibraryMetrics {
  return {
    metrics: metrics.map(metric => {
      return toCollectorMetric(metric, startTime);
    }),
    instrumentationLibrary,
  };
}

/**
 * Convert to InstrumentationLibrarySpans
 * @param instrumentationLibrary
 * @param spans
 */
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
  metric: MetricRecord
): opentelemetryProto.metrics.v1.MetricDescriptorType {
  const metricKind = metric.descriptor.metricKind;
  const valueType = metric.descriptor.valueType;
  if (
    metricKind === MetricKind.COUNTER ||
    metricKind === MetricKind.SUM_OBSERVER
  ) {
    if (valueType === apiValueType.INT) {
      return opentelemetryProto.metrics.v1.MetricDescriptorType.MONOTONIC_INT64;
    }
    return opentelemetryProto.metrics.v1.MetricDescriptorType.MONOTONIC_DOUBLE;
  } else if (metric.aggregator instanceof HistogramAggregator) {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.HISTOGRAM;
  } else if (metric.aggregator instanceof MinMaxSumCountAggregator) {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.SUMMARY;
  } else if (valueType == apiValueType.INT) {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.INT64;
  } else if (valueType === apiValueType.DOUBLE) {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.DOUBLE;
  } else {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.INVALID_TYPE;
  }
}

/**
 * Given a MetricDescriptor, return its temporality in a compatible format with the collector
 * @param descriptor
 */
export function toCollectorTemporality(
  metric: MetricRecord
): opentelemetryProto.metrics.v1.MetricDescriptorTemporality {
  const metricKind = metric.descriptor.metricKind;
  const aggregator = metric.aggregator;
  if (
    metricKind === MetricKind.COUNTER ||
    metricKind === MetricKind.SUM_OBSERVER
  ) {
    return opentelemetryProto.metrics.v1.MetricDescriptorTemporality.CUMULATIVE;
  } else if (
    metricKind === MetricKind.UP_DOWN_COUNTER ||
    metricKind === MetricKind.UP_DOWN_SUM_OBSERVER
  ) {
    return opentelemetryProto.metrics.v1.MetricDescriptorTemporality.DELTA;
  } else if (
    metricKind === MetricKind.VALUE_OBSERVER ||
    metricKind === MetricKind.VALUE_RECORDER
  ) {
    if (aggregator instanceof LastValueAggregator) {
      return opentelemetryProto.metrics.v1.MetricDescriptorTemporality
        .INSTANTANEOUS;
    }
    // Any other aggregator (MinMaxLastSumCount, Summary, Histogram) will be delta
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
    type: toCollectorType(metric),
    temporality: toCollectorTemporality(metric),
  };
}

export function toHistogramPoint(
  metric: MetricRecord,
  startTime: number
): opentelemetryProto.metrics.v1.HistogramDataPoint {
  const histValue = metric.aggregator.toPoint().value as Histogram;
  return {
    labels: toCollectorLabels(metric.labels),
    sum: histValue.sum,
    count: histValue.count,
    startTimeUnixNano: startTime,
    timeUnixNano: 0,
    buckets: histValue.buckets.counts.map(count => {
      return { count };
    }),
    explicitBounds: histValue.buckets.boundaries,
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
  // All data points are set as empty by default
  let int64DataPoints: opentelemetryProto.metrics.v1.Int64DataPoint[] = [];
  let doubleDataPoints: opentelemetryProto.metrics.v1.DoubleDataPoint[] = [];
  let histogramDataPoints: opentelemetryProto.metrics.v1.HistogramDataPoint[] = [];
  const descriptor = toCollectorMetricDescriptor(metric);

  const points = {
    labels: toCollectorLabels(metric.labels),
    value: metric.aggregator.toPoint().value as number,
    startTimeUnixNano: startTime,
    timeUnixNano: core.hrTimeToNanoseconds(
      metric.aggregator.toPoint().timestamp
    ),
  };

  if (
    descriptor.type ===
    opentelemetryProto.metrics.v1.MetricDescriptorType.HISTOGRAM
  ) {
    histogramDataPoints = [toHistogramPoint(metric, startTime)];
  } else if (metric.descriptor.valueType == apiValueType.INT) {
    int64DataPoints = [points];
  } else if (metric.descriptor.valueType === apiValueType.DOUBLE) {
    doubleDataPoints = [points];
  } // TODO: Implement support for summary points

  return {
    metricDescriptor: toCollectorMetricDescriptor(metric),
    doubleDataPoints,
    int64DataPoints,
    summaryDataPoints: [], // TODO: Implement support for summary points
    histogramDataPoints,
  };
}

/**
 * Prepares metric service request to be sent to collector
 * @param metrics metrics
 * @param startTime start time of the metric in nanoseconds
 * @param collectorMetricExporterBase
 */
export function toCollectorExportMetricServiceRequest<
  T extends CollectorExporterConfigBase
>(
  metrics: MetricRecord[],
  startTime: number,
  collectorMetricExporterBase: CollectorMetricExporterBase<T>
): opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
  const groupedMetrics: Map<
    Resource,
    Map<core.InstrumentationLibrary, MetricRecord[]>
  > = groupMetricsByResourceAndLibrary(metrics);
  const additionalAttributes = Object.assign(
    {},
    collectorMetricExporterBase.attributes || {},
    {
      'service.name': collectorMetricExporterBase.serviceName,
    }
  );
  return {
    resourceMetrics: toCollectorResourceMetrics(
      groupedMetrics,
      additionalAttributes,
      startTime
    ),
  };
}

/**
 * Returns a list of resource spans which will be exported to the collector
 * @param groupedSpans
 * @param baseAttributes
 */
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

/**
 * Returns a list of resource metrics which will be exported to the collector
 * @param groupedSpans
 * @param baseAttributes
 */
function toCollectorResourceMetrics(
  groupedMetrics: Map<
    Resource,
    Map<core.InstrumentationLibrary, MetricRecord[]>
  >,
  baseAttributes: Attributes,
  startTime: number
): opentelemetryProto.metrics.v1.ResourceMetrics[] {
  return Array.from(groupedMetrics, ([resource, libMetrics]) => {
    return {
      resource: toCollectorResource(resource, baseAttributes),
      instrumentationLibraryMetrics: Array.from(
        libMetrics,
        ([instrumentationLibrary, metrics]) =>
          toCollectorInstrumentationLibraryMetrics(
            instrumentationLibrary,
            metrics,
            startTime
          )
      ),
    };
  });
}
