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

import { Labels } from './Metric';
import { Observation } from './Observation';

/**
 * Interface that is being used in callback function for Observer Metric
 * for batch
 */
export interface BatchObserverResult {
  /**
   * Used to observe (update) observations for certain labels
   * @param labels
   * @param observations
   */
  observe(labels: Labels, observations: Observation[]): void;
}
