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
import {
  Attributes,
} from '@opentelemetry/api-metrics-wip';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { InstrumentDescriptor } from '../InstrumentDescriptor';

export interface Histogram {
  /**
   * Buckets are implemented using two different arrays:
   *  - boundaries: contains every finite bucket boundary, which are inclusive lower bounds
   *  - counts: contains event counts for each bucket
   *
   * Note that we'll always have n+1 buckets, where n is the number of boundaries.
   * This is because we need to count events that are below the lowest boundary.
   *
   * Example: if we measure the values: [5, 30, 5, 40, 5, 15, 15, 15, 25]
   *  with the boundaries [ 10, 20, 30 ], we will have the following state:
   *
   * buckets: {
   *	boundaries: [10, 20, 30],
   *	counts: [3, 3, 1, 2],
   * }
   */
  buckets: {
    boundaries: number[];
    counts: number[];
  };
  sum: number;
  count: number;
}

export interface BaseMetricData {
  readonly resource: Resource;
  readonly instrumentationLibrary: InstrumentationLibrary;
  readonly instrumentDescriptor: InstrumentDescriptor;
  readonly pointDataType: PointDataType,
}

export interface SingularMetricData extends BaseMetricData {
  readonly pointDataType: PointDataType.SINGULAR,
  readonly pointData: PointData<number>[],
}

export interface HistogramMetricData extends BaseMetricData {
  readonly pointDataType: PointDataType.HISTOGRAM,
  readonly pointData: PointData<Histogram>[],
}

export type MetricData = SingularMetricData | HistogramMetricData;

export enum PointDataType {
  SINGULAR,
  HISTOGRAM,
  EXPONENTIAL_HISTOGRAM,
}

export interface PointData<T> {
  /**
   * The start epoch timestamp of the PointData, usually the time when
   * the metric was created or an aggregation was enabled.
   */
  readonly startTime: HrTime;
  /**
   * The end epoch timestamp when data were collected, usually it represents the moment
   * when `Meter.collectAndReset` was called.
   */
  readonly endTime: HrTime;
  /**
   * The attributes associated with this PointData.
   */
  readonly attributes: Attributes;
  /**
   * The data {@link PointData}s for this metric, or empty {@code Collection} if no points.
   */
  readonly point: T;
}
