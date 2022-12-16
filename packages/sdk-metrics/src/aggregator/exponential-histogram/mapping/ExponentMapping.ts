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
import * as ieee754 from './ieee754';
import * as util from '../util';
import { Mapping, MappingError } from './types';

/**
 * ExponentMapping implements a exponential mapping functions for
 * for scales <=0. For scales > 0 LogarithmMapping should be used.
 */
export class ExponentMapping implements Mapping {
  static readonly MIN_SCALE = -10;
  static readonly MAX_SCALE = 0;
  private static readonly _PREBUILT_MAPPINGS = [
    new ExponentMapping(10),
    new ExponentMapping(9),
    new ExponentMapping(8),
    new ExponentMapping(7),
    new ExponentMapping(6),
    new ExponentMapping(5),
    new ExponentMapping(4),
    new ExponentMapping(3),
    new ExponentMapping(2),
    new ExponentMapping(1),
    new ExponentMapping(0),
  ];

  /**
   * Returns the pre-built mapping for the given scale
   * @param scale An integer >= -10 and <= 0
   * @returns {ExponentMapping}
   */
  public static get(scale: number) {
    if (scale > ExponentMapping.MAX_SCALE) {
      throw new MappingError(
        `exponent mapping requires scale <= ${ExponentMapping.MAX_SCALE}`
      );
    }
    if (scale < ExponentMapping.MIN_SCALE) {
      throw new MappingError(
        `exponent mapping requires a scale > ${ExponentMapping.MIN_SCALE}`
      );
    }

    return ExponentMapping._PREBUILT_MAPPINGS[
      scale - ExponentMapping.MIN_SCALE
    ];
  }

  private constructor(private readonly _shift: number) {}

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

    // In case the value is an exact power of two, compute a
    // correction of -1:
    const correction = util.rightShift(
      ieee754.getSignificand(value) - 1,
      ieee754.SIGNIFICAND_WIDTH
    );

    return util.rightShift(exp + correction, this._shift);
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

    return util.ldexp(1, util.leftShift(index, this._shift));
  }

  /**
   * The scale used by this mapping
   * @returns {number}
   */
  scale(): number {
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
