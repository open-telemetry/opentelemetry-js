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
import {Mapping, MappingError} from './types';

export class LogarithmMapping implements Mapping {
  static readonly MIN_SCALE = 1;
  static readonly MAX_SCALE = 20;
  private static _PREBUILT_MAPPINGS = new Map<number, LogarithmMapping>();

  /**
   * get creates or returns a memoized logarithm mapping function for
   * the given scale. used for scales > 0.
   * @param scale - a number greater than 0
   * @returns {LogarithmMapping}
   */
  static get(scale: number): LogarithmMapping {
    if (
      scale > LogarithmMapping.MAX_SCALE ||
      scale < LogarithmMapping.MIN_SCALE
    ) {
      throw new MappingError(
        `logarithm mapping requires scale in the range [${LogarithmMapping.MIN_SCALE}, ${LogarithmMapping.MAX_SCALE}]`
      );
    }

    let mapping = this._PREBUILT_MAPPINGS.get(scale);
    if (mapping) {
      return mapping;
    }

    mapping = new LogarithmMapping(scale);
    this._PREBUILT_MAPPINGS.set(scale, mapping);
    return mapping;
  }

  private readonly _scale: number;
  private readonly _scaleFactor: number;
  private readonly _inverseFactor: number;

  private constructor(scale: number) {
    this._scale = scale;
    this._scaleFactor = util.ldexp(Math.LOG2E, scale);
    this._inverseFactor = util.ldexp(Math.LN2, -scale);
  }

  mapToIndex(value: number): number {
    if (value <= ieee754.MIN_VALUE) {
      return this._minNormalLowerBoundaryIndex() - 1;
    }

    // exact power of two special case
    if (ieee754.getSignificand(value) === 0) {
      const exp = ieee754.getNormalBase2(value);
      return util.leftShift(exp, this._scale) - 1;
    }

    // non-power of two cases. use Math.floor to round the scaled logarithm
    const index = Math.floor(Math.log(value) * this._scaleFactor);
    const maxIndex = this._maxNormalLowerBoundaryIndex();
    if (index >= maxIndex) {
      return maxIndex;
    }

    return index;
  }

  lowerBoundary(index: number): number {
    const maxIndex = this._maxNormalLowerBoundaryIndex();
    if (index >= maxIndex) {
      if (index === maxIndex) {
        return (
          2 *
          Math.exp((index - util.leftShift(1, this._scale)) / this._scaleFactor)
        );
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
        return (
          Math.exp(
            (index + util.leftShift(1, this._scale)) / this._scaleFactor
          ) / 2
        );
      }
      throw new MappingError(
        `overflow: ${index} is < minimum lower boundary: ${minIndex}`
      );
    }

    return Math.exp(index * this._inverseFactor);
  }

  scale(): number {
    return this._scale;
  }

  private _minNormalLowerBoundaryIndex(): number {
    return util.leftShift(ieee754.MIN_NORMAL_EXPONENT, this._scale);
  }

  private _maxNormalLowerBoundaryIndex(): number {
    return util.leftShift(ieee754.MAX_NORMAL_EXPONENT + 1, this._scale) - 1;
  }
}
