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

import { Attributes } from '@opentelemetry/api-metrics-wip';

export type Maybe<T> = T | undefined;

export function isNotNullish<T>(item: Maybe<T>): item is T {
  return item !== undefined && item !== null;
}

/**
 * Converting the unordered attributes into unique identifier string.
 * @param attributes user provided unordered Attributes.
 */
export function hashAttributes(attributes: Attributes): string {
  let keys = Object.keys(attributes);
  if (keys.length === 0) return '';

  keys = keys.sort();
  return keys.reduce((result, key) => {
    if (result.length > 2) {
      result += ',';
    }
    return (result += key + ':' + attributes[key]);
  }, '|#');
}
