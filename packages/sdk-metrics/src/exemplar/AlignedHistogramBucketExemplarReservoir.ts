/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, HrTime, Attributes } from '@opentelemetry/api';
import { FixedSizeExemplarReservoirBase } from './ExemplarReservoir';

/**
 * AlignedHistogramBucketExemplarReservoir takes the same boundaries
 * configuration of a Histogram. This algorithm keeps the last seen measurement
 * that falls within a histogram bucket.
 */
export class AlignedHistogramBucketExemplarReservoir extends FixedSizeExemplarReservoirBase {
  private _boundaries: number[];
  constructor(boundaries: number[]) {
    super(boundaries.length + 1);
    this._boundaries = boundaries;
  }

  private _findBucketIndex(
    value: number,
    _timestamp: HrTime,
    _attributes: Attributes,
    _ctx: Context
  ) {
    for (let i = 0; i < this._boundaries.length; i++) {
      if (value <= this._boundaries[i]) {
        return i;
      }
    }
    return this._boundaries.length;
  }

  offer(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ): void {
    const index = this._findBucketIndex(value, timestamp, attributes, ctx);
    this._reservoirStorage[index].offer(value, timestamp, attributes, ctx);
  }
}
