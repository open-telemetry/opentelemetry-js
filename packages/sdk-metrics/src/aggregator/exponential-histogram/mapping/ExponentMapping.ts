/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as ieee754 from './ieee754';
import * as util from '../util';
import type { Mapping } from './types';
import { MappingError } from './types';

/**
 * ExponentMapping implements exponential mapping functions for
 * scales <=0. For scales > 0 LogarithmMapping should be used.
 */
export class ExponentMapping implements Mapping {
  private readonly _shift: number;

  constructor(scale: number) {
    this._shift = -scale;
  }

  /**
   * Maps positive floating point values to indexes corresponding to scale
   * @param value
   * @returns {number} index for provided value at the current scale
   */
  mapToIndex(value: number): number {
    if (value < ieee754.MIN_VALUE) {
      return this._minNormalLowerBoundaryIndex();
    }

    const exp = ieee754.getNormalBase2(value);

    // An exact power of two sits on a bucket boundary; correct by -1 so it
    // falls into the lower bucket.
    const correction = ieee754.isPowerOfTwo(value) ? -1 : 0;

    return (exp + correction) >> this._shift;
  }

  /**
   * Returns the lower bucket boundary for the given index for scale
   *
   * @param index
   * @returns {number}
   */
  lowerBoundary(index: number): number {
    const minIndex = this._minNormalLowerBoundaryIndex();
    if (index < minIndex) {
      throw new MappingError(
        `underflow: ${index} is < minimum lower boundary: ${minIndex}`
      );
    }
    const maxIndex = this._maxNormalLowerBoundaryIndex();
    if (index > maxIndex) {
      throw new MappingError(
        `overflow: ${index} is > maximum lower boundary: ${maxIndex}`
      );
    }

    return util.ldexp(1, index << this._shift);
  }

  /**
   * The scale used by this mapping
   * @returns {number}
   */
  get scale(): number {
    if (this._shift === 0) {
      return 0;
    }
    return -this._shift;
  }

  private _minNormalLowerBoundaryIndex(): number {
    let index = ieee754.MIN_NORMAL_EXPONENT >> this._shift;
    if (this._shift < 2) {
      index--;
    }

    return index;
  }

  private _maxNormalLowerBoundaryIndex(): number {
    return ieee754.MAX_NORMAL_EXPONENT >> this._shift;
  }
}
