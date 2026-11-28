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

/**
 * AggregationTemporalityPreference expresses a *preference* for how additive
 * quantities should be expressed, which is then resolved to a concrete
 * {@link AggregationTemporality} per {@link InstrumentType}.
 *
 * This mirrors the `temporality_preference` values defined by declarative
 * configuration (`cumulative`, `delta`, `low_memory`). Note that `LOWMEMORY`
 * is intentionally *not* a member of {@link AggregationTemporality}: it is a
 * preference that resolves to `DELTA` for counter and histogram instruments
 * and `CUMULATIVE` for all others.
 *
 * IMPORTANT: the order of `DELTA` and `CUMULATIVE` must stay aligned with
 * {@link AggregationTemporality} so that the numeric values of the two enums
 * agree (`DELTA === 0`, `CUMULATIVE === 1`). Exporter option types such as
 * `OTLPMetricExporterOptions.temporalityPreference` accept
 * `AggregationTemporalityPreference | AggregationTemporality` and rely on that
 * correspondence. New members must be appended, never inserted.
 */
export enum AggregationTemporalityPreference {
  DELTA,
  CUMULATIVE,
  LOWMEMORY,
}
