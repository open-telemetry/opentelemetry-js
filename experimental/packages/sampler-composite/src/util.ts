/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
