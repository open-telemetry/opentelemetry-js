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
import { Entity } from './entity';

/*
 * The Entity detector in the SDK is responsible for detecting possible entities that could identify
 * the SDK (called "associated entities"). For Example, if the SDK is running in a kubernetes pod,
 * it may provide an Entity for that pod.
 */
export interface EntityDetector {
  /**
   * Discovers {@link Entity} and their current attributes.
   *
   * @return a list of discovered entities.
   */
  detectEntities(): Entity[];
}
