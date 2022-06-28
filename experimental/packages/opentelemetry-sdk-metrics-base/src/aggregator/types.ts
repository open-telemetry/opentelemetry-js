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
import { MetricAttributes } from '@opentelemetry/api-metrics';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { MetricData } from '../export/MetricData';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';

/** The kind of aggregator. */
export enum AggregatorKind {
  DROP,
  SUM,
  LAST_VALUE,
  HISTOGRAM,
}

/** DataPoint value type for SumAggregation. */
export type Sum = number;

/** DataPoint value type for LastValueAggregation. */
export type LastValue = number;

/** DataPoint value type for HistogramAggregation. */
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
  hasMinMax: boolean;
  min: number;
  max: number;
}

/**
 * An Aggregator accumulation state.
 */
export interface Accumulation {
  setStartTime(startTime: HrTime): void;
  record(value: number): void;
}

export type AccumulationRecord<T> = [MetricAttributes, T];

/**
 * Base interface for aggregators. Aggregators are responsible for holding
 * aggregated values and taking a snapshot of these values upon export.
 */
export interface Aggregator<T> {
  /** The kind of the aggregator. */
  kind: AggregatorKind;

  /**
   * Create a clean state of accumulation.
   */
  createAccumulation(startTime: HrTime): T;

  /**
   * Returns the result of the merge of the given accumulations.
   *
   * This should always assume that the accumulations do not overlap and merge together for a new
   * cumulative report.
   *
   * @param previous the previously captured accumulation
   * @param delta the newly captured (delta) accumulation
   * @returns the result of the merge of the given accumulations
   */
  merge(previous: T, delta: T): T;

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   *
   * @param previous the previously captured accumulation
   * @param current the newly captured (cumulative) accumulation
   * @returns The resulting delta accumulation
   */
  diff(previous: T, current: T): T;

  /**
   * Returns the {@link MetricData} that this {@link Aggregator} will produce.
   *
   * @param descriptor the metric instrument descriptor.
   * @param accumulationByAttributes the array of attributes and accumulation pairs.
   * @param endTime the end time of the metric data.
   * @return the {@link MetricData} that this {@link Aggregator} will produce.
   */
  toMetricData(descriptor: InstrumentDescriptor,
    aggregationTemporality: AggregationTemporality,
    accumulationByAttributes: AccumulationRecord<T>[],
    endTime: HrTime): Maybe<MetricData>;
}
