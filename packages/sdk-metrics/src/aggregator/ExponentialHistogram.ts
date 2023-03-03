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
  ExponentialHistogram,
} from './types';
import {
  DataPointType,
  ExponentialHistogramMetricData,
} from '../export/MetricData';
import { diag, HrTime } from '@opentelemetry/api';
import { InstrumentDescriptor, InstrumentType } from '../InstrumentDescriptor';
import { Maybe } from '../utils';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { Buckets } from './exponential-histogram/Buckets';
import { getMapping } from './exponential-histogram/mapping/getMapping';
import { Mapping } from './exponential-histogram/mapping/types';
import { nextGreaterSquare } from './exponential-histogram/util';

/**
 * Internal value type for ExponentialHistogramAggregation.
 * Differs from the exported type as undefined sum/min/max complicate arithmetic
 * performed by this aggregation, but are required to be undefined in the exported types.
 */
interface InternalHistogram extends ExponentialHistogram {
  hasMinMax: boolean;
  min: number;
  max: number;
  sum: number;
}

// HighLow is a utility class used for computing a common scale for
// two exponential histogram accumulations
class HighLow {
  static combine(h1: HighLow, h2: HighLow): HighLow {
    return new HighLow(Math.min(h1.low, h2.low), Math.max(h1.high, h2.high));
  }
  constructor(public low: number, public high: number) {}
}

const MAX_SCALE = 20;
const DEFAULT_MAX_SIZE = 160;
const MIN_MAX_SIZE = 2;

export class ExponentialHistogramAccumulation implements Accumulation {
  constructor(
    public startTime: HrTime = startTime,
    private _maxSize = DEFAULT_MAX_SIZE,
    private _recordMinMax = true,
    private _sum = 0,
    private _count = 0,
    private _zeroCount = 0,
    private _min = Number.POSITIVE_INFINITY,
    private _max = Number.NEGATIVE_INFINITY,
    private _positive = new Buckets(),
    private _negative = new Buckets(),
    private _mapping: Mapping = getMapping(MAX_SCALE)
  ) {
    if (this._maxSize < MIN_MAX_SIZE) {
      diag.warn(`Exponential Histogram Max Size set to ${this._maxSize}, \
                changing to the minimum size of: ${MIN_MAX_SIZE}`);
      this._maxSize = MIN_MAX_SIZE;
    }
  }

  /**
   * record updates a histogram with a single count
   * @param {Number} value
   */
  record(value: number) {
    this.updateByIncrement(value, 1);
  }

  /**
   * Sets the start time for this accumulation
   * @param {HrTime} startTime
   */
  setStartTime(startTime: HrTime): void {
    this.startTime = startTime;
  }

  /**
   * Returns the datapoint representation of this accumulation
   * @param {HrTime} startTime
   */
  toPointValue(): InternalHistogram {
    return {
      hasMinMax: this._recordMinMax,
      min: this.min,
      max: this.max,
      sum: this.sum,
      positive: {
        offset: this.positive.offset,
        bucketCounts: this.positive.counts(),
      },
      negative: {
        offset: this.negative.offset,
        bucketCounts: this.negative.counts(),
      },
      count: this.count,
      scale: this.scale,
      zeroCount: this.zeroCount,
    };
  }

  /**
   * @returns {Number} The sum of values recorded by this accumulation
   */
  get sum(): number {
    return this._sum;
  }

  /**
   * @returns {Number} The minimum value recorded by this accumulation
   */
  get min(): number {
    return this._min;
  }

  /**
   * @returns {Number} The maximum value recorded by this accumulation
   */
  get max(): number {
    return this._max;
  }

  /**
   * @returns {Number} The count of values recorded by this accumulation
   */
  get count(): number {
    return this._count;
  }

  /**
   * @returns {Number} The number of 0 values recorded by this accumulation
   */
  get zeroCount(): number {
    return this._zeroCount;
  }

  /**
   * @returns {Number} The scale used by thie accumulation
   */
  get scale(): number {
    if (this._count === this._zeroCount) {
      // all zeros! scale doesn't matter, use zero
      return 0;
    }
    return this._mapping.scale;
  }

  /**
   * positive holds the postive values
   * @returns {Buckets}
   */
  get positive(): Buckets {
    return this._positive;
  }

  /**
   * negative holds the negative values by their absolute value
   * @returns {Buckets}
   */
  get negative(): Buckets {
    return this._negative;
  }

