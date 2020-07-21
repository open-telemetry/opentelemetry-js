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
  MetricRecord,
  MetricKind,
  HistogramAggregator,
  MinMaxLastSumCountAggregator,
  Histogram,
  Distribution,
} from '@opentelemetry/metrics';
import { opentelemetryProto, CollectorExporterConfigBase } from './types';
import * as api from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { toCollectorResource } from './transform';
import { CollectorExporterBase } from './CollectorExporterBase';

/**
 * Converts labels
 * @param labels
 */
export function toCollectorLabels(
  labels: api.Labels
): opentelemetryProto.common.v1.StringKeyValue[] {
  return Object.entries(labels).map(([key, value]) => {
    return { key, value };
  });
}

/**
 * Given a MetricDescriptor, return its type in a compatible format with the collector
 * @param descriptor
 */
export function toCollectorType(
  metric: MetricRecord
): opentelemetryProto.metrics.v1.MetricDescriptorType {
  if (
    metric.descriptor.metricKind === MetricKind.COUNTER ||
    metric.descriptor.metricKind === MetricKind.SUM_OBSERVER
  ) {
    if (metric.descriptor.valueType === api.ValueType.INT) {
      return opentelemetryProto.metrics.v1.MetricDescriptorType.MONOTONIC_INT64;
    }
    return opentelemetryProto.metrics.v1.MetricDescriptorType.MONOTONIC_DOUBLE;
  }
  if (metric.aggregator instanceof HistogramAggregator) {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.HISTOGRAM;
  }
  if (metric.descriptor.valueType == api.ValueType.INT) {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.INT64;
  }
  if (metric.descriptor.valueType === api.ValueType.DOUBLE) {
    return opentelemetryProto.metrics.v1.MetricDescriptorType.DOUBLE;
  }

  // @TODO #1294: Add Summary once implemented
  return opentelemetryProto.metrics.v1.MetricDescriptorType.INVALID_TYPE;
}

/**
 * Given a MetricDescriptor, return its temporality in a compatible format with the collector
 * @param descriptor
 */
export function toCollectorTemporality(
  metric: MetricRecord
): opentelemetryProto.metrics.v1.MetricDescriptorTemporality {
  if (
    metric.descriptor.metricKind === MetricKind.COUNTER ||
    metric.descriptor.metricKind === MetricKind.SUM_OBSERVER
  ) {
    return opentelemetryProto.metrics.v1.MetricDescriptorTemporality.CUMULATIVE;
  }
  if (
    metric.descriptor.metricKind === MetricKind.UP_DOWN_COUNTER ||
    metric.descriptor.metricKind === MetricKind.UP_DOWN_SUM_OBSERVER
  ) {
    return opentelemetryProto.metrics.v1.MetricDescriptorTemporality.DELTA;
  }
  if (
    metric.descriptor.metricKind === MetricKind.VALUE_OBSERVER ||
    metric.descriptor.metricKind === MetricKind.VALUE_RECORDER
  ) {
    // TODO: Change once LastValueAggregator is implemented.
    // If the aggregator is LastValue or Exact, then it will be instantaneous
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

/**
 * Returns an Int64Point or DoublePoint to the collector
 * @param metric
 * @param startTime
 */
export function toSingularPoint(
  metric: MetricRecord,
  startTime: number
): {
  labels: opentelemetryProto.common.v1.StringKeyValue[];
  startTimeUnixNano: number;
  timeUnixNano: number;
  value: number;
} {
  const pointValue =
    metric.aggregator instanceof MinMaxLastSumCountAggregator
      ? (metric.aggregator.toPoint().value as Distribution).last
      : (metric.aggregator.toPoint().value as number);

  return {
    labels: toCollectorLabels(metric.labels),
    value: pointValue,
    startTimeUnixNano: startTime,
    timeUnixNano: core.hrTimeToNanoseconds(
      metric.aggregator.toPoint().timestamp
    ),
  };
}

/**
 * Returns a HistogramPoint to the collector
 * @param metric
 * @param startTime
 */
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
    timeUnixNano: core.hrTimeToNanoseconds(
      metric.aggregator.toPoint().timestamp
    ),
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
  if (
    toCollectorType(metric) ===
    opentelemetryProto.metrics.v1.MetricDescriptorType.HISTOGRAM
  ) {
    return {
      metricDescriptor: toCollectorMetricDescriptor(metric),
      histogramDataPoints: [toHistogramPoint(metric, startTime)],
    };
  }
  if (metric.descriptor.valueType == api.ValueType.INT) {
    return {
      metricDescriptor: toCollectorMetricDescriptor(metric),
      int64DataPoints: [toSingularPoint(metric, startTime)],
    };
  }
  if (metric.descriptor.valueType === api.ValueType.DOUBLE) {
    return {
      metricDescriptor: toCollectorMetricDescriptor(metric),
      doubleDataPoints: [toSingularPoint(metric, startTime)],
    };
  } // TODO: Add support for summary points once implemented

  return {
    metricDescriptor: toCollectorMetricDescriptor(metric),
    int64DataPoints: [],
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
  collectorExporterBase: CollectorExporterBase<
    T,
    MetricRecord,
    opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest
  >
): opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
  const groupedMetrics: Map<
    Resource,
    Map<core.InstrumentationLibrary, MetricRecord[]>
  > = groupMetricsByResourceAndLibrary(metrics);
  const additionalAttributes = Object.assign(
    {},
    collectorExporterBase.attributes,
    {
      'service.name': collectorExporterBase.serviceName,
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
    metrics: metrics.map(metric => toCollectorMetric(metric, startTime)),
    instrumentationLibrary,
  };
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
  baseAttributes: api.Attributes,
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
