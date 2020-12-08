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

import { HrTime, Labels } from '@opentelemetry/api';
import { Aggregator, AggregatorKind } from './export/types';

/**
 * Type guard to remove nulls from arrays
 *
 * @param value value to be checked for null equality
 */
export function notNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Converting the unordered labels into unique identifier string.
 * @param labels user provided unordered Labels.
 */
export function hashLabels(labels: Labels): string {
  let keys = Object.keys(labels);
  if (keys.length === 0) return '';

  keys = keys.sort();
  return keys.reduce((result, key) => {
    if (result.length > 2) {
      result += ',';
    }
    return (result += key + ':' + labels[key]);
  }, '|#');
}

export function hrTimeCompare(lhs: HrTime, rhs: HrTime): -1 | 0 | 1 {
  if (lhs[0] > rhs[0]) {
    return 1;
  } else if (lhs[0] < rhs[0]) {
    return -1;
  } else if (lhs[1] > rhs[1]) {
    return 1;
  } else if (lhs[1] < rhs[1]) {
    return -1;
  } else {
    return 0;
  }
}

/**
 * Merge two aggregator in place with lhs.
 * @param lhs
 * @param rhs
 */
export function mergeAggregator(lhs: Aggregator, rhs: Aggregator) {
  // Type narrowing
  if (lhs.kind === AggregatorKind.SUM && rhs.kind === AggregatorKind.SUM) {
    lhs.merge(rhs);
  }
  if (
    lhs.kind === AggregatorKind.LAST_VALUE &&
    rhs.kind === AggregatorKind.LAST_VALUE
  ) {
    lhs.merge(rhs);
  }
  if (
    lhs.kind === AggregatorKind.HISTOGRAM &&
    rhs.kind === AggregatorKind.HISTOGRAM
  ) {
    lhs.merge(rhs);
  }
  // Something unexpected is happening -- we could throw here. This
  // will become an error when the exporter tries to access the point,
  // presumably, so let it be.
}
