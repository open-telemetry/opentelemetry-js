/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, HrTime, Attributes } from '@opentelemetry/api';
import { FixedSizeExemplarReservoirBase } from './ExemplarReservoir';

/**
 * Fixed size reservoir that uses equivalent of naive reservoir sampling
 * algorithm to accept measurements.
 *
 */
export class SimpleFixedSizeExemplarReservoir extends FixedSizeExemplarReservoirBase {
  private _numMeasurementsSeen: number;
  constructor(size: number) {
    super(size);
    this._numMeasurementsSeen = 0;
  }

  private getRandomInt(min: number, max: number) {
    //[min, max)
    return Math.floor(Math.random() * (max - min) + min);
  }

  private _findBucketIndex(
    _value: number,
    _timestamp: HrTime,
    _attributes: Attributes,
    _ctx: Context
  ) {
    if (this._numMeasurementsSeen < this._size)
      return this._numMeasurementsSeen++;
    const index = this.getRandomInt(0, ++this._numMeasurementsSeen);
    return index < this._size ? index : -1;
  }

  offer(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ): void {
    const index = this._findBucketIndex(value, timestamp, attributes, ctx);
    if (index !== -1) {
      this._reservoirStorage[index].offer(value, timestamp, attributes, ctx);
    }
  }

  override reset() {
    this._numMeasurementsSeen = 0;
  }
}
