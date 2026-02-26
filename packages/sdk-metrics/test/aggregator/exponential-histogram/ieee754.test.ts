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

  describe('getSignificand', () => {
    it('returns expected values', () => {
      // The number 1.5 has a single most-significant bit set, i.e., 1<<51.
      assert.strictEqual(ieee754.getSignificand(1.5), Math.pow(2, 51));
    });
  });
});
