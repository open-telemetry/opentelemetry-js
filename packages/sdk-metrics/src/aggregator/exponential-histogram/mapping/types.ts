/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
