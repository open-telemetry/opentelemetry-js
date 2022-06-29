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
  Histogram,
} from './types';
import { HistogramMetricData, DataPointType } from '../export/MetricData';
import { HrTime } from '@opentelemetry/api';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';
import { AggregationTemporality } from '../export/AggregationTemporality';

function createNewEmptyCheckpoint(boundaries: number[]): Histogram {
  const counts = boundaries.map(() => 0);
  counts.push(0);
  return {
    buckets: {
      boundaries,
      counts,
    },
    sum: 0,
    count: 0,
    hasMinMax: false,
    min: Infinity,
    max: -1
  };
}

export class HistogramAccumulation implements Accumulation {
  constructor(
    public startTime: HrTime,
    private readonly _boundaries: number[],
    private _recordMinMax = true,
    private _current: Histogram = createNewEmptyCheckpoint(_boundaries)
  ) {}

  record(value: number): void {
    this._current.count += 1;
    this._current.sum += value;

    if (this._recordMinMax) {
      this._current.min = Math.min(value, this._current.min);
      this._current.max = Math.max(value, this._current.max);
      this._current.hasMinMax = true;
    }

    for (let i = 0; i < this._boundaries.length; i++) {
      if (value < this._boundaries[i]) {
        this._current.buckets.counts[i] += 1;
        return;
      }
    }
    // value is above all observed boundaries
    this._current.buckets.counts[this._boundaries.length] += 1;
  }

  setStartTime(startTime: HrTime): void {
    this.startTime = startTime;
  }

  toPointValue(): Histogram {
    return this._current;
  }
}

/**
 * Basic aggregator which observes events and counts them in pre-defined buckets
 * and provides the total sum and count of all observations.
 */
export class HistogramAggregator implements Aggregator<HistogramAccumulation> {
  public kind: AggregatorKind.HISTOGRAM = AggregatorKind.HISTOGRAM;

  /**
   * @param _boundaries upper bounds of recorded values.
   * @param _recordMinMax If set to true, min and max will be recorded. Otherwise, min and max will not be recorded.
   */
  constructor(private readonly _boundaries: number[], private readonly _recordMinMax: boolean) {}

  createAccumulation(startTime: HrTime) {
    return new HistogramAccumulation(startTime, this._boundaries, this._recordMinMax);
  }

  /**
   * Return the result of the merge of two histogram accumulations. As long as one Aggregator
   * instance produces all Accumulations with constant boundaries we don't need to worry about
   * merging accumulations with different boundaries.
   */
  merge(previous: HistogramAccumulation, delta: HistogramAccumulation): HistogramAccumulation {
    const previousValue = previous.toPointValue();
    const deltaValue = delta.toPointValue();

    const previousCounts = previousValue.buckets.counts;
    const deltaCounts = deltaValue.buckets.counts;

    const mergedCounts = new Array(previousCounts.length);
    for (let idx = 0; idx < previousCounts.length; idx++) {
      mergedCounts[idx] = previousCounts[idx] + deltaCounts[idx];
    }

    let min = Infinity;
    let max = -1;

    if (this._recordMinMax) {
      if (previousValue.hasMinMax && deltaValue.hasMinMax) {
        min = Math.min(previousValue.min, deltaValue.min);
        max = Math.max(previousValue.max, deltaValue.max);
      } else if (previousValue.hasMinMax) {
        min = previousValue.min;
        max = previousValue.max;
      } else if (deltaValue.hasMinMax) {
        min = deltaValue.min;
        max = deltaValue.max;
      }
    }

    return new HistogramAccumulation(previous.startTime, previousValue.buckets.boundaries, this._recordMinMax, {
      buckets: {
        boundaries: previousValue.buckets.boundaries,
        counts: mergedCounts,
      },
      count: previousValue.count + deltaValue.count,
      sum: previousValue.sum + deltaValue.sum,
      hasMinMax: this._recordMinMax && (previousValue.hasMinMax || deltaValue.hasMinMax),
      min: min,
      max: max
    });
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   */
  diff(previous: HistogramAccumulation, current: HistogramAccumulation): HistogramAccumulation {
    const previousValue = previous.toPointValue();
    const currentValue = current.toPointValue();

    const previousCounts = previousValue.buckets.counts;
    const currentCounts = currentValue.buckets.counts;

    const diffedCounts = new Array(previousCounts.length);
    for (let idx = 0; idx < previousCounts.length; idx++) {
      diffedCounts[idx] = currentCounts[idx] - previousCounts[idx];
    }

    return new HistogramAccumulation(current.startTime, previousValue.buckets.boundaries, this._recordMinMax, {
      buckets: {
        boundaries: previousValue.buckets.boundaries,
        counts: diffedCounts,
      },
      count: currentValue.count - previousValue.count,
      sum: currentValue.sum - previousValue.sum,
      hasMinMax: false,
      min: Infinity,
      max: -1
    });
  }

  toMetricData(
    descriptor: InstrumentDescriptor,
    aggregationTemporality: AggregationTemporality,
    accumulationByAttributes: AccumulationRecord<HistogramAccumulation>[],
    endTime: HrTime): Maybe<HistogramMetricData> {
    return {
      descriptor,
      aggregationTemporality,
      dataPointType: DataPointType.HISTOGRAM,
      dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
        return {
          attributes,
          startTime: accumulation.startTime,
          endTime,
          value: accumulation.toPointValue(),
        };
      })
    };
  }
}
