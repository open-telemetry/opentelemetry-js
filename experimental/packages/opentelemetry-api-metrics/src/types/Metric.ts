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

import { Context } from '@opentelemetry/api';
import { ObservableResult } from './ObservableResult';

/**
 * Options needed for metric creation
 */
export interface MetricOptions {
  /**
   * The description of the Metric.
   * @default ''
   */
  description?: string;

  /**
   * The unit of the Metric values.
   * @default ''
   */
  unit?: string;

  /**
   * Indicates the type of the recorded value.
   * @default {@link ValueType.DOUBLE}
   */
  valueType?: ValueType;
}

export type CounterOptions = MetricOptions;
export type UpDownCounterOptions = MetricOptions;
export type ObservableGaugeOptions = MetricOptions;
export type ObservableCounterOptions = MetricOptions;
export type ObservableUpDownCounterOptions = MetricOptions;
export type HistogramOptions = MetricOptions;

/** The Type of value. It describes how the data is reported. */
export enum ValueType {
  INT,
  DOUBLE,
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
   * Increment value of counter by the input. Inputs may not be negative.
   */
  add(value: number, attributes?: Attributes, context?: Context): void;
}

export interface UpDownCounter {
  /**
   * Increment value of counter by the input. Inputs may be negative.
   */
  add(value: number, attributes?: Attributes, context?: Context): void;
}

export interface Histogram {
  /**
   * Records a measurement. Value of the measurement must not be negative.
   */
  record(value: number, attributes?: Attributes, context?: Context): void;
}

/**
 * key-value pairs passed by the user.
 */
export type Attributes = { [key: string]: string };

/**
 * The observable callback for Observable instruments.
 */
export type ObservableCallback = (observableResult: ObservableResult) => void | Promise<void>;
