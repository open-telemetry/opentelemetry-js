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

import {
  Accumulation,
  AccumulationRecord,
  Aggregator,
  AggregatorKind,
} from './types';
import {
  DataPointType,
  ExponentialHistogramMetricData,
} from '../export/MetricData';
import { HrTime } from '@opentelemetry/api';
import { InstrumentDescriptor, InstrumentType } from '../InstrumentDescriptor';
import { Maybe } from '../utils';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { Buckets } from './exponential-histogram/Buckets';
import { Mapping } from './exponential-histogram/mapping/types';
import { ExponentMapping } from './exponential-histogram/mapping/ExponentMapping';
import { LogarithmMapping } from './exponential-histogram/mapping/LogarithmMapping';
import * as util from './exponential-histogram//util';

/**
 * Internal value type for ExponentialHistogramAggregation.
 * Differs from the exported type as undefined sum/min/max complicate arithmetic
 * performed by this aggregation, but are required to be undefined in the exported types.
 */
interface InternalHistogram {
  positive: {
    offset: number;
    counts: number[];
  };
  negative: {
    offset: number;
    counts: number[];
  };
  hasMinMax: boolean;
  min: number;
  max: number;
  sum: number;
  count: number;
  scale: number;
  zeroCount: number;
}

type HighLow = {
  high: number;
  low: number;
};

type IncrementResult = {
  success: boolean;
  highLow?: HighLow;
};

export class ExponentialHistogramAccumulation implements Accumulation {
  static DEFAULT_MAX_SIZE = 160;
  public startTime: HrTime;
  private _maxSize: number;
  //private _recordMinMax: boolean;
  private _sum: number;
  private _count: number;
  private _zeroCount: number;
  private _min: number;
  private _max: number;
  private _positive: Buckets;
  private _negative: Buckets;
  private _mapping: Mapping;

  constructor(
    startTime: HrTime,
    maxSize: number = ExponentialHistogramAccumulation.DEFAULT_MAX_SIZE,
    _recordMinMax = true,
  ) {
    this.startTime = startTime;
    this._maxSize =
      maxSize || ExponentialHistogramAccumulation.DEFAULT_MAX_SIZE;
    //this._recordMinMax = recordMinMax;
    this._sum = 0;
    this._count = 0;
    this._zeroCount = 0;
    this._min = Number.POSITIVE_INFINITY;
    this._max = Number.NEGATIVE_INFINITY;
    this._positive = new Buckets();
    this._negative = new Buckets();
    this._mapping = LogarithmMapping.get(LogarithmMapping.MAX_SCALE);
  }

  /**
   * record supports updating a histogram with a single count.
   * @param {Number} value
   */
  record(value: number) {
    this.updateByIncrement(value, 1);
  }

  setStartTime(startTime: HrTime): void {
    this.startTime = startTime;
  }

  toPointValue(): InternalHistogram {
    //todo: implement
    return {
      hasMinMax: true,
      min: 0,
      max: 0,
      sum: 0,
      positive: {
        offset: 0,
        counts: [0],
      },
      negative: {
        offset: 0,
        counts: [0],
      },
      count: 0,
      scale: 0,
      zeroCount: 0,
    };
  }

  sum(): number {
    return this._sum;
  }

  min(): number {
    return this._min;
  }

  max(): number {
    return this._max;
  }

  count(): number {
    return this._count;
  }

  scale(): number {
    if (this._count === this._zeroCount) {
      // all zeros! scale doesn't matter, use zero
      return 0;
    }
    return this._mapping.scale();
  }

  positive(): Buckets {
    return this._positive;
  }

  negative(): Buckets {
    return this._negative;
  }

  /**
   * Clear resets a histogram to the empty state without changing backing array.
   */
  clear() {
    this._sum = 0;
    this._count = 0;
    this._zeroCount = 0;
    this._min = 0;
    this._max = 0;
    this._positive.clear();
    this._negative.clear();
    this._mapping = LogarithmMapping.get(LogarithmMapping.MAX_SCALE);
  }

