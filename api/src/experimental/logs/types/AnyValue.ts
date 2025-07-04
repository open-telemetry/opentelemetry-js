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

export type AnyValueScalar = string | number | boolean;

export type AnyValueArray = Array<AnyValue>;

/**
 * AnyValueMap is a map from string to AnyValue (attribute value or a nested map)
 */
export interface AnyValueMap {
  [attributeKey: string]: AnyValue;
}

/**
 * AnyValue can be one of the following:
 * - a scalar value
 * - a byte array
 * - array of any value
 * - map from string to any value
 * - empty value
 */
export type AnyValue =
  | AnyValueScalar
  | Uint8Array
  | AnyValueArray
  | AnyValueMap
  | null
  | undefined;
