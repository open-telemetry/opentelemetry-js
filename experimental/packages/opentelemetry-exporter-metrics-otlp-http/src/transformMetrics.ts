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
  AggregationTemporality,
  DataPointType,
  Histogram,
  InstrumentType,
  MetricData,
  ResourceMetrics
} from '@opentelemetry/sdk-metrics-base';
import { Attributes, ValueType } from '@opentelemetry/api-metrics';

/**
 * Converts {@link Attributes} to a collector-compatible format.
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
 * Convert {@link AggregationTemporality} to a collector-compatible format.
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
 * Convert {@link MetricData} of {@link DataPointType.SINGULAR} to a collector-compatible format.
 * @param metricData
 */
export function toSingularDataPoints(
  metricData: MetricData
): otlpTypes.opentelemetryProto.metrics.v1.DataPoint[] {
  return Array.from(metricData.dataPoints.map(dataPoint => {
    return {
      labels: toCollectorAttributes(dataPoint.attributes),
      value: dataPoint.value as number,
      startTimeUnixNano: core.hrTimeToNanoseconds(
        dataPoint.startTime
      ),
      timeUnixNano: core.hrTimeToNanoseconds(
        dataPoint.endTime
      ),
    };
  }));
}

/**
 * Convert {@link MetricData} of {@link DataPointType.HISTOGRAM} to a collector-compatible format.
 * @param metricData
 */
export function toHistogramDataPoints(
  metricData: MetricData
): otlpTypes.opentelemetryProto.metrics.v1.HistogramDataPoint[] {
  return Array.from(metricData.dataPoints.map(dataPoints => {
    const histogram = dataPoints.value as Histogram;
    return {
      labels: toCollectorAttributes(dataPoints.attributes),
      sum: histogram.sum,
      count: histogram.count,
      startTimeUnixNano: core.hrTimeToNanoseconds(
        dataPoints.startTime
      ),
      timeUnixNano: core.hrTimeToNanoseconds(
        dataPoints.endTime
      ),
      bucketCounts: histogram.buckets.counts,
      explicitBounds: histogram.buckets.boundaries,
    };
  }));
}

/**
 * Converts {@link MetricData} to a collector-compatible format.
 * @param metricData
 * @param aggregationTemporality
 */
export function toCollectorMetric(
  metricData: MetricData,
  aggregationTemporality: AggregationTemporality
): otlpTypes.opentelemetryProto.metrics.v1.Metric {
  const metricCollector: otlpTypes.opentelemetryProto.metrics.v1.Metric = {
    name: metricData.descriptor.name,
    description: metricData.descriptor.description,
    unit: metricData.descriptor.unit,
  };

  if (metricData.dataPointType === DataPointType.SINGULAR) {
    const result = {
      dataPoints: toSingularDataPoints(metricData),
      isMonotonic:
        metricData.descriptor.type === InstrumentType.COUNTER ||
        metricData.descriptor.type === InstrumentType.OBSERVABLE_COUNTER,
      aggregationTemporality: toAggregationTemporality(aggregationTemporality),
    };

    if (
      metricData.descriptor.type === InstrumentType.COUNTER ||
      metricData.descriptor.type === InstrumentType.OBSERVABLE_COUNTER ||
      metricData.descriptor.type === InstrumentType.UP_DOWN_COUNTER ||
      metricData.descriptor.type === InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
    ) {
      if (metricData.descriptor.valueType === ValueType.INT) {
        metricCollector.intSum = result;
      } else {
        metricCollector.doubleSum = result;
      }
    } else{
      // Instrument is a gauge.
      if (metricData.descriptor.valueType === ValueType.INT) {
        metricCollector.intGauge = result;
      } else {
        metricCollector.doubleGauge = result;
      }
    }
  } else if (metricData.dataPointType === DataPointType.HISTOGRAM) {
    const result = {
      dataPoints: toHistogramDataPoints(metricData),
      aggregationTemporality: toAggregationTemporality(aggregationTemporality)
    };
    if (metricData.descriptor.valueType === ValueType.INT) {
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
