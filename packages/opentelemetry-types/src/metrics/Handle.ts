/**
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

/** A Handle for Counter Metric. */
export interface CounterHandle {
  /**
   * Adds the given value to the current value. Values cannot be negative.
   * @param value the value to add
   */
  add(value: number): void;

  /**
   * Sets the given value. Value must be larger than the current recorded value.
   * @param value the new value.
   */
  set(value: number): void;
}

/** A Handle for Gauge Metric. */
export interface GaugeHandle {
  /**
   * Adds the given value to the current value. Values can be negative.
   * @param value the value to add.
   */
  add(value: number): void;

  /**
   * Sets the given value. Values can be negative.
   * @param value the new value.
   */
  set(value: number): void;
}
