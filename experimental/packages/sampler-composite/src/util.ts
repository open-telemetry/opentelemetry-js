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

export const INVALID_THRESHOLD = -1n;
export const INVALID_RANDOM_VALUE = -1n;

const RANDOM_VALUE_BITS = 56n;
export const MAX_THRESHOLD = 1n << RANDOM_VALUE_BITS; // 0% sampling
export const MIN_THRESHOLD = 0n; // 100% sampling
const MAX_RANDOM_VALUE = MAX_THRESHOLD - 1n;

export function isValidThreshold(threshold: bigint): boolean {
  return threshold >= MIN_THRESHOLD && threshold <= MAX_THRESHOLD;
}

export function isValidRandomValue(randomValue: bigint): boolean {
  return randomValue >= 0n && randomValue <= MAX_RANDOM_VALUE;
}
