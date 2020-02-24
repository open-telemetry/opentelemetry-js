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

import { DistributedContext } from '../distributed_context/DistributedContext';
import { SpanContext } from '../trace/span_context';

/** An Instrument for Counter Metric. */
export interface BoundCounter {
  /**
   * Adds the given value to the current value. Values cannot be negative.
   * @param value the value to add.
   */
  add(value: number): void;
}

/** Measure to report instantaneous measurement of a value. */
export interface BoundMeasure {
  /**
   * Records the given value to this measure.
   * @param value the measurement to record.
   * @param distContext the distContext associated with the measurements.
   * @param spanContext the {@link SpanContext} that identifies the {@link Span}
   *     for which the measurements are associated with.
   */
  record(value: number): void;
  record(value: number, distContext: DistributedContext): void;
  record(
    value: number,
    distContext: DistributedContext,
    spanContext: SpanContext
  ): void;
}
