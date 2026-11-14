/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AggregationTemporality,
  AggregationTemporalityPreference,
} from './AggregationTemporality';
import { InstrumentType } from './MetricData';
import type { AggregationOption } from '../view/AggregationOption';
import { AggregationType } from '../view/AggregationOption';

/**
 * Aggregation selector based on metric instrument types.
 */
export type AggregationSelector = (
  instrumentType: InstrumentType
) => AggregationOption;

/**
 * Aggregation temporality selector based on metric instrument types.
 */
export type AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => AggregationTemporality;

export const DEFAULT_AGGREGATION_SELECTOR: AggregationSelector =
  _instrumentType => {
    return {
      type: AggregationType.DEFAULT,
    };
  };

export const DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR: AggregationTemporalitySelector =
  _instrumentType => AggregationTemporality.CUMULATIVE;

/**
 * Selector resolving every instrument type to
 * {@link AggregationTemporality.CUMULATIVE}.
 */
export const CumulativeTemporalitySelector: AggregationTemporalitySelector =
  () => AggregationTemporality.CUMULATIVE;

/**
 * Selector resolving every instrument type to
 * {@link AggregationTemporality.DELTA}, except up-down counters, which are
 * cumulative because their values are not monotonic.
 */
export const DeltaTemporalitySelector: AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => {
  switch (instrumentType) {
    case InstrumentType.COUNTER:
    case InstrumentType.OBSERVABLE_COUNTER:
    case InstrumentType.GAUGE:
    case InstrumentType.HISTOGRAM:
    case InstrumentType.OBSERVABLE_GAUGE:
      return AggregationTemporality.DELTA;
    case InstrumentType.UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
      return AggregationTemporality.CUMULATIVE;
  }
};

/**
 * Selector favouring the lower-memory delta temporality for the instrument
 * types where it is safe (counter, histogram) and cumulative elsewhere.
 */
export const LowMemoryTemporalitySelector: AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => {
  switch (instrumentType) {
    case InstrumentType.COUNTER:
    case InstrumentType.HISTOGRAM:
      return AggregationTemporality.DELTA;
    case InstrumentType.GAUGE:
    case InstrumentType.UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_COUNTER:
    case InstrumentType.OBSERVABLE_GAUGE:
      return AggregationTemporality.CUMULATIVE;
  }
};

/**
 * Resolve an {@link AggregationTemporalityPreference} to the concrete
 * {@link AggregationTemporalitySelector} it denotes.
 *
 * Accepts a bare {@link AggregationTemporality} as well: the two enums are
 * deliberately kept numerically aligned for `DELTA` and `CUMULATIVE`, so a
 * caller that only cares about a fixed temporality can pass it directly.
 * Anything that is not `DELTA` or `LOWMEMORY` resolves to cumulative, matching
 * the declarative-configuration default.
 */
export function aggregationTemporalitySelectorFromPreference(
  preference: AggregationTemporalityPreference | AggregationTemporality
): AggregationTemporalitySelector {
  if (preference === AggregationTemporalityPreference.DELTA) {
    return DeltaTemporalitySelector;
  }
  if (preference === AggregationTemporalityPreference.LOWMEMORY) {
    return LowMemoryTemporalitySelector;
  }
  return CumulativeTemporalitySelector;
}
