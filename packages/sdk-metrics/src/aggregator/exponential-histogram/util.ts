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
export function leftShift(value: number, numBits: number): number {
  return value * Math.pow(2, numBits);
}

export function rightShift(value: number, numBits: number): number {
  return Math.floor(value * Math.pow(2, -numBits));
}

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

// note: v is expected to be an int32
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
