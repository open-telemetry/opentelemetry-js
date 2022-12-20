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

/**
 * Note: other languages provide this as a built in function. This is
 * a naive, but functionally correct implementation. Ultimately, this is
 * used to compute the lower bucket boundaries for the Exponent and
 * Logarithm mappings. This would not run in normal application code
 * using the exponential histogram.
 *
 * ldexp returns frac × 2**exp. With the following special cases:
 *   ldexp(±0, exp) = ±0
 *   ldexp(±Inf, exp) = ±Inf
 *   ldexp(NaN, exp) = NaN
 * @param frac
 * @param exp
 * @returns {number}
 */
export function ldexp(frac: number, exp: number): number {
  if (
    frac === 0 ||
    frac === Number.POSITIVE_INFINITY ||
    frac === Number.NEGATIVE_INFINITY ||
    Number.isNaN(frac)
  ) {
    return frac;
  }
  return frac * Math.pow(2, exp);
}

export function powTwoRoundedUp(v: number): number {
  // The following expression computes the least power-of-two
  // that is >= v.  There are a number of tricky ways to
  // do this, see https://stackoverflow.com/questions/466204/rounding-up-to-next-power-of-2
  v--;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  v |= v >> 16;
  v++;
  return v;
}
