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
import { AggregationTemporality, ValueType } from '@opentelemetry/api-metrics';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import type { Histogram, MetricRecord, Point } from '@opentelemetry/sdk-metrics-base';
import { AggregatorKind, MetricKind } from '@opentelemetry/sdk-metrics-base';
import { toAttributes } from '../common/internal';
import { EAggregationTemporality, IGauge, IHistogram, IHistogramDataPoint, IMetric, INumberDataPoint, ISum } from './types';


export function toMetric(metric: MetricRecord, startTime: number): IMetric {
  const out: IMetric = {
    description: metric.descriptor.description,
    name: metric.descriptor.name,
    unit: metric.descriptor.unit,
  };

  if (isSum(metric)) {
    out.sum = toSum(metric, startTime);
  } else if (metric.aggregator.kind === AggregatorKind.LAST_VALUE) {
    out.gauge = toGauge(metric, startTime);
  } else if (metric.aggregator.kind === AggregatorKind.HISTOGRAM) {
    out.histogram = toHistogram(metric, startTime);
  }

  return out;
}

function isSum(metric: MetricRecord) {
  return metric.aggregator.kind === AggregatorKind.SUM ||
    metric.descriptor.metricKind === MetricKind.OBSERVABLE_COUNTER ||
    metric.descriptor.metricKind === MetricKind.OBSERVABLE_UP_DOWN_COUNTER;
}

function toAggregationTemporality(
  metric: MetricRecord
): EAggregationTemporality {
  if (metric.descriptor.metricKind === MetricKind.OBSERVABLE_GAUGE) {
    return EAggregationTemporality.AGGREGATION_TEMPORALITY_UNSPECIFIED;
  }

  if (metric.aggregationTemporality === AggregationTemporality.AGGREGATION_TEMPORALITY_DELTA) {
    return EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA;
  }

  if (metric.aggregationTemporality === AggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE) {
    return EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE;
  }

  return EAggregationTemporality.AGGREGATION_TEMPORALITY_UNSPECIFIED;
}

function toSum(
  metric: MetricRecord,
  startTime: number,
): ISum {
  return {
    dataPoints: [toNumberDataPoint(metric, startTime)],
    isMonotonic:
      metric.descriptor.metricKind === MetricKind.COUNTER ||
      metric.descriptor.metricKind === MetricKind.OBSERVABLE_COUNTER,
    aggregationTemporality: toAggregationTemporality(metric),
  };
}

function toGauge(
  metric: MetricRecord,
  startTime: number,
): IGauge {
  return {
    dataPoints: [toNumberDataPoint(metric, startTime)],
  };
}

function toHistogram(
  metric: MetricRecord,
  startTime: number,
): IHistogram {
  return {
    dataPoints: [toHistogramDataPoint(metric, startTime)],
    aggregationTemporality: toAggregationTemporality(metric),
  };
}

function toNumberDataPoint(
  metric: MetricRecord,
  startTime: number,
): INumberDataPoint {
  const out: INumberDataPoint = {
    attributes: toAttributes(metric.attributes),
    startTimeUnixNano: startTime,
    timeUnixNano: hrTimeToNanoseconds(
      metric.aggregator.toPoint().timestamp
    ),
  };

  if (metric.descriptor.valueType === ValueType.INT) {
    out.asInt = metric.aggregator.toPoint().value as number;
  }

  if (metric.descriptor.valueType === ValueType.DOUBLE) {
    out.asDouble = metric.aggregator.toPoint().value as number;
  }

  return out;
}

function toHistogramDataPoint(
  metric: MetricRecord,
  startTime: number,
): IHistogramDataPoint {
  const point = metric.aggregator.toPoint() as Point<Histogram>;
  return {
    attributes: toAttributes(metric.attributes),
    bucketCounts: point.value.buckets.counts,
    explicitBounds: point.value.buckets.boundaries,
    count: point.value.count,
    sum: point.value.sum,
    startTimeUnixNano: startTime,
    timeUnixNano: hrTimeToNanoseconds(
      metric.aggregator.toPoint().timestamp
    ),
  };
}