  /**
   * uppdateByIncr supports updating a histogram with a non-negative
   * increment.
   * todo: private? / fold into record?
   * @param value
   * @param increment
   */
  updateByIncrement(value: number, increment: number) {
    if (value > this._max) {
      this._max = value;
    }
    if (value < this._min) {
      this._min = value;
    }

    // Note: Not checking for overflow here. TODO.
    this._count += increment;

    if (value === 0) {
      this._zeroCount += increment;
      return;
    }

    this._sum += value * increment;

    if (value > 0) {
      this._update(this._positive, value, increment);
    } else {
      this._update(this._negative, -value, increment);
    }
  }

  /**
   * Merge combines data from other into self
   * @param other
   */
  mergeFrom(_other: ExponentialHistogramAccumulation) {}

  // todo: rename?
  private _update(buckets: Buckets, value: number, increment: number) {
    let index = this._mapping.mapToIndex(value);
    let result = this._incrementIndexby(buckets, index, increment);
    if (result.success) {
      return;
    }

    this._downscale(this._changeScale(result.highLow!, this._maxSize));

    index = this._mapping.mapToIndex(value);

    result = this._incrementIndexby(buckets, index, increment);
    if (!result.success) {
      throw new Error('downscale logic error');
    }
  }

  private _incrementIndexby(
    buckets: Buckets,
    index: number,
    increment: number
  ): IncrementResult {
    if (increment === 0) {
      // Skipping a bunch of work for 0 increment.
      return {success: true};
    }
    if (buckets.length() === 0) {
      buckets.indexStart = index;
      buckets.indexEnd = buckets.indexStart;
      buckets.indexBase = buckets.indexStart;
    } else if (index < buckets.indexStart) {
      const span = buckets.indexEnd - index;
      if (span >= this._maxSize) {
        // rescale needed: mapped value to right
        return {
          success: false,
          highLow: {
            low: index,
            high: buckets.indexEnd,
          },
        };
      } else if (span >= buckets.backing.size()) {
        this._grow(buckets, span + 1);
      }
      buckets.indexStart = index;
    } else if (index > buckets.indexEnd) {
      const span = index - buckets.indexStart;
      if (span >= this._maxSize) {
        //rescale needed: mapped value to the left
        return {
          success: false,
          highLow: {
            low: buckets.indexStart,
            high: index,
          },
        };
      } else if (span >= buckets.backing.size()) {
        this._grow(buckets, span + 1);
      }
      buckets.indexEnd = index;
    }

    let bucketIndex = index - buckets.indexBase;
    if (bucketIndex < 0) {
      bucketIndex += buckets.backing.size();
    }
    buckets.incrementBucket(bucketIndex, increment);
    return {success: true};
  }

  private _grow(buckets: Buckets, needed: number) {
    const size = buckets.backing.size();
    const bias = buckets.indexBase - buckets.indexStart;
    const oldPositiveLimit = size - bias;
    let newSize = util.powTwoRoundedUp(needed);
    if (newSize > this._maxSize) {
      newSize = this._maxSize;
    }
    const newPositiveLimit = newSize - bias;
    buckets.backing.growTo(newSize, oldPositiveLimit, newPositiveLimit);
  }

  private _changeScale(hl: HighLow, size: number): number {
    let change = 0;
    while (hl.high - hl.low >= size) {
      hl.high >>= 1;
      hl.low >>= 1;
      change++;
    }
    return change;
  }

  private _downscale(change: number) {
    if (change === 0) {
      return;
    }
    if (change < 0) {
      // todo: do not throw
      throw new Error(`impossible change of scale: ${this.scale}`);
    }
    const newScale = this._mapping.scale() - change;

    this._positive.downscale(change);
    this._negative.downscale(change);

    if (newScale <= 0) {
      this._mapping = ExponentMapping.get(newScale);
    } else {
      this._mapping = LogarithmMapping.get(newScale);
    }
  }

