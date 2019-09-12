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

import { Attributes } from '../trace/attributes';
import { Resource } from '../resources/Resource';

export interface MetricOptions {
  // Description of the Metric.
  description?: string;

  // Unit of the Metric values.
  unit?: string;

  // List of attribute keys with dynamic values. Order of list is important
  // as the same order must be used when supplying values for these attributes.
  dynamicAttributes?: string[];

  // List of attributes with constant values.
  constantAttributes?: Attributes;

  // Resource the metric is associated with.
  resource?: Resource;

  // Name of the component that reports the metric.
  component?: string;
}

// Metric represents a base class for different types of metric preaggregations.
export interface Metric<T> {
  // Creates a timeseries if the specified attribute values
  // are not associated with an existing timeseries, otherwise returns the
  // existing timeseries.
  // Order and number of attribute values MUST match the order and number of
  // dynanic attribute keys when the Metric was created.
  getOrCreateTimeseries(values: unknown[]): T;

  // Returns a timeseries with all attribute values not set.
  getDefaultTimeseries(): T;

  // Removes an existing timeseries. Order and number of attribute values MUST
  // match the order and number of dynamic attribute keys when the Metric was
  // created.
  removesTimeseries(values: unknown[]): void;

  // Clears all timeseries from the Metric.
  clear(): void;

  // todo: what should the callback signature be?
  setCallback(fn: () => void): void;
}
