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

import { MetricAttributes, Observable } from './Metric';

/**
 * Interface that is being used in callback function for Observable Metric.
 */
export interface ObservableResult {
  /**
   * Observe a measurement of the value associated with the given attributes.
   *
   * @param value The value to be observed.
   * @param attributes The attributes associated with the value. If more than
   * one values associated with the same attributes values, SDK may pick the
   * last one or simply drop the entire observable result.
   */
  observe(value: number, attributes?: MetricAttributes): void;
}

/**
 * Interface that is being used in batch observable callback function.
 */
export interface BatchObservableResult {
  /**
   * Observe a measurement of the value associated with the given attributes.
   *
   * @param metric The observable metric to be observed.
   * @param value The value to be observed.
   * @param attributes The attributes associated with the value. If more than
   * one values associated with the same attributes values, SDK may pick the
   * last one or simply drop the entire observable result.
   */
  observe(metric: Observable, value: number, attributes?: MetricAttributes): void;
}
