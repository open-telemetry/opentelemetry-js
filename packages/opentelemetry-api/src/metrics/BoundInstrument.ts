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

import { CorrelationContext } from '../correlation_context/CorrelationContext';
import { SpanContext } from '../trace/span_context';

/** An Instrument for Counter Metric. */
export interface BoundCounter {
  /**
   * Adds the given value to the current value. Values cannot be negative.
   * @param value the value to add.
   */
  add(value: number): void;
}

/** ValueRecorder to report instantaneous measurement of a value. */
export interface BoundValueRecorder {
  /**
   * Records the given value to this value recorder.
   * @param value to record.
   * @param correlationContext the correlationContext associated with the
   *     values.
   * @param spanContext the {@link SpanContext} that identifies the {@link Span}
   *     which the values are associated with.
   */
  record(value: number): void;
  record(value: number, correlationContext: CorrelationContext): void;
  record(
    value: number,
    correlationContext: CorrelationContext,
    spanContext: SpanContext
  ): void;
}

/** An Instrument for Base Observer */
export interface BoundBaseObserver {
  update(value: number): void;
}
