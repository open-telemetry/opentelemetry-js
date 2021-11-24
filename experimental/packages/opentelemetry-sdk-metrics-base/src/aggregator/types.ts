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
import { AggregationTemporality } from '../export/AggregationTemporality';
import { Histogram, MetricData } from '../export/MetricData';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';

/** The kind of aggregator. */
export enum AggregatorKind {
  NONE,
  SUM,
  LAST_VALUE,
  HISTOGRAM,
}

/** Sum returns an aggregated sum. */
export type Sum = number;

/** LastValue returns last value. */
export type LastValue = number;

export type PointValueType = Sum | LastValue | Histogram;

/**
 * An Aggregator accumulation state.
 */
export interface Accumulation {
  // TODO: attributes and context for `ExemplarReservoir.offer`.
  record(value: number): void;
}

export type AccumulationRecord<T> = [Attributes, T];

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
  createAccumulation(): T;

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
   * @param resource the resource producing the metric.
   * @param instrumentationLibrary the library that instrumented the metric
   * @param instrumentDescriptor the metric instrument descriptor.
   * @param accumulationByAttributes the array of attributes and accumulation pair.
   * @param temporality the temporality of the accumulation.
   * @param sdkStartTime the start time of the sdk.
   * @param lastCollectionTime the last collection time of the instrument.
   * @param collectionTime the active collection time of the instrument.
   * @return the {@link MetricData} that this {@link Aggregator} will produce.
   */
  toMetricData(resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    instrumentDescriptor: InstrumentDescriptor,
    accumulationByAttributes: AccumulationRecord<T>[],
    temporality: AggregationTemporality,
    sdkStartTime: HrTime,
    lastCollectionTime: HrTime,
    collectionTime: HrTime): Maybe<MetricData>;
}
