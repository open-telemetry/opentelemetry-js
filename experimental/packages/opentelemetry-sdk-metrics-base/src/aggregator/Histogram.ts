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
import { HistogramMetricData, PointDataType } from '../export/MetricData';
import { Resource } from '@opentelemetry/resources';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { HrTime } from '@opentelemetry/api';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';

function createNewEmptyCheckpoint(boundaries: number[]): Histogram {
  return {
    buckets: {
      boundaries,
      counts: boundaries.map(() => 0).concat([0]),
    },
    sum: 0,
    count: 0,
  };
}

export class HistogramAccumulation implements Accumulation {
  constructor(
    private readonly _boundaries: number[],
    private _current: Histogram = createNewEmptyCheckpoint(_boundaries)
  ) {}

  record(value: number): void {
    this._current.count += 1;
    this._current.sum += value;

    for (let i = 0; i < this._boundaries.length; i++) {
      if (value < this._boundaries[i]) {
        this._current.buckets.counts[i] += 1;
        return;
      }
    }
    // value is above all observed boundaries
    this._current.buckets.counts[this._boundaries.length] += 1;
  }

  toPoint(): Histogram {
    return this._current;
  }
}

/**
 * Basic aggregator which observes events and counts them in pre-defined buckets
 * and provides the total sum and count of all observations.
 */
export class HistogramAggregator implements Aggregator<HistogramAccumulation> {
  public kind: AggregatorKind.HISTOGRAM = AggregatorKind.HISTOGRAM;
  private readonly _boundaries: number[];

  constructor(boundaries: number[]) {
    if (boundaries === undefined || boundaries.length === 0) {
      throw new Error('HistogramAggregator should be created with boundaries.');
    }
    // we need to an ordered set to be able to correctly compute count for each
    // boundary since we'll iterate on each in order.
    this._boundaries = boundaries.sort((a, b) => a - b);
  }

  createAccumulation() {
    return new HistogramAccumulation(this._boundaries);
  }

  /**
   * Return the result of the merge of two histogram accumulations. As long as one Aggregator
   * instance produces all Accumulations with constant boundaries we don't need to worry about
   * merging accumulations with different boundaries.
   */
  merge(previous: HistogramAccumulation, delta: HistogramAccumulation): HistogramAccumulation {
    const previousPoint = previous.toPoint();
    const deltaPoint = delta.toPoint();

    const previousCounts = previousPoint.buckets.counts;
    const deltaCounts = deltaPoint.buckets.counts;

    const mergedCounts = new Array(previousCounts.length);
    for (let idx = 0; idx < previousCounts.length; idx++) {
      mergedCounts[idx] = previousCounts[idx] + deltaCounts[idx];
    }

    return new HistogramAccumulation(previousPoint.buckets.boundaries, {
      buckets: {
        boundaries: previousPoint.buckets.boundaries,
        counts: mergedCounts,
      },
      count: previousPoint.count + deltaPoint.count,
      sum: previousPoint.sum + deltaPoint.sum,
    });
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   */
  diff(previous: HistogramAccumulation, current: HistogramAccumulation): HistogramAccumulation {
    const previousPoint = previous.toPoint();
    const currentPoint = current.toPoint();

    const previousCounts = previousPoint.buckets.counts;
    const currentCounts = currentPoint.buckets.counts;

    const diffedCounts = new Array(previousCounts.length);
    for (let idx = 0; idx < previousCounts.length; idx++) {
      diffedCounts[idx] = currentCounts[idx] - previousCounts[idx];
    }

    return new HistogramAccumulation(previousPoint.buckets.boundaries, {
      buckets: {
        boundaries: previousPoint.buckets.boundaries,
        counts: diffedCounts,
      },
      count: currentPoint.count - previousPoint.count,
      sum: currentPoint.sum - previousPoint.sum,
    });
  }

  toMetricData(
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    metricDescriptor: InstrumentDescriptor,
    accumulationByAttributes: AccumulationRecord<HistogramAccumulation>[],
    temporality: AggregationTemporality,
    sdkStartTime: HrTime,
    lastCollectionTime: HrTime,
    collectionTime: HrTime): Maybe<HistogramMetricData> {
    return {
      resource,
      instrumentationLibrary,
      instrumentDescriptor: metricDescriptor,
      pointDataType: PointDataType.HISTOGRAM,
      pointData: accumulationByAttributes.map(([attributes, accumulation]) => {
        return {
          attributes,
          startTime: temporality === AggregationTemporality.CUMULATIVE ? sdkStartTime : lastCollectionTime,
          endTime: collectionTime,
          point: accumulation.toPoint(),
        }
      })
    }
  }
}
