/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Accumulation, Aggregator } from '../aggregator/types';
import { AggregatorKind } from '../aggregator/types';
import type { Maybe } from '../utils';
import type { ExemplarReservoir } from './ExemplarReservoir';
import { SimpleFixedSizeExemplarReservoir } from './SimpleFixedSizeExemplarReservoir';
import { AlignedHistogramBucketExemplarReservoir } from './AlignedHistogramBucketExemplarReservoir';
import type { HistogramAggregator } from '../aggregator/Histogram';
import type { ExponentialHistogramAggregator } from '../aggregator/ExponentialHistogram';

/**
 * @experimental Creates a default ExemplarReservoir based on the aggregator type.
 *
 * Per the OpenTelemetry specification:
 * - Histogram with > 1 boundary: AlignedHistogramBucketExemplarReservoir
 * - ExponentialHistogram: SimpleFixedSizeExemplarReservoir(min(20, maxSize))
 * - All others (SUM, LAST_VALUE, GAUGE): SimpleFixedSizeExemplarReservoir(1)
 */
export function createDefaultExemplarReservoir(
  aggregator: Aggregator<Maybe<Accumulation>>
): ExemplarReservoir {
  switch (aggregator.kind) {
    case AggregatorKind.HISTOGRAM: {
      const histAggregator = aggregator as unknown as HistogramAggregator;
      const boundaries = histAggregator.boundaries;
      if (boundaries && boundaries.length > 0) {
        return new AlignedHistogramBucketExemplarReservoir(boundaries);
      }
      return new SimpleFixedSizeExemplarReservoir(1);
    }
    case AggregatorKind.EXPONENTIAL_HISTOGRAM: {
      const expHistAggregator =
        aggregator as unknown as ExponentialHistogramAggregator;
      return new SimpleFixedSizeExemplarReservoir(
        Math.min(20, expHistAggregator._maxSize)
      );
    }
    default:
      return new SimpleFixedSizeExemplarReservoir(1);
  }
}
