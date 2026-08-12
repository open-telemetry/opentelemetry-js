/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The functions and constants in this file allow us to interact
 * with the internal representation of an IEEE 64-bit floating point
 * number. We need to work with all 64-bits, thus, care needs to be
 * taken when working with Javascript's bitwise operators (<<, >>, &,
 * |, etc) as they truncate operands to 32-bits. In order to work around
 * this we work with the 64-bits as two 32-bit halves and perform bitwise
 * operations on each half independently.
 */

/**
 * EXPONENT_MASK is set to 1 for the hi 32-bits of an IEEE 754
 * floating point exponent: 0x7ff00000.
 */
const EXPONENT_MASK = 0x7ff00000;

/**
 * SIGNIFICAND_MASK is the mask for the significand portion of the hi 32-bits
 * of an IEEE 754 double-precision floating-point value: 0xfffff
 */
const SIGNIFICAND_MASK = 0xfffff;

/**
 * EXPONENT_BIAS is the exponent bias specified for encoding
 * the IEEE 754 double-precision floating point exponent: 1023
 */
const EXPONENT_BIAS = 1023;

/**
 * MIN_NORMAL_EXPONENT is the minimum exponent of a normalized
 * floating point: -1022.
 */
export const MIN_NORMAL_EXPONENT = -EXPONENT_BIAS + 1;

/**
 * MAX_NORMAL_EXPONENT is the maximum exponent of a normalized
 * floating point: 1023.
 */
export const MAX_NORMAL_EXPONENT = EXPONENT_BIAS;

/**
 * MIN_VALUE is the smallest normal number
 */
export const MIN_VALUE = Math.pow(2, -1022);

// A single DataView, allocated once and reused. Sharing the buffer is safe
// because every read below is synchronous.
const dv = new DataView(new ArrayBuffer(8));

/**
 * floatBits writes value into the shared buffer and returns its two 32-bit
 * halves.
 * @param {number} value - the floating point number to read
 * @returns {{hi: number, lo: number}} the high and low 32-bit halves
 */
function floatBits(value: number): { hi: number; lo: number } {
  dv.setFloat64(0, value);
  return { hi: dv.getUint32(0), lo: dv.getUint32(4) };
}

/**
 * getNormalBase2 extracts the normalized base-2 fractional exponent.
 * This returns k for the equation f x 2**k where f is
 * in the range [1, 2).  Note that this function is not called for
 * subnormal numbers.
 * @param {number} value - the value to determine normalized base-2 fractional
 *    exponent for
 * @returns {number} the normalized base-2 exponent
 */
export function getNormalBase2(value: number): number {
  const { hi } = floatBits(value);
  return ((hi & EXPONENT_MASK) >> 20) - EXPONENT_BIAS;
}

/**
 * isPowerOfTwo reports whether value is an exact power of two, e.g. its 52-bit
 * significand is all zeros.
 * @param {number} value - the floating point number to test
 * @returns {boolean} true if value is an exact power of two
 */
export function isPowerOfTwo(value: number): boolean {
  const { hi, lo } = floatBits(value);
  return (hi & SIGNIFICAND_MASK) === 0 && lo === 0;
}
