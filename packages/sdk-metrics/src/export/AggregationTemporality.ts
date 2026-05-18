/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AggregationTemporality indicates the way additive quantities are expressed.
 */
export enum AggregationTemporality {
  DELTA,
  CUMULATIVE,
}