  /**
   * uppdateByIncr supports updating a histogram with a non-negative
   * increment.
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

    this._count += increment;

    if (value === 0) {
      this._zeroCount += increment;
      return;
    }

    this._sum += value * increment;

    if (value > 0) {
      this._updateBuckets(this._positive, value, increment);
    } else {
      this._updateBuckets(this._negative, -value, increment);
    }
  }

  /**
   * merge combines data from other into self
   * @param {ExponentialHistogramAccumulation} other
   */
  merge(other: ExponentialHistogramAccumulation) {
    if (this._count === 0) {
      this._min = other.min;
      this._max = other.max;
    } else if (other.count !== 0) {
      if (other.min < this.min) {
        this._min = other.min;
      }
      if (other.max > this.max) {
        this._max = other.max;
      }
    }

    this._sum += other.sum;
    this._count += other.count;
    this._zeroCount += other.zeroCount;

    const minScale = this._minScale(other);

    this._downscale(this.scale - minScale);

    this._mergeBuckets(this.positive, other, other.positive, minScale);
    this._mergeBuckets(this.negative, other, other.negative, minScale);
  }

  /**
   * diff substracts other from self
   * @param {ExponentialHistogramAccumulation} other
   */
  diff(other: ExponentialHistogramAccumulation) {
    this._min = Infinity;
    this._max = -Infinity;
    this._sum -= other.sum;
    this._count -= other.count;
    this._zeroCount -= other.zeroCount;

    const minScale = this._minScale(other);

    this._downscale(this.scale - minScale);

    this._diffBuckets(this.positive, other, other.positive, minScale);
    this._diffBuckets(this.negative, other, other.negative, minScale);
  }

  /**
   * clone returns a deep copy of self
   * @returns {ExponentialHistogramAccumulation}
   */
  clone(): ExponentialHistogramAccumulation {
    return new ExponentialHistogramAccumulation(
      this.startTime,
      this._maxSize,
      this._recordMinMax,
      this._sum,
      this._count,
      this._zeroCount,
      this._min,
      this._max,
      this.positive.clone(),
      this.negative.clone(),
      this._mapping
    );
  }

  /**
   * _updateBuckets maps the incoming value to a bucket index for the current
   * scale. If the bucket index is outside of the range of the backing array,
   * it will rescale the backing array and update the mapping for the new scale.
   */
  private _updateBuckets(buckets: Buckets, value: number, increment: number) {
    let index = this._mapping.mapToIndex(value);

    // rescale the mapping if needed
    let rescalingNeeded = false;
    let high = 0;
    let low = 0;

    if (buckets.length === 0) {
      buckets.indexStart = index;
      buckets.indexEnd = buckets.indexStart;
      buckets.indexBase = buckets.indexStart;
    } else if (
      index < buckets.indexStart &&
      buckets.indexEnd - index >= this._maxSize
    ) {
      rescalingNeeded = true;
      low = index;
      high = buckets.indexEnd;
    } else if (
      index > buckets.indexEnd &&
      index - buckets.indexStart >= this._maxSize
    ) {
      rescalingNeeded = true;
      low = buckets.indexStart;
      high = index;
    }

    // rescale and compute index at new scale
    if (rescalingNeeded) {
      const change = this._changeScale(high, low);
      this._downscale(change);
      index = this._mapping.mapToIndex(value);
    }

    this._incrementIndexBy(buckets, index, increment);
  }

  /**
   * _incrementIndexBy increments the count of the bucket specified by `index`.
   * If the index is outside of the range [buckets.indexStart, buckets.indexEnd]
   * the boundaries of the backing array will be adjusted and more buckets will
   * be added if needed.
   */
  private _incrementIndexBy(
    buckets: Buckets,
    index: number,
    increment: number
  ) {
    if (increment === 0) {
      // nothing to do for a zero increment, can happen during a merge operation
      return;
    }

    if (index < buckets.indexStart) {
      const span = buckets.indexEnd - index;
      if (span >= buckets.backing.length) {
        this._grow(buckets, span + 1);
      }
      buckets.indexStart = index;
    } else if (index > buckets.indexEnd) {
      const span = index - buckets.indexStart;
      if (span >= buckets.backing.length) {
        this._grow(buckets, span + 1);
      }
      buckets.indexEnd = index;
    }

    let bucketIndex = index - buckets.indexBase;
    if (bucketIndex < 0) {
      bucketIndex += buckets.backing.length;
    }
    buckets.incrementBucket(bucketIndex, increment);
  }

  /**
   * grow resizes the backing array by doubling in size up to maxSize.
   * This extends the array with a bunch of zeros and copies the
   * existing counts to the same position.
   */
  private _grow(buckets: Buckets, needed: number) {
    const size = buckets.backing.length;
    const bias = buckets.indexBase - buckets.indexStart;
    const oldPositiveLimit = size - bias;
    let newSize = nextGreaterSquare(needed);
    if (newSize > this._maxSize) {
      newSize = this._maxSize;
    }
    const newPositiveLimit = newSize - bias;
    buckets.backing.growTo(newSize, oldPositiveLimit, newPositiveLimit);
  }

