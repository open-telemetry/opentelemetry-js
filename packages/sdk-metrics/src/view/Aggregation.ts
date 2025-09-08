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

import * as api from '@opentelemetry/api';
import {
  Aggregator,
  SumAggregator,
  DropAggregator,
  LastValueAggregator,
  HistogramAggregator,
  ExponentialHistogramAggregator,
} from '../aggregator';
import { Accumulation } from '../aggregator/types';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';
import { InstrumentType } from '../export/MetricData';

/**
 * Configures how measurements are combined into metrics for views.
 *
 * Aggregation provides a set of built-in aggregations via static methods.
 */
export interface Aggregation {
  createAggregator(
    instrument: InstrumentDescriptor
  ): Aggregator<Maybe<Accumulation>>;
}

/**
 * The default drop aggregation.
 */
export class DropAggregation implements Aggregation {
  private static DEFAULT_INSTANCE = new DropAggregator();
  createAggregator(_instrument: InstrumentDescriptor) {
    return DropAggregation.DEFAULT_INSTANCE;
  }
}

/**
 * The default sum aggregation.
 */
export class SumAggregation implements Aggregation {
  private static MONOTONIC_INSTANCE = new SumAggregator(true);
  private static NON_MONOTONIC_INSTANCE = new SumAggregator(false);
  createAggregator(instrument: InstrumentDescriptor) {
    switch (instrument.type) {
      case InstrumentType.COUNTER:
      case InstrumentType.OBSERVABLE_COUNTER:
      case InstrumentType.HISTOGRAM: {
        return SumAggregation.MONOTONIC_INSTANCE;
      }
      default: {
        return SumAggregation.NON_MONOTONIC_INSTANCE;
      }
    }
  }
}

/**
 * The default last value aggregation.
 */
export class LastValueAggregation implements Aggregation {
  private static DEFAULT_INSTANCE = new LastValueAggregator();
  createAggregator(_instrument: InstrumentDescriptor) {
    return LastValueAggregation.DEFAULT_INSTANCE;
  }
}

/**
 * The default histogram aggregation.

 */
export class HistogramAggregation implements Aggregation {
  private static DEFAULT_INSTANCE = new HistogramAggregator(
    [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000],
    true
  );
  createAggregator(_instrument: InstrumentDescriptor) {
    return HistogramAggregation.DEFAULT_INSTANCE;
  }
}

/**
 * The explicit bucket histogram aggregation.
 */
export class ExplicitBucketHistogramAggregation implements Aggregation {
  private _boundaries: number[];

  /**
   * @param boundaries the bucket boundaries of the histogram aggregation
   * @param _recordMinMax If set to true, min and max will be recorded. Otherwise, min and max will not be recorded.
   */
  constructor(
    boundaries: number[],
    private readonly _recordMinMax = true
  ) {
    if (boundaries == null) {
      throw new Error(
        'ExplicitBucketHistogramAggregation should be created with explicit boundaries, if a single bucket histogram is required, please pass an empty array'
      );
    }
    // Copy the boundaries array for modification.
    boundaries = boundaries.concat();
    // We need to an ordered set to be able to correctly compute count for each
    // boundary since we'll iterate on each in order.
    boundaries = boundaries.sort((a, b) => a - b);
    // Remove all Infinity from the boundaries.
    const minusInfinityIndex = boundaries.lastIndexOf(-Infinity);
    let infinityIndex: number | undefined = boundaries.indexOf(Infinity);
    if (infinityIndex === -1) {
      infinityIndex = undefined;
    }
    this._boundaries = boundaries.slice(minusInfinityIndex + 1, infinityIndex);
  }

  createAggregator(_instrument: InstrumentDescriptor) {
    return new HistogramAggregator(this._boundaries, this._recordMinMax);
  }
}

export class ExponentialHistogramAggregation implements Aggregation {
  constructor(
    private readonly _maxSize = 160,
    private readonly _recordMinMax = true
  ) {}
  createAggregator(_instrument: InstrumentDescriptor) {
    return new ExponentialHistogramAggregator(
      this._maxSize,
      this._recordMinMax
    );
  }
}

/**
 * The default aggregation.
 */
export class DefaultAggregation implements Aggregation {
  private _resolve(instrument: InstrumentDescriptor): Aggregation {
    // cast to unknown to disable complaints on the (unreachable) fallback.
    switch (instrument.type as unknown) {
      case InstrumentType.COUNTER:
      case InstrumentType.UP_DOWN_COUNTER:
      case InstrumentType.OBSERVABLE_COUNTER:
      case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER: {
        return SUM_AGGREGATION;
      }
      case InstrumentType.GAUGE:
      case InstrumentType.OBSERVABLE_GAUGE: {
        return LAST_VALUE_AGGREGATION;
      }
      case InstrumentType.HISTOGRAM: {
        if (instrument.advice.explicitBucketBoundaries) {
          return new ExplicitBucketHistogramAggregation(
            instrument.advice.explicitBucketBoundaries
          );
        }
        return HISTOGRAM_AGGREGATION;
      }
    }
    api.diag.warn(`Unable to recognize instrument type: ${instrument.type}`);
    return DROP_AGGREGATION;
  }

  createAggregator(
    instrument: InstrumentDescriptor
  ): Aggregator<Maybe<Accumulation>> {
    return this._resolve(instrument).createAggregator(instrument);
  }
}

export const DROP_AGGREGATION = new DropAggregation();
export const SUM_AGGREGATION = new SumAggregation();
export const LAST_VALUE_AGGREGATION = new LastValueAggregation();
export const HISTOGRAM_AGGREGATION = new HistogramAggregation();
export const EXPONENTIAL_HISTOGRAM_AGGREGATION =
  new ExponentialHistogramAggregation();
export const DEFAULT_AGGREGATION = new DefaultAggregation();
