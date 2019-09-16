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

export enum MeasureType {
  DOUBLE = 0,
  LONG = 1,
}

/**
 * Options needed for measure creation
 */
export interface MeasureOptions {
  // Description of the Measure.
  description?: string;

  // Unit of the Measure.
  unit?: string;

  // Type of the Measure. Default type is DOUBLE.
  type?: MeasureType;
}

/** Measure to report instantaneous measurement of a value. */
export interface Measure {
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
