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

export enum MeasureType {
  DOUBLE = 0,
  LONG = 1,
}

export interface MeasureOptions {
  // Description of the Measure.
  description?: string;

  // Unit of the Measure.
  unit?: string;

  // Type of the Measure. Default type is DOUBLE.
  type?: MeasureType;
}

export interface Measure {
  // Creates a measurement with the supplied value.
  createMeasurement(value: number): Measurement;
}

// Measurement describes an individual measurement
export interface Measurement {}
