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

import { Attributes, AttributeValue } from '../common/Attributes';
import { Context } from '../context/types';
import { BatchObservableResult, ObservableResult } from './ObservableResult';

/**
 * Advisory options influencing aggregation configuration parameters.
 *
 * @since 1.7.0
 * @experimental
 */
export interface MetricAdvice {
  /**
   * Hint the explicit bucket boundaries for SDK if the metric is been
   * aggregated with a HistogramAggregator.
   */
  explicitBucketBoundaries?: number[];
}

/**
 * Options needed for metric creation
 *
 * @since 1.3.0
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

  /**
   * The advice influencing aggregation configuration parameters.
   * @experimental
   * @since 1.7.0
   */
  advice?: MetricAdvice;
}

/**
 * The Type of value. It describes how the data is reported.
 *
 * @since 1.3.0
 */
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
 *
 * @since 1.3.0
 */
export interface Counter<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> {
  /**
   * Increment value of counter by the input. Inputs must not be negative.
   */
  add(value: number, attributes?: AttributesTypes, context?: Context): void;
}

/**
 * @since 1.3.0
 */
export interface UpDownCounter<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> {
  /**
   * Increment value of counter by the input. Inputs may be negative.
   */
  add(value: number, attributes?: AttributesTypes, context?: Context): void;
}

/**
 * @since 1.9.0
 */
export interface Gauge<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> {
  /**
   * Records a measurement.
   */
  record(value: number, attributes?: AttributesTypes, context?: Context): void;
}

/**
 * @since 1.3.0
 */
export interface Histogram<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> {
  /**
   * Records a measurement. Value of the measurement must not be negative.
   */
  record(value: number, attributes?: AttributesTypes, context?: Context): void;
}

/**
 * @deprecated please use {@link Attributes}
 * @since 1.3.0
 */
export type MetricAttributes = Attributes;

/**
 * @deprecated please use {@link AttributeValue}
 * @since 1.3.0
 */
export type MetricAttributeValue = AttributeValue;

/**
 * The observable callback for Observable instruments.
 *
 * @since 1.3.0
 */
export type ObservableCallback<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> = (
  observableResult: ObservableResult<AttributesTypes>
) => void | Promise<void>;

/**
 * The observable callback for a batch of Observable instruments.
 *
 * @since 1.3.0
 */
export type BatchObservableCallback<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> = (
  observableResult: BatchObservableResult<AttributesTypes>
) => void | Promise<void>;

/**
 * @since 1.3.0
 */
export interface Observable<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> {
  /**
   * Sets up a function that will be called whenever a metric collection is initiated.
   *
   * If the function is already in the list of callbacks for this Observable, the function is not added a second time.
   */
  addCallback(callback: ObservableCallback<AttributesTypes>): void;

  /**
   * Removes a callback previously registered with {@link Observable.addCallback}.
   */
  removeCallback(callback: ObservableCallback<AttributesTypes>): void;
}

/**
 * @since 1.3.0
 */
export type ObservableCounter<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> = Observable<AttributesTypes>;
/**
 * @since 1.3.0
 */
export type ObservableUpDownCounter<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> = Observable<AttributesTypes>;
/**
 * @since 1.3.0
 */
export type ObservableGauge<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> = Observable<AttributesTypes>;
