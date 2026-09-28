/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as ieee754 from '../../../src/aggregator/exponential-histogram/mapping/ieee754';
import * as assert from 'assert';

describe('ieee754 helpers', () => {
  describe('MIN_NORMAL_EXPONENT', () => {
    it('has expected value', () => {
      assert.strictEqual(ieee754.MIN_NORMAL_EXPONENT, -1022);
    });
  });

  describe('MAX_NORMAL_EXPONENT', () => {
    it('has expected value', () => {
      assert.strictEqual(ieee754.MAX_NORMAL_EXPONENT, 1023);
    });
  });

  describe('getNormalBase2', () => {
    it('extracts exponent', () => {
      assert.strictEqual(
        ieee754.getNormalBase2(Math.pow(2, 1023)),
        ieee754.MAX_NORMAL_EXPONENT
      );
      assert.strictEqual(ieee754.getNormalBase2(Math.pow(2, 1022)), 1022);
      assert.strictEqual(ieee754.getNormalBase2(18.9), 4);
      assert.strictEqual(ieee754.getNormalBase2(1), 0);
      assert.strictEqual(ieee754.getNormalBase2(Math.pow(2, -1021)), -1021);
      assert.strictEqual(ieee754.getNormalBase2(Math.pow(2, -1022)), -1022);

      // Subnormals below
      assert.strictEqual(ieee754.getNormalBase2(Math.pow(2, -1023)), -1023);
      assert.strictEqual(ieee754.getNormalBase2(Math.pow(2, -1024)), -1023);
      assert.strictEqual(ieee754.getNormalBase2(Math.pow(2, -1025)), -1023);
      assert.strictEqual(ieee754.getNormalBase2(Math.pow(2, -1074)), -1023);
    });
  });

  describe('isPowerOfTwo', () => {
    it('is true for exact powers of two', () => {
      assert.strictEqual(ieee754.isPowerOfTwo(1), true);
      assert.strictEqual(ieee754.isPowerOfTwo(2), true);
      assert.strictEqual(ieee754.isPowerOfTwo(0.5), true);
      assert.strictEqual(ieee754.isPowerOfTwo(Math.pow(2, 52)), true);
      assert.strictEqual(ieee754.isPowerOfTwo(Math.pow(2, -1022)), true);
    });

    it('is false for non-powers of two', () => {
      assert.strictEqual(ieee754.isPowerOfTwo(1.5), false);
      assert.strictEqual(ieee754.isPowerOfTwo(3), false);
      assert.strictEqual(ieee754.isPowerOfTwo(1 + Math.pow(2, -52)), false);
    });
  });
});
