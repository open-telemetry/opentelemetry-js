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

import { SpanAttributes } from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import { OTLPExporterBase, otlpTypes, toCollectorResource } from '@opentelemetry/exporter-trace-otlp-http';
import {
  AggregationTemporality, Histogram,
  InstrumentType,
  MetricData,
  DataPointType,
  ResourceMetrics
} from '@opentelemetry/sdk-metrics-base-wip';
import { Attributes, ValueType } from '@opentelemetry/api-metrics';

/**
 * Converts labels
 * @param attributes
 */
export function toCollectorAttributes(
  attributes: Attributes
): otlpTypes.opentelemetryProto.common.v1.StringKeyValue[] {
  return Object.entries(attributes).map(([key, value]) => {
    return { key, value: String(value) };
  });
}

/**
 * Given a {@link AggregationTemporality}, return its temporality in a compatible format with the collector
 * @param aggregationTemporality
 */
export function toAggregationTemporality(
  aggregationTemporality: AggregationTemporality
): otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality {
  if (aggregationTemporality === AggregationTemporality.CUMULATIVE) {
    return otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
      .AGGREGATION_TEMPORALITY_CUMULATIVE;
  }
  if (aggregationTemporality === AggregationTemporality.DELTA) {
    return otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
      .AGGREGATION_TEMPORALITY_DELTA;
  }

  return otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
    .AGGREGATION_TEMPORALITY_UNSPECIFIED;
}

/**
 * Returns an array of DataPoints which can have integers or double values
 * @param metric
 */
export function toDataPoints(
  metric: MetricData
): otlpTypes.opentelemetryProto.metrics.v1.DataPoint[] {
  return Array.from(metric.dataPoints.map(pointData => {
    return {
      labels: toCollectorAttributes(pointData.attributes),
      value: pointData.value as number,
      startTimeUnixNano: core.hrTimeToNanoseconds(
        pointData.startTime
      ),
      timeUnixNano: core.hrTimeToNanoseconds(
        pointData.endTime
      ),
    };
  }));
}

/**
 * Returns an array of HistogramPoints to the collector
 * @param metric
 */
export function toHistogramPoints(
  metric: MetricData
): otlpTypes.opentelemetryProto.metrics.v1.HistogramDataPoint[] {
  return Array.from(metric.dataPoints.map(pointData => {
    const histogram = pointData.value as Histogram;
    return {
      labels: toCollectorAttributes(pointData.attributes),
      sum: histogram.sum,
      count: histogram.count,
      startTimeUnixNano: core.hrTimeToNanoseconds(
        pointData.startTime
      ),
      timeUnixNano: core.hrTimeToNanoseconds(
        pointData.endTime
      ),
      bucketCounts: histogram.buckets.counts,
      explicitBounds: histogram.buckets.boundaries,
    };
  }));
}

/**
 * Converts a metric to be compatible with the collector
 * @param metric
 * @param aggregationTemporality
 */
export function toCollectorMetric(
  metric: MetricData,
  aggregationTemporality: AggregationTemporality
): otlpTypes.opentelemetryProto.metrics.v1.Metric {
  const metricCollector: otlpTypes.opentelemetryProto.metrics.v1.Metric = {
    name: metric.descriptor.name,
    description: metric.descriptor.description,
    unit: metric.descriptor.unit,
  };

  if (metric.dataPointType === DataPointType.SINGULAR) {
    const result = {
      dataPoints: toDataPoints(metric),
      isMonotonic:
        metric.descriptor.type === InstrumentType.COUNTER ||
        metric.descriptor.type === InstrumentType.OBSERVABLE_COUNTER,
      aggregationTemporality: toAggregationTemporality(aggregationTemporality),
    };

    if (metric.descriptor.valueType === ValueType.INT) {
      metricCollector.intSum = result;
    } else {
      metricCollector.doubleSum = result;
    }
  } else if (metric.dataPointType === DataPointType.HISTOGRAM) {
    const result = {
      dataPoints: toHistogramPoints(metric),
      aggregationTemporality: toAggregationTemporality(aggregationTemporality)
    };
    if (metric.descriptor.valueType === ValueType.INT) {
      metricCollector.intHistogram = result;
    } else {
      metricCollector.doubleHistogram = result;
    }
  }

  // TODO: Add support for exponential histograms when they're ready.

  return metricCollector;
}

/**
 * Prepares metric service request to be sent to collector
 * @param metrics metrics
 * @param aggregationTemporality
 * @param collectorExporterBase
 */
export function toOTLPExportMetricServiceRequest<T extends otlpTypes.OTLPExporterConfigBase>(
  metrics: ResourceMetrics,
  aggregationTemporality: AggregationTemporality,
  collectorExporterBase: OTLPExporterBase<T,
    ResourceMetrics,
    otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest>
): otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
  const additionalAttributes = Object.assign(
    {},
    collectorExporterBase.attributes
  );
  return {
    resourceMetrics: toCollectorResourceMetrics(
      metrics,
      additionalAttributes,
      aggregationTemporality
    ),
  };
}

/**
 * Convert to InstrumentationLibraryMetrics
 * @param instrumentationLibrary
 * @param metrics
 * @param aggregationTemporality
 */
function toCollectorInstrumentationLibraryMetrics(
  instrumentationLibrary: core.InstrumentationLibrary,
  metrics: MetricData[],
  aggregationTemporality: AggregationTemporality
): otlpTypes.opentelemetryProto.metrics.v1.InstrumentationLibraryMetrics {
  return {
    metrics: metrics.map(metric => toCollectorMetric(metric, aggregationTemporality)),
    instrumentationLibrary,
  };
}

/**
 * Returns a list of resource metrics which will be exported to the collector
 * @param resourceMetrics
 * @param baseAttributes
 * @param aggregationTemporality
 */
function toCollectorResourceMetrics(
  resourceMetrics: ResourceMetrics,
  baseAttributes: SpanAttributes,
  aggregationTemporality: AggregationTemporality
): otlpTypes.opentelemetryProto.metrics.v1.ResourceMetrics[] {
  return [{
    resource: toCollectorResource(resourceMetrics.resource, baseAttributes),
    instrumentationLibraryMetrics: Array.from(resourceMetrics.instrumentationLibraryMetrics.map(
      instrumentationLibraryMetrics => toCollectorInstrumentationLibraryMetrics(
        instrumentationLibraryMetrics.instrumentationLibrary,
        instrumentationLibraryMetrics.metrics,
        aggregationTemporality
      )))
  }];
}
