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
import { AggregationTemporality, Attributes } from '@opentelemetry/api-metrics-wip';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
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

  createAccumulation(): T;

  merge(previous: T, delta: T): T;

  diff(previous: T, current: T): T;

  toMetricData(resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    instrumentDescriptor: InstrumentDescriptor,
    accumulationByAttributes: AccumulationRecord<T>[],
    temporality: AggregationTemporality,
    sdkStartTime: HrTime,
    lastCollectionTime: HrTime,
    collectionTime: HrTime): Maybe<MetricData>;
}
