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

import { HrTime } from '@opentelemetry/api';
import { Attributes } from '@opentelemetry/api-metrics';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Histogram } from '../aggregator/types';

/**
 * Basic metric data fields.
 */
export interface BaseMetricData {
  readonly instrumentDescriptor: InstrumentDescriptor;
  /**
   * PointDataType of the metric instrument.
   */
  readonly pointDataType: PointDataType;
}

/**
 * Represents a metric data aggregated by either a LastValueAggregation or
 * SumAggregation.
 */
export interface SingularMetricData extends BaseMetricData {
  readonly pointDataType: PointDataType.SINGULAR;
  readonly pointData: PointData<number>[];
}

/**
 * Represents a metric data aggregated by a HistogramAggregation.
 */
export interface HistogramMetricData extends BaseMetricData {
  readonly pointDataType: PointDataType.HISTOGRAM;
  readonly pointData: PointData<Histogram>[];
}

/**
 * Represents an aggregated metric data.
 */
export type MetricData = SingularMetricData | HistogramMetricData;

export interface InstrumentationLibraryMetrics {
  instrumentationLibrary: InstrumentationLibrary;
  metrics: MetricData[];
}

export interface ResourceMetrics {
  resource: Resource;
  instrumentationLibraryMetrics: InstrumentationLibraryMetrics[];
}

/**
 * The aggregated point data type.
 */
export enum PointDataType {
  SINGULAR,
  HISTOGRAM,
  EXPONENTIAL_HISTOGRAM,
}

/**
 * Represents an aggregated point data with start time, end time and their
 * associated attributes and points.
 */
export interface PointData<T> {
  /**
   * The start epoch timestamp of the PointData, usually the time when
   * the metric was created when the preferred AggregationTemporality is
   * CUMULATIVE, or last collection time otherwise.
   */
  readonly startTime: HrTime;
  /**
   * The end epoch timestamp when data were collected, usually it represents
   * the moment when `MetricReader.collect` was called.
   */
  readonly endTime: HrTime;
  /**
   * The attributes associated with this PointData.
   */
  readonly attributes: Attributes;
  /**
   * The data points for this metric.
   */
  readonly point: T;
}
