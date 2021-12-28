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
import { ValueType } from '@opentelemetry/api-metrics';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { AggregatorKind, MetricKind, MetricRecord, Point, Histogram } from '@opentelemetry/sdk-metrics-base';
import { toAttributes } from './common';
import { opentelemetry as metrics_service } from './opentelemetry/proto/collector/metrics/v1/metrics_service';
import { opentelemetry as metrics } from './opentelemetry/proto/metrics/v1/metrics';

export function createExportMetricsServiceRequest(metricRecords: MetricRecord[], startTime: number): metrics_service.proto.collector.metrics.v1.ExportMetricsServiceRequest | null {
    if (metricRecords.length === 0) {
        return null;
    }

    const resource = metricRecords[0].resource;

    return metrics_service.proto.collector.metrics.v1.ExportMetricsServiceRequest.fromObject({
        resource_metrics: [{
            resource: {
                attributes: toAttributes(resource.attributes),
                dropped_attributes_count: 0,
            },
            instrumentation_library_metrics: [{
                instrumentation_library: { name: metricRecords[0].instrumentationLibrary.name, version: metricRecords[0].instrumentationLibrary.version },
                schema_url: metricRecords[0].instrumentationLibrary.schemaUrl,
                metrics: metricRecords.map(m => toMetric(m, startTime)),
            }],
        }],
    });
}

function toMetric(metric: MetricRecord, startTime: number): metrics.proto.metrics.v1.Metric {
    return metrics.proto.metrics.v1.Metric.fromObject({
        description: metric.descriptor.description,
        name: metric.descriptor.name,
        unit: metric.descriptor.unit,
        sum: isSum(metric) ? toSum(metric, startTime) : undefined,
        gauge: metric.aggregator.kind === AggregatorKind.LAST_VALUE ? toGauge(metric, startTime) : undefined,
        histogram: metric.aggregator.kind === AggregatorKind.HISTOGRAM ? toHistogram(metric, startTime) : undefined,
    });
}

function isSum(metric: MetricRecord) {
    return metric.aggregator.kind === AggregatorKind.SUM ||
        metric.descriptor.metricKind === MetricKind.OBSERVABLE_COUNTER ||
        metric.descriptor.metricKind === MetricKind.OBSERVABLE_UP_DOWN_COUNTER;
}

function toAggregationTemporality(
    metric: MetricRecord
): metrics.proto.metrics.v1.AggregationTemporality {
    if (metric.descriptor.metricKind === MetricKind.OBSERVABLE_GAUGE) {
        return metrics.proto.metrics.v1.AggregationTemporality.AGGREGATION_TEMPORALITY_UNSPECIFIED;
    }

    return metric.aggregationTemporality;
}

function toSum(
    metric: MetricRecord,
    startTime: number
): metrics.proto.metrics.v1.Sum {
    return metrics.proto.metrics.v1.Sum.fromObject({
        data_points: [toNumberDataPoint(metric, startTime)],
        is_monotonic:
            metric.descriptor.metricKind === MetricKind.COUNTER ||
            metric.descriptor.metricKind === MetricKind.OBSERVABLE_COUNTER,
        aggregation_temporality: toAggregationTemporality(metric),
    })
}

function toGauge(
    metric: MetricRecord,
    startTime: number
): metrics.proto.metrics.v1.Gauge {
    return metrics.proto.metrics.v1.Gauge.fromObject({
        data_points: [toNumberDataPoint(metric, startTime)],
    })
}

function toHistogram(
    metric: MetricRecord,
    startTime: number
): metrics.proto.metrics.v1.Histogram {
    return metrics.proto.metrics.v1.Histogram.fromObject({
        data_points: [toHistogramDataPoint(metric, startTime)],
        aggregation_temporality: toAggregationTemporality(metric),
    });
}

function toNumberDataPoint(
    metric: MetricRecord,
    startTime: number
): metrics.proto.metrics.v1.NumberDataPoint {
    return metrics.proto.metrics.v1.NumberDataPoint.fromObject({
        attributes: toAttributes(metric.attributes),
        as_int: metric.descriptor.valueType === ValueType.INT ? metric.aggregator.toPoint().value as number : undefined,
        as_double: metric.descriptor.valueType === ValueType.DOUBLE ? metric.aggregator.toPoint().value as number : undefined,
        start_time_unix_nano: startTime,
        time_unix_nano: hrTimeToNanoseconds(
            metric.aggregator.toPoint().timestamp
        ),
    });
}

function toHistogramDataPoint(
    metric: MetricRecord,
    startTime: number
): metrics.proto.metrics.v1.HistogramDataPoint {
    const point = metric.aggregator.toPoint() as Point<Histogram>
    return metrics.proto.metrics.v1.HistogramDataPoint.fromObject({
        attributes: toAttributes(metric.attributes),
        bucket_counts: point.value.buckets.counts,
        explicit_bounds: point.value.buckets.boundaries,
        count: point.value.count,
        sum: point.value.sum,
        start_time_unix_nano: startTime,
        time_unix_nano: hrTimeToNanoseconds(
            metric.aggregator.toPoint().timestamp
        ),
    })
}