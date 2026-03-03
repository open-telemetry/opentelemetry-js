/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as ieee754 from './ieee754';
import * as util from '../util';
import { Mapping, MappingError } from './types';

/**
 * LogarithmMapping implements exponential mapping functions for scale > 0.
 * For scales <= 0 the exponent mapping should be used.
 */
export class LogarithmMapping implements Mapping {
  private readonly _scale: number;
  private readonly _scaleFactor: number;
  private readonly _inverseFactor: number;

  constructor(scale: number) {
    this._scale = scale;
    this._scaleFactor = util.ldexp(Math.LOG2E, scale);
    this._inverseFactor = util.ldexp(Math.LN2, -scale);
  }

  /**
   * Maps positive floating point values to indexes corresponding to scale
   * @param value
   * @returns {number} index for provided value at the current scale
   */
  mapToIndex(value: number): number {
    if (value <= ieee754.MIN_VALUE) {
      return this._minNormalLowerBoundaryIndex() - 1;
    }

    // exact power of two special case
    if (ieee754.getSignificand(value) === 0) {
      const exp = ieee754.getNormalBase2(value);
      return (exp << this._scale) - 1;
    }

    // non-power of two cases. use Math.floor to round the scaled logarithm
    const index = Math.floor(Math.log(value) * this._scaleFactor);
    const maxIndex = this._maxNormalLowerBoundaryIndex();
    if (index >= maxIndex) {
      return maxIndex;
    }

    return index;
  }

  /**
   * Returns the lower bucket boundary for the given index for scale
   *
   * @param index
   * @returns {number}
   */
  lowerBoundary(index: number): number {
    const maxIndex = this._maxNormalLowerBoundaryIndex();
    if (index >= maxIndex) {
      if (index === maxIndex) {
        return 2 * Math.exp((index - (1 << this._scale)) / this._scaleFactor);
      }
      throw new MappingError(
        `overflow: ${index} is > maximum lower boundary: ${maxIndex}`
      );
    }

    const minIndex = this._minNormalLowerBoundaryIndex();
    if (index <= minIndex) {
      if (index === minIndex) {
        return ieee754.MIN_VALUE;
      } else if (index === minIndex - 1) {
        return Math.exp((index + (1 << this._scale)) / this._scaleFactor) / 2;
      }
      throw new MappingError(
        `overflow: ${index} is < minimum lower boundary: ${minIndex}`
      );
    }

    return Math.exp(index * this._inverseFactor);
  }

  /**
   * The scale used by this mapping
   * @returns {number}
   */
  get scale(): number {
    return this._scale;
  }

  private _minNormalLowerBoundaryIndex(): number {
    return ieee754.MIN_NORMAL_EXPONENT << this._scale;
  }

  private _maxNormalLowerBoundaryIndex(): number {
    return ((ieee754.MAX_NORMAL_EXPONENT + 1) << this._scale) - 1;
  }
}
