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
import { AggregatorKind, Histogram, MetricKind, MetricRecord, Point } from '@opentelemetry/sdk-metrics-base';
import { RPCImpl } from 'protobufjs';
import { hrTimeToLong, toAttributes } from './common';
import { opentelemetry } from './generated';
import { Fixed64 } from './types';

export type MetricsClientOptions = {
    rpcImpl: RPCImpl,
    startTime: Fixed64,
};
export class MetricsServiceClient {
    private _service: opentelemetry.proto.collector.metrics.v1.MetricsService;
    private _startTime: Fixed64;

    constructor(options: MetricsClientOptions) {
        this._service = new opentelemetry.proto.collector.metrics.v1.MetricsService(options.rpcImpl);
        this._startTime = options.startTime ?? Date.now() * 1000;
    }

    async export(metricRecords: MetricRecord[]): Promise<unknown> {
        const request = createExportMetricsServiceRequest(metricRecords, this._startTime);
        if (!request) return null;
        return this._service.export(request);
    }
}

export function createExportMetricsServiceRequest(metricRecords: MetricRecord[], startTime: Fixed64): opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest | null {
    if (metricRecords.length === 0) {
        return null;
    }

    const resource = metricRecords[0].resource;

    return opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.fromObject({
        resourceMetrics: [{
            resource: {
                attributes: toAttributes(resource.attributes),
                droppedAttributesCount: 0,
            },
            instrumentationLibraryMetrics: [{
                instrumentationLibrary: { name: metricRecords[0].instrumentationLibrary.name, version: metricRecords[0].instrumentationLibrary.version },
                schemaUrl: metricRecords[0].instrumentationLibrary.schemaUrl,
                metrics: metricRecords.map(m => toMetric(m, startTime)),
            }],
        }],
    });
}

function toMetric(metric: MetricRecord, startTime: Fixed64): opentelemetry.proto.metrics.v1.Metric {
    return opentelemetry.proto.metrics.v1.Metric.fromObject({
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
): opentelemetry.proto.metrics.v1.AggregationTemporality {
    if (metric.descriptor.metricKind === MetricKind.OBSERVABLE_GAUGE) {
        return opentelemetry.proto.metrics.v1.AggregationTemporality.AGGREGATION_TEMPORALITY_UNSPECIFIED;
    }

    return metric.aggregationTemporality;
}

function toSum(
    metric: MetricRecord,
    startTime: Fixed64
): opentelemetry.proto.metrics.v1.Sum {
    return opentelemetry.proto.metrics.v1.Sum.fromObject({
        dataPoints: [toNumberDataPoint(metric, startTime)],
        isMonotonic:
            metric.descriptor.metricKind === MetricKind.COUNTER ||
            metric.descriptor.metricKind === MetricKind.OBSERVABLE_COUNTER,
        aggregationTemporality: toAggregationTemporality(metric),
    });
}

function toGauge(
    metric: MetricRecord,
    startTime: Fixed64
): opentelemetry.proto.metrics.v1.Gauge {
    return opentelemetry.proto.metrics.v1.Gauge.fromObject({
        dataPoints: [toNumberDataPoint(metric, startTime)],
        aggregationTemporality: toAggregationTemporality(metric),
    });
}

function toHistogram(
    metric: MetricRecord,
    startTime: Fixed64
): opentelemetry.proto.metrics.v1.Histogram {
    return opentelemetry.proto.metrics.v1.Histogram.fromObject({
        dataPoints: [toHistogramDataPoint(metric, startTime)],
        aggregationTemporality: toAggregationTemporality(metric),
    });
}

function toNumberDataPoint(
    metric: MetricRecord,
    startTime: Fixed64
): opentelemetry.proto.metrics.v1.NumberDataPoint {
    return opentelemetry.proto.metrics.v1.NumberDataPoint.fromObject({
        attributes: toAttributes(metric.attributes),
        asInt: metric.descriptor.valueType === ValueType.INT ? metric.aggregator.toPoint().value as number : undefined,
        asDouble: metric.descriptor.valueType === ValueType.DOUBLE ? metric.aggregator.toPoint().value as number : undefined,
        startTimeUnixNano: startTime,
        timeUnixNano: hrTimeToLong(
            metric.aggregator.toPoint().timestamp
        ),
    });
}

function toHistogramDataPoint(
    metric: MetricRecord,
    startTime: Fixed64
): opentelemetry.proto.metrics.v1.HistogramDataPoint {
    const point = metric.aggregator.toPoint() as Point<Histogram>;
    return opentelemetry.proto.metrics.v1.HistogramDataPoint.fromObject({
        attributes: toAttributes(metric.attributes),
        bucketCounts: point.value.buckets.counts,
        explicitBounds: point.value.buckets.boundaries,
        count: point.value.count,
        sum: point.value.sum,
        startTimeUnixNano: startTime,
        timeUnixNano: hrTimeToLong(
            metric.aggregator.toPoint().timestamp
        ),
    });
}
