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
import type { OtlpEncodingOptions } from '../common/internal-types';
import { ValueType } from '@opentelemetry/api';
import {
  AggregationTemporality,
  DataPoint,
  DataPointType,
  ExponentialHistogram,
  Histogram,
  MetricData,
  ResourceMetrics,
  ScopeMetrics,
} from '@opentelemetry/sdk-metrics';
import {
  EAggregationTemporality,
  IExponentialHistogramDataPoint,
  IExportMetricsServiceRequest,
  IHistogramDataPoint,
  IMetric,
  INumberDataPoint,
  IResourceMetrics,
  IScopeMetrics,
} from './internal-types';
import { Encoder, getOtlpEncoder } from '../common/utils';
import {
  createInstrumentationScope,
  createResource,
  toAttributes,
} from '../common/internal';

export function toResourceMetrics(
  resourceMetrics: ResourceMetrics,
  options?: OtlpEncodingOptions | Encoder
): IResourceMetrics {
  const encoder = isEncoder(options) ? options : getOtlpEncoder(options);
  const processedResource = createResource(resourceMetrics.resource);
  return {
    resource: processedResource,
    schemaUrl: processedResource.schemaUrl,
    scopeMetrics: toScopeMetrics(resourceMetrics.scopeMetrics, encoder),
  };
}

function isEncoder(obj: OtlpEncodingOptions | Encoder | undefined): obj is Encoder {
  return obj !== undefined && 'encodeHrTime' in obj;
}

export function toScopeMetrics(
  scopeMetrics: ScopeMetrics[],
  encoder: Encoder
): IScopeMetrics[] {
  return Array.from(
    scopeMetrics.map(metrics => ({
      scope: createInstrumentationScope(metrics.scope),
      metrics: metrics.metrics.map(metricData => toMetric(metricData, encoder)),
      schemaUrl: metrics.scope.schemaUrl,
    }))
  );
}

export function toMetric(metricData: MetricData, encoder: Encoder): IMetric {
  const out: IMetric = {
    name: metricData.descriptor.name,
    description: metricData.descriptor.description,
    unit: metricData.descriptor.unit,
  };

  const aggregationTemporality = toAggregationTemporality(
    metricData.aggregationTemporality
  );

  switch (metricData.dataPointType) {
    case DataPointType.SUM:
      out.sum = {
        aggregationTemporality,
        isMonotonic: metricData.isMonotonic,
        dataPoints: toSingularDataPoints(metricData, encoder),
      };
      break;
    case DataPointType.GAUGE:
      out.gauge = {
        dataPoints: toSingularDataPoints(metricData, encoder),
      };
      break;
    case DataPointType.HISTOGRAM:
      out.histogram = {
        aggregationTemporality,
        dataPoints: toHistogramDataPoints(metricData, encoder),
      };
      break;
    case DataPointType.EXPONENTIAL_HISTOGRAM:
      out.exponentialHistogram = {
        aggregationTemporality,
        dataPoints: toExponentialHistogramDataPoints(metricData, encoder),
      };
      break;
  }

  return out;
}

function toSingularDataPoint(
  dataPoint:
    | DataPoint<number>
    | DataPoint<Histogram>
    | DataPoint<ExponentialHistogram>,
  valueType: ValueType,
  encoder: Encoder
) {
  const out: INumberDataPoint = {
    attributes: toAttributes(dataPoint.attributes),
    startTimeUnixNano: encoder.encodeHrTime(dataPoint.startTime),
    timeUnixNano: encoder.encodeHrTime(dataPoint.endTime),
  };

  switch (valueType) {
    case ValueType.INT:
      out.asInt = dataPoint.value as number;
      break;
    case ValueType.DOUBLE:
      out.asDouble = dataPoint.value as number;
      break;
  }

  return out;
}

function toSingularDataPoints(
  metricData: MetricData,
  encoder: Encoder
): INumberDataPoint[] {
  return metricData.dataPoints.map(dataPoint => {
    return toSingularDataPoint(
      dataPoint,
      metricData.descriptor.valueType,
      encoder
    );
  });
}

function toHistogramDataPoints(
  metricData: MetricData,
  encoder: Encoder
): IHistogramDataPoint[] {
  return metricData.dataPoints.map(dataPoint => {
    const histogram = dataPoint.value as Histogram;
    return {
      attributes: toAttributes(dataPoint.attributes),
      bucketCounts: histogram.buckets.counts,
      explicitBounds: histogram.buckets.boundaries,
      count: histogram.count,
      sum: histogram.sum,
      min: histogram.min,
      max: histogram.max,
      startTimeUnixNano: encoder.encodeHrTime(dataPoint.startTime),
      timeUnixNano: encoder.encodeHrTime(dataPoint.endTime),
    };
  });
}

function toExponentialHistogramDataPoints(
  metricData: MetricData,
  encoder: Encoder
): IExponentialHistogramDataPoint[] {
  return metricData.dataPoints.map(dataPoint => {
    const histogram = dataPoint.value as ExponentialHistogram;
    return {
      attributes: toAttributes(dataPoint.attributes),
      count: histogram.count,
      min: histogram.min,
      max: histogram.max,
      sum: histogram.sum,
      positive: {
        offset: histogram.positive.offset,
        bucketCounts: histogram.positive.bucketCounts,
      },
      negative: {
        offset: histogram.negative.offset,
        bucketCounts: histogram.negative.bucketCounts,
      },
      scale: histogram.scale,
      zeroCount: histogram.zeroCount,
      startTimeUnixNano: encoder.encodeHrTime(dataPoint.startTime),
      timeUnixNano: encoder.encodeHrTime(dataPoint.endTime),
    };
  });
}

function toAggregationTemporality(
  temporality: AggregationTemporality
): EAggregationTemporality {
  switch (temporality) {
    case AggregationTemporality.DELTA:
      return EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA;
    case AggregationTemporality.CUMULATIVE:
      return EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE;
  }
}

export function createExportMetricsServiceRequest(
  resourceMetrics: ResourceMetrics[],
  options?: OtlpEncodingOptions | Encoder
): IExportMetricsServiceRequest {
  return {
    resourceMetrics: resourceMetrics.map(metrics =>
      toResourceMetrics(metrics, options)
    ),
  };
}
