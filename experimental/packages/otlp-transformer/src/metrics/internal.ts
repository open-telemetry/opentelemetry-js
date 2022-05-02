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
import {
  AggregationTemporality,
  DataPoint,
  DataPointType,
  Histogram,
  InstrumentationLibraryMetrics,
  InstrumentType,
  MetricData,
  ResourceMetrics
} from '@opentelemetry/sdk-metrics-base';
import { toAttributes } from '../common/internal';
import {
  EAggregationTemporality,
  IHistogramDataPoint, IInstrumentationLibraryMetrics,
  IMetric,
  INumberDataPoint,
  IResourceMetrics,
  IScopeMetrics
} from './types';

export function toResourceMetrics(resourceMetrics: ResourceMetrics,
  aggregationTemporality: AggregationTemporality,
  json?: boolean): IResourceMetrics {
  const transformedMetrics: IResourceMetrics = {
    resource: {
      attributes: toAttributes(resourceMetrics.resource.attributes),
      droppedAttributesCount: 0
    },
    schemaUrl: undefined, // TODO: Schema Url does not exist yet in the SDK.
    scopeMetrics: toScopeMetrics(resourceMetrics.instrumentationLibraryMetrics, aggregationTemporality)
  };

  if (json) {
    transformedMetrics.instrumentationLibraryMetrics =
      toInstrumentationLibraryMetrics(resourceMetrics.instrumentationLibraryMetrics, aggregationTemporality);
  }

  return transformedMetrics;
}

export function toScopeMetrics(instrumentationLibraryMetrics: InstrumentationLibraryMetrics[],
  aggregationTemporality: AggregationTemporality): IScopeMetrics[]{
  return Array.from(instrumentationLibraryMetrics.map(metrics => {
    const scopeMetrics : IScopeMetrics = {
      scope: {
        name: metrics.instrumentationLibrary.name,
        version: metrics.instrumentationLibrary.version,
      },
      metrics: metrics.metrics.map(metricData => toMetric(metricData, aggregationTemporality)),
      schemaUrl: metrics.instrumentationLibrary.schemaUrl
    };
    return scopeMetrics;
  }));
}

export function toInstrumentationLibraryMetrics(instrumentationLibraryMetrics: InstrumentationLibraryMetrics[],
  aggregationTemporality: AggregationTemporality): IInstrumentationLibraryMetrics[]{
  return Array.from(instrumentationLibraryMetrics.map(metrics => {
    const resultMetrics : IInstrumentationLibraryMetrics = {
      instrumentationLibrary: {
        name: metrics.instrumentationLibrary.name,
        version: metrics.instrumentationLibrary.version,
      },
      metrics: metrics.metrics.map(metricData => toMetric(metricData, aggregationTemporality)),
      schemaUrl: metrics.instrumentationLibrary.schemaUrl
    };
    return resultMetrics;
  }));
}

export function toMetric(metricData: MetricData, metricTemporality: AggregationTemporality): IMetric {
  const out: IMetric = {
    name: metricData.descriptor.name,
    description: metricData.descriptor.description,
    unit: metricData.descriptor.unit,
  };

  const aggregationTemporality = toAggregationTemporality(metricTemporality);

  if (metricData.dataPointType === DataPointType.SINGULAR) {
    const dataPoints = toSingularDataPoints(metricData);
    const isMonotonic = metricData.descriptor.type === InstrumentType.COUNTER ||
      metricData.descriptor.type === InstrumentType.OBSERVABLE_COUNTER;
    if (isSum(metricData)) {
      out.sum = {
        aggregationTemporality,
        isMonotonic,
        dataPoints
      };

    } else {
      // Instrument is a gauge.
      out.gauge = {
        dataPoints
      };
    }
  } else if (isHistogram(metricData)) {
    out.histogram = {
      aggregationTemporality,
      dataPoints: toHistogramDataPoints(metricData)
    };
  }

  return out;
}

function toSingularDataPoint(dataPoint: DataPoint<number> | DataPoint<Histogram>, valueType: ValueType) {
  const out: INumberDataPoint = {
    attributes: toAttributes(dataPoint.attributes),
    startTimeUnixNano: hrTimeToNanoseconds(
      dataPoint.startTime
    ),
    timeUnixNano: hrTimeToNanoseconds(
      dataPoint.endTime
    ),
  };

  if (valueType === ValueType.INT) {
    out.asInt = dataPoint.value as number;
  } else if (valueType === ValueType.DOUBLE) {
    out.asDouble = dataPoint.value as number;
  }

  return out;
}

function toSingularDataPoints(
  metricData: MetricData
): INumberDataPoint[] {
  return metricData.dataPoints.map(dataPoint => {
    return toSingularDataPoint(dataPoint, metricData.descriptor.valueType);
  });
}

function toHistogramDataPoints(
  metricData: MetricData
): IHistogramDataPoint[] {
  return metricData.dataPoints.map(dataPoint => {
    const histogram = dataPoint.value as Histogram;
    return {
      attributes: toAttributes(dataPoint.attributes),
      bucketCounts: histogram.buckets.counts,
      explicitBounds: histogram.buckets.boundaries,
      count: histogram.count,
      sum: histogram.sum,
      startTimeUnixNano: hrTimeToNanoseconds(dataPoint.startTime),
      timeUnixNano: hrTimeToNanoseconds(
        dataPoint.endTime
      ),
    };
  });
}

function isSum(metric: MetricData) {
  return (metric.descriptor.type === InstrumentType.COUNTER ||
    metric.descriptor.type === InstrumentType.UP_DOWN_COUNTER ||
    metric.descriptor.type === InstrumentType.OBSERVABLE_COUNTER ||
    metric.descriptor.type === InstrumentType.OBSERVABLE_UP_DOWN_COUNTER);
}

function isHistogram(metric: MetricData) {
  return metric.dataPointType === DataPointType.HISTOGRAM;
}

function toAggregationTemporality(
  temporality: AggregationTemporality,
): EAggregationTemporality {
  if (temporality === AggregationTemporality.DELTA) {
    return EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA;
  }

  if (temporality === AggregationTemporality.CUMULATIVE) {
    return EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE;
  }

  return EAggregationTemporality.AGGREGATION_TEMPORALITY_UNSPECIFIED;
}
