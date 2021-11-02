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

import {
  Observation,
} from './Observation';

/**
 * Options needed for metric creation
 */
export interface MetricOptions {
  /** The name of the component that reports the Metric. */
  component?: string;

  /**
   * The description of the Metric.
   * @default ''
   */
  description?: string;

  /**
   * The unit of the Metric values.
   * @default '1'
   */
  unit?: string;

  /** The map of constant labels for the Metric. */
  constantLabels?: Map<string, string>;

  /**
   * Indicates the metric is a verbose metric that is disabled by default
   * @default false
   */
  disabled?: boolean;

  /**
   * Indicates the type of the recorded value.
   * @default {@link ValueType.DOUBLE}
   */
  valueType?: ValueType;

  /**
   * Boundaries optional for histogram
   */
  boundaries?: number[];

  /**
   * Aggregation Temporality of metric
   */
  aggregationTemporality?: AggregationTemporality;
}

export interface BatchObserverOptions {
  /**
   * Indicates how long the batch metric should wait to update before cancel
   */
  maxTimeoutUpdateMS?: number;
}

/** The Type of value. It describes how the data is reported. */
export enum ValueType {
  INT,
  DOUBLE,
}

/** The kind of aggregator. */
export enum AggregationTemporality {
  AGGREGATION_TEMPORALITY_UNSPECIFIED,
  AGGREGATION_TEMPORALITY_DELTA,
  AGGREGATION_TEMPORALITY_CUMULATIVE,
}

/**
 * Counter is the most common synchronous instrument. This instrument supports
 * an `Add(increment)` function for reporting a sum, and is restricted to
 * non-negative increments. The default aggregation is Sum, as for any additive
 * instrument.
 *
 * Example uses for Counter:
 * <ol>
 *   <li> count the number of bytes received. </li>
 *   <li> count the number of requests completed. </li>
 *   <li> count the number of accounts created. </li>
 *   <li> count the number of checkpoints run. </li>
 *   <li> count the number of 5xx errors. </li>
 * <ol>
 */
export interface Counter {
  /**
   * Adds the given value to the current value. Values cannot be negative.
   */
  add(value: number, labels?: Labels): void;
}

export interface UpDownCounter {
  /**
   * Adds the given value to the current value. Values can be negative.
   */
  add(value: number, labels?: Labels): void;
}

export interface Histogram {
  /**
   * Records the given value to this histogram.
   */
  record(value: number, labels?: Labels): void;
}

/** Base interface for the Observable metrics. */
export interface ObservableBase {
  observation: (
    value: number,
    labels?: Labels,
  ) => Observation;
}

/** Base interface for the ObservableGauge metrics. */
export type ObservableGauge = ObservableBase;

/** Base interface for the ObservableUpDownCounter metrics. */
export type ObservableUpDownCounter = ObservableBase;

/** Base interface for the ObservableCounter metrics. */
export type ObservableCounter = ObservableBase;

/**
 * key-value pairs passed by the user.
 */
export type Labels = { [key: string]: string };
