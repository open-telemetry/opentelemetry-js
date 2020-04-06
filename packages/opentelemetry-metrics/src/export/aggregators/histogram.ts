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

import { Aggregator, Point } from '../types';
import { HrTime } from '@opentelemetry/api';
import { hrTime } from '@opentelemetry/core';

export type Checkpoint = {
  buckets: {
    boundaries: number[];
    counts: number[];
  };
  sum: number;
  count: number;
};

/** Basic aggregator which calculates a Sum from individual measurements. */
export class HistogramAggregator implements Aggregator {
  private _lastCheckpoint: Checkpoint;
  private _currentCheckpoint: Checkpoint;
  private _lastCheckpointTime: HrTime = [0, 0];
  private _boundaries: number[];

  constructor(boundaries: number[]) {
    if (boundaries === undefined || boundaries.length === 0) {
      throw new Error(`HistogramAggregator should be created with boundaries.`);
    }
    this._boundaries = boundaries.sort();
    this._lastCheckpoint = this._newEmptyCheckpoint();
    this._currentCheckpoint = this._newEmptyCheckpoint();
  }

  get sum() {
    return this._lastCheckpoint.sum;
  }

  get count() {
    return this._lastCheckpoint.count;
  }

  get checkpoint() {
    return this._lastCheckpoint;
  }

  update(value: number): void {
    this._currentCheckpoint.count += 1;
    this._currentCheckpoint.sum += value;

    for (let i = 0; i < this._boundaries.length; i++) {
      if (value < this._boundaries[i]) {
        this._currentCheckpoint.buckets.counts[i] += 1;
        return;
      }
    }

    // value is above all observed boundaries
    this._currentCheckpoint.buckets.counts[this._boundaries.length] += 1;
  }

  resetCheckpoint(): void {
    this._lastCheckpointTime = hrTime();
    this._lastCheckpoint = this._currentCheckpoint;
    this._currentCheckpoint = this._newEmptyCheckpoint();
  }

  toPoint(): Point {
    return {
      value: this._lastCheckpoint,
      timestamp: this._lastCheckpointTime,
    };
  }

  private _newEmptyCheckpoint(): Checkpoint {
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
