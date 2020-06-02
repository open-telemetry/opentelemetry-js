/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { CorrelationContext } from '../correlation_context/CorrelationContext';
import { SpanContext } from '../trace/span_context';
import { ObserverResult } from './ObserverResult';
import { BoundCounter, BoundValueRecorder } from './BoundInstrument';

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

  /** The list of label keys for the Metric. */
  labelKeys?: string[];

  /** The map of constant labels for the Metric. */
  constantLabels?: Map<string, string>;

  /**
   * Indicates the metric is a verbose metric that is disabled by default
   * @default false
   */
  disabled?: boolean;

  /**
   * Asserts that this metric may only increase (e.g. time spent).
   */
  monotonic?: boolean;

  /**
   * (ValueRecorder only, default true) Asserts that this metric will only accept
   * non-negative values (e.g. disk usage).
   */
  absolute?: boolean;

  /**
   * Indicates the type of the recorded value.
   * @default {@link ValueType.DOUBLE}
   */
  valueType?: ValueType;
}

/** The Type of value. It describes how the data is reported. */
export enum ValueType {
  INT,
  DOUBLE,
}

/**
 * Metric represents a base class for different types of metric
 * pre aggregations.
 */
export interface Metric {
  /**
   * Clears all bound instruments from the Metric.
   */
  clear(): void;
}

/**
 * UnboundMetric represents a base class for different types of metric
 * pre aggregations without label value bound yet.
 */
export interface UnboundMetric<T> extends Metric {
  /**
   * Returns a Instrument associated with specified Labels.
   * It is recommended to keep a reference to the Instrument instead of always
   * calling this method for every operations.
   * @param labels key-values pairs that are associated with a specific metric
   *     that you want to record.
   */
  bind(labels: Labels): T;

  /**
   * Removes the Instrument from the metric, if it is present.
   * @param labels key-values pairs that are associated with a specific metric.
   */
  unbind(labels: Labels): void;
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
export interface Counter extends UnboundMetric<BoundCounter> {
  /**
   * Adds the given value to the current value. Values cannot be negative.
   */
  add(value: number, labels?: Labels): void;
}

export interface ValueRecorder extends UnboundMetric<BoundValueRecorder> {
  /**
   * Records the given value to this value recorder.
   */
  record(value: number, labels?: Labels): void;

  record(
    value: number,
    labels: Labels,
    correlationContext: CorrelationContext
  ): void;

  record(
    value: number,
    labels: Labels,
    correlationContext: CorrelationContext,
    spanContext: SpanContext
  ): void;
}

/** Base interface for the Observer metrics. */
export interface Observer extends Metric {
  /**
   * Sets a callback where user can observe value for certain labels. The
   * observers are called periodically to retrieve the value.
   * @param callback a function that will be called once to set observers
   *     for values
   */
  setCallback(callback: (observerResult: ObserverResult) => void): void;
}

/**
 * key-value pairs passed by the user.
 */
export type Labels = { [key: string]: string };
