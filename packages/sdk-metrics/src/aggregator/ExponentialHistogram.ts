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

/**
 * default max size for exponential histogram bucket counts in each of the positive
 * and negative ranges
 */
export const DEFAULT_MAX_SIZE = 160;

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

export class ExponentialHistogramAccumulation implements Accumulation {
  constructor(
    public startTime: HrTime,
    private _maxSize: number = DEFAULT_MAX_SIZE,
    private _recordMinMax = true,
  ) {}

  record(_value: number): void {
    //todo: implement
    this._recordMinMax;
    this._maxSize;
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