  /**
   * _changeScale computes how much downscaling is needed by shifting the
   * high and low values until they are separated by no more than size.
   */
  private _changeScale(high: number, low: number): number {
    let change = 0;
    while (high - low >= this._maxSize) {
      high >>= 1;
      low >>= 1;
      change++;
    }
    return change;
  }

  /**
   * _downscale subtracts `change` from the current mapping scale.
   */
  private _downscale(change: number) {
    if (change === 0) {
      return;
    }
    if (change < 0) {
      // Note: this should be impossible. If we get here it's because
      // there is a bug in the implementation.
      throw new Error(`impossible change of scale: ${this.scale}`);
    }
    const newScale = this._mapping.scale - change;

    this._positive.downscale(change);
    this._negative.downscale(change);

    this._mapping = getMapping(newScale);
  }

  /**
   * _minScale is used by diff and merge to compute an ideal combined scale
   */
  private _minScale(other: ExponentialHistogramAccumulation): number {
    const minScale = Math.min(this.scale, other.scale);

    const highLowPos = HighLow.combine(
      this._highLowAtScale(this.positive, this.scale, minScale),
      this._highLowAtScale(other.positive, other.scale, minScale)
    );

    const highLowNeg = HighLow.combine(
      this._highLowAtScale(this.negative, this.scale, minScale),
      this._highLowAtScale(other.negative, other.scale, minScale)
    );

    return Math.min(
      minScale - this._changeScale(highLowPos.high, highLowPos.low),
      minScale - this._changeScale(highLowNeg.high, highLowNeg.low)
    );
  }

  /**
   * _highLowAtScale is used by diff and merge to compute an ideal combined scale.
   */
  private _highLowAtScale(
    buckets: Buckets,
    currentScale: number,
    newScale: number
  ): HighLow {
    if (buckets.length === 0) {
      return new HighLow(0, -1);
    }
    const shift = currentScale - newScale;
    return new HighLow(buckets.indexStart >> shift, buckets.indexEnd >> shift);
  }

  /**
   * _mergeBuckets translates index values from another histogram and
   * adds the values into the corresponding buckets of this histogram.
   */
  private _mergeBuckets(
    ours: Buckets,
    other: ExponentialHistogramAccumulation,
    theirs: Buckets,
    scale: number
  ) {
    const theirOffset = theirs.offset;
    const theirChange = other.scale - scale;

    for (let i = 0; i < theirs.length; i++) {
      this._incrementIndexBy(
        ours,
        (theirOffset + i) >> theirChange,
        theirs.at(i)
      );
    }
  }

  /**
   * _diffBuckets translates index values from another histogram and
   * subtracts the values in the corresponding buckets of this histogram.
   */
  private _diffBuckets(
    ours: Buckets,
    other: ExponentialHistogramAccumulation,
    theirs: Buckets,
    scale: number
  ) {
    const theirOffset = theirs.offset;
    const theirChange = other.scale - scale;

    for (let i = 0; i < theirs.length; i++) {
      const ourIndex = (theirOffset + i) >> theirChange;
      let bucketIndex = ourIndex - ours.indexBase;
      if (bucketIndex < 0) {
        bucketIndex += ours.backing.length;
      }
      ours.decrementBucket(bucketIndex, theirs.at(i));
    }

    ours.trim();
  }
}

/**
 * Aggregator for ExponentialHistogramAccumlations
 */
export class ExponentialHistogramAggregator
  implements Aggregator<ExponentialHistogramAccumulation>
{
  public kind: AggregatorKind.EXPONENTIAL_HISTOGRAM =
    AggregatorKind.EXPONENTIAL_HISTOGRAM;

  /**
   * @param _maxSize Maximum number of buckets for each of the positive
   *    and negative ranges, exclusive of the zero-bucket.
   * @param _recordMinMax If set to true, min and max will be recorded.
   *    Otherwise, min and max will not be recorded.
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
    delta: ExponentialHistogramAccumulation
  ): ExponentialHistogramAccumulation {
    const result = delta.clone();
    result.merge(previous);

    return result;
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   */
  diff(
    previous: ExponentialHistogramAccumulation,
    current: ExponentialHistogramAccumulation
  ): ExponentialHistogramAccumulation {
    const result = current.clone();
    result.diff(previous);

    return result;
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
            positive: {
              offset: pointValue.positive.offset,
              bucketCounts: pointValue.positive.bucketCounts,
            },
            negative: {
              offset: pointValue.negative.offset,
              bucketCounts: pointValue.negative.bucketCounts,
            },
            count: pointValue.count,
            scale: pointValue.scale,
            zeroCount: pointValue.zeroCount,
          },
        };
      }),
    };
  }
}
