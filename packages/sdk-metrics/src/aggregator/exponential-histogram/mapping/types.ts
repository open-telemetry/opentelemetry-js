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
export class MappingError extends Error {}

/**
 * The mapping interface is used by the exponential histogram to determine
 * where to bucket values. The interface is implemented by ExponentMapping,
 * used for scales [-10, 0] and LogarithmMapping, used for scales [1, 20].
 */
export interface Mapping {
  mapToIndex(value: number): number;
  lowerBoundary(index: number): number;
  get scale(): number;
}
