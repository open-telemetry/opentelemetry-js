/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { Aggregator, Point, Histogram, AggregatorType } from '../types';
import { hrTime } from '@opentelemetry/core';
import { HrTime } from '@opentelemetry/api';

/**
 * Basic aggregator which observes events and counts them in pre-defined buckets
 * and provides the total sum and count of all observations.
 */
export class HistogramAggregator implements Aggregator {
  public type = AggregatorType.HISTOGRAM;
  private _histogram: Histogram;
  private readonly _boundaries: number[];
  private _lastUpdate: HrTime = hrTime();

  constructor(boundaries: number[]) {
    if (boundaries === undefined || boundaries.length === 0) {
      throw new Error('HistogramAggregator should be created with boundaries.');
    }
    // we need to an ordered set to be able to correctly compute count for each
    // boundary since we'll iterate on each in order.
    this._boundaries = boundaries.sort();
    this._histogram = this._getEmptyHistogram();
  }

  update(value: number): void {
    this._histogram.count += 1;
    this._lastUpdate = hrTime();
    this._histogram.sum += value;

    for (let i = 0; i < this._boundaries.length; i++) {
      if (value < this._boundaries[i]) {
        this._histogram.buckets.counts[i] += 1;
        return;
      }
    }

    // value is above all observed boundaries
    this._histogram.buckets.counts[this._boundaries.length] += 1;
  }

  reset(): void {
    this._histogram = this._getEmptyHistogram();
  }

  toPoint(): Point {
    return {
      value: this._histogram,
      timestamp: this._lastUpdate,
    };
  }

  private _getEmptyHistogram(): Histogram {
    return {
      buckets: {
        boundaries: this._boundaries,
        counts: this._boundaries.map(() => 0).concat([0]),
      },
      sum: 0,
      count: 0,
    };
  }
}
