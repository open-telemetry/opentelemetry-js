/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AggregationTemporality } from './AggregationTemporality';
import { InstrumentType } from './MetricData';
import { AggregationOption, AggregationType } from '../view/AggregationOption';

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
