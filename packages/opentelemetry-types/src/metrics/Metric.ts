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
   * Monotonic allows this metric to accept negative values. If `true` only
   * non-negative values are expected.
   */
  monotonic?: boolean;

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
export interface Metric<T> {
  /**
   * Returns a Handle associated with specified label values.
   * It is recommended to keep a reference to the Handle instead of always
   * calling this method for every operations.
   * @param labelValues the list of label values.
   */
  getHandle(labelValues: string[]): T;

  /**
   * Returns a Handle for a metric with all labels not set.
   */
  getDefaultHandle(): T;

  /**
   * Removes the Handle from the metric, if it is present.
   * @param labelValues the list of label values.
   */
  removeHandle(labelValues: string[]): void;

  /**
   * Clears all timeseries from the Metric.
   */
  clear(): void;

  /**
   * what should the callback signature be?
   */
  setCallback(fn: () => void): void;
}
