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

import * as oc from '@opencensus/core';
import { Attributes, HrTime, ValueType, diag } from '@opentelemetry/api';
import {
  AggregationTemporality,
  DataPoint,
  DataPointType,
  GaugeMetricData,
  HistogramMetricData,
  MetricData,
  SumMetricData,
} from '@opentelemetry/sdk-metrics';

type BaseMetric = Omit<MetricData, 'dataPoints' | 'dataPointType'>;
interface MappedType {
  valueType: ValueType;
  dataPointType:
    | DataPointType.GAUGE
    | DataPointType.SUM
    | DataPointType.HISTOGRAM;
}
const ZEROED_HRTIME: HrTime = [0, 0];

export function mapOcMetric(metric: oc.Metric): MetricData | null {
  const { description, name, unit, type } = metric.descriptor;
  const mappedType = mapOcMetricDescriptorType(type);
  if (mappedType === null) {
    return null;
  }

  const baseMetric: BaseMetric = {
    aggregationTemporality: AggregationTemporality.CUMULATIVE,
    descriptor: {
      description,
      name,
      unit,
      valueType: mappedType.valueType,
    },
  };

  switch (mappedType.dataPointType) {
    case DataPointType.GAUGE:
      return gauge(metric, mappedType.dataPointType, baseMetric);
    case DataPointType.SUM:
      return sum(metric, mappedType.dataPointType, baseMetric);
    case DataPointType.HISTOGRAM:
      return histogram(metric, mappedType.dataPointType, baseMetric);
  }
}

function mapOcMetricDescriptorType(
  type: oc.MetricDescriptorType
): MappedType | null {
  switch (type) {
    case oc.MetricDescriptorType.GAUGE_INT64:
      return {
        valueType: ValueType.INT,
        dataPointType: DataPointType.GAUGE,
      };
    case oc.MetricDescriptorType.GAUGE_DOUBLE:
      return {
        valueType: ValueType.DOUBLE,
        dataPointType: DataPointType.GAUGE,
      };

    case oc.MetricDescriptorType.CUMULATIVE_INT64:
      return {
        valueType: ValueType.INT,
        dataPointType: DataPointType.SUM,
      };
    case oc.MetricDescriptorType.CUMULATIVE_DOUBLE:
      return {
        valueType: ValueType.DOUBLE,
        dataPointType: DataPointType.SUM,
      };

    case oc.MetricDescriptorType.CUMULATIVE_DISTRIBUTION:
      return {
        valueType: ValueType.DOUBLE,
        dataPointType: DataPointType.HISTOGRAM,
      };

    case oc.MetricDescriptorType.SUMMARY:
    case oc.MetricDescriptorType.GAUGE_DISTRIBUTION:
    case oc.MetricDescriptorType.UNSPECIFIED:
      diag.warn(
        'Got unsupported metric MetricDescriptorType from OpenCensus: %s',
        type
      );
      return null;
  }
}

function gauge(
  metric: oc.Metric,
  dataPointType: DataPointType.GAUGE,
  baseMetric: BaseMetric
): GaugeMetricData {
  return {
    ...baseMetric,
    dataPoints: dataPoints(metric, value => value as number),
    dataPointType,
  };
}

function sum(
  metric: oc.Metric,
  dataPointType: DataPointType.SUM,
  baseMetric: BaseMetric
): SumMetricData {
  return {
    ...baseMetric,
    dataPoints: dataPoints(metric, value => value as number),
    isMonotonic: true,
    dataPointType,
  };
}

function histogram(
  metric: oc.Metric,
  dataPointType: DataPointType.HISTOGRAM,
  baseMetric: BaseMetric
): HistogramMetricData {
  return {
    ...baseMetric,
    dataPoints: dataPoints(metric, value => {
      const {
        bucketOptions: {
          explicit: { bounds },
        },
        buckets,
        count,
        sum: distSum,
      } = value as oc.DistributionValue;

      return {
        buckets: {
          boundaries: bounds,
          counts: buckets.map(bucket => bucket.count),
        },
        count,
        sum: distSum,
      };
    }),
    dataPointType,
  };
}

function dataPoints<T>(
  metric: oc.Metric,
  valueMapper: (value: oc.TimeSeriesPoint['value']) => T
): DataPoint<T>[] {
  return metric.timeseries.flatMap(ts => {
    const attributes = zipOcLabels(metric.descriptor.labelKeys, ts.labelValues);

    // use zeroed hrTime if it is undefined, which probably shouldn't happen
    const startTime = ocTimestampToHrTime(ts.startTimestamp) ?? ZEROED_HRTIME;

    // points should be an array with a single value, so this will return a single point per
    // attribute set.
    return ts.points.map(
      (point): DataPoint<T> => ({
        startTime,
        attributes,
        value: valueMapper(point.value),
        endTime: ocTimestampToHrTime(point.timestamp) ?? ZEROED_HRTIME,
      })
    );
  });
}

function ocTimestampToHrTime(ts: oc.Timestamp | undefined): HrTime | null {
  if (ts === undefined || ts.seconds === null) {
    return null;
  }
  return [ts.seconds, ts.nanos ?? 0];
}

function zipOcLabels(
  labelKeys: oc.LabelKey[],
  labelValues: oc.LabelValue[]
): Attributes {
  const attributes: Attributes = {};
  for (let i = 0; i < labelKeys.length; i++) {
    attributes[labelKeys[i].key] = labelValues[i].value ?? '';
  }
  return attributes;
}
