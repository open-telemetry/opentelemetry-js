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

import { Context, HrTime, Attributes } from '@opentelemetry/api';

/**
 * This interface represents a ExemplarFilter. Exemplar filters are
 * used to filter measurements before attempting to store them in a
 * reservoir.
 */
export interface ExemplarFilter {
  /**
   * Returns whether or not a reservoir should attempt to filter a measurement.
   *
   * @param value The value of the measurement
   * @param timestamp A timestamp that best represents when the measurement was taken
   * @param attributes The complete set of Attributes of the measurement
   * @param ctx The Context of the measurement
   */
  shouldSample(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ): boolean;
}