  // todo: delete, for debugging
  printBuckets() {
    console.log('positive:');
    this._printBuckets(this._positive);
    console.log('negative:');
    this._printBuckets(this._negative);
  }

  // todo: delete, for debugging
  private _printBuckets(buckets: Buckets) {
    if (buckets.length() === 0) {
      console.log('[]');
      return;
    }
    let result = '[';
    for (let i = 0; i < buckets.length(); i++) {
      const index = buckets.offset() + i;
      const lower = this._mapping.lowerBoundary(index);
      const count = buckets.at(i);
      result += `${index}=${count}(${lower.toFixed(2)}),`;
    }
    result = result.replace(/,$/, ']');
    console.log(result);
  }
}

/**
 * Basic aggregator which observes events and counts them in pre-defined buckets
 * and provides the total sum and count of all observations.
 */
export class ExponentialHistogramAggregator
implements Aggregator<ExponentialHistogramAccumulation> {
  public kind: AggregatorKind.EXPONENTIAL_HISTOGRAM = AggregatorKind.EXPONENTIAL_HISTOGRAM;

  /**
   * @param _maxSize Maximum number of buckets for each of the positive and negative ranges, exclusive of the zero-bucket.
   * @param _recordMinMax If set to true, min and max will be recorded. Otherwise, min and max will not be recorded.
   */
  constructor(
    readonly _maxSize: number,
    private readonly _recordMinMax: boolean
  ) {}

  createAccumulation(startTime: HrTime) {
    return new ExponentialHistogramAccumulation(
      startTime,
      this._maxSize,
      this._recordMinMax
    );
  }

  /**
   * Return the result of the merge of two exponential histogram accumulations.
   */
  merge(
    previous: ExponentialHistogramAccumulation,
    _delta: ExponentialHistogramAccumulation
  ): ExponentialHistogramAccumulation {
    //todo: implement

    // const previousValue = previous.toPointValue();
    // const deltaValue = delta.toPointValue();

    return new ExponentialHistogramAccumulation(
      previous.startTime
    );
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   */
  diff(
    _previous: ExponentialHistogramAccumulation,
    current: ExponentialHistogramAccumulation
  ): ExponentialHistogramAccumulation {
    //todo: implement

    // const previousValue = previous.toPointValue();
    // const currentValue = current.toPointValue();

    return new ExponentialHistogramAccumulation(
      current.startTime,
    );
  }

  toMetricData(
    descriptor: InstrumentDescriptor,
    aggregationTemporality: AggregationTemporality,
    accumulationByAttributes: AccumulationRecord<ExponentialHistogramAccumulation>[],
    endTime: HrTime
  ): Maybe<ExponentialHistogramMetricData> {
    return {
      descriptor,
      aggregationTemporality,
      dataPointType: DataPointType.EXPONENTIAL_HISTOGRAM,
      dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
        const pointValue = accumulation.toPointValue();

        // determine if instrument allows negative values.
        const allowsNegativeValues =
          descriptor.type === InstrumentType.UP_DOWN_COUNTER ||
          descriptor.type === InstrumentType.OBSERVABLE_GAUGE ||
          descriptor.type === InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;

        return {
          attributes,
          startTime: accumulation.startTime,
          endTime,
          value: {
            min: pointValue.hasMinMax ? pointValue.min : undefined,
            max: pointValue.hasMinMax ? pointValue.max : undefined,
            sum: !allowsNegativeValues ? pointValue.sum : undefined,
            //todo: implement
            positive: {
              offset: 0,
              counts: [0],
            },
            negative: {
              offset: 0,
              counts: [0],
            },
            count: pointValue.count,
            scale: 0,
            zeroCount: 0,
          },
        };
      }),
    };
  }
}
