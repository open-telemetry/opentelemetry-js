/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ExponentMapping } from '../../../src/aggregator/exponential-histogram/mapping/ExponentMapping';
import * as ieee754 from '../../../src/aggregator/exponential-histogram/mapping/ieee754';
import * as assert from 'assert';

const MIN_SCALE = -10;
const MAX_SCALE = 0;

describe('ExponentMapping', () => {
  it('maps expected values for scale 0', () => {
    const mapping = new ExponentMapping(0);
    assert.strictEqual(mapping.scale, 0);

    const expectedMappings = [
      // near +inf
      [Number.MAX_VALUE, ieee754.MAX_NORMAL_EXPONENT],
      [Number.MAX_VALUE, 1023],
      [Math.pow(2, 1023), 1022],
      [1.0625 * Math.pow(2, 1023), 1023],
      [Math.pow(2, 1022), 1021],
      [1.0625 * Math.pow(2, 1023), 1023],

      // near 0
      [Math.pow(2, -1022), -1023],
      [1.0625 * Math.pow(2, -1022), -1022],
      [Math.pow(2, -1021), -1022],
      [1.0625 * Math.pow(2, -1021), -1021],

      [Math.pow(2, -1022), ieee754.MIN_NORMAL_EXPONENT - 1],
      [Math.pow(2, -1021), ieee754.MIN_NORMAL_EXPONENT],
      [Number.MIN_VALUE, ieee754.MIN_NORMAL_EXPONENT - 1],

      // near 1
      [4, 1],
      [3, 1],
      [2, 0],
      [1.5, 0],
      [1, -1],
      [0.75, -1],
      [0.51, -1],
      [0.5, -2],
      [0.26, -2],
      [0.25, -3],
      [0.126, -3],
      [0.125, -4],
    ];

    expectedMappings.forEach(([value, expected]) => {
      const result = mapping.mapToIndex(value);
      assert.strictEqual(
        result,
        expected,
        `expected: ${value} to map to: ${expected}, got: ${result}`
      );
    });
  });

  it('maps expected values for min scale', () => {
    const mapping = new ExponentMapping(MIN_SCALE);
    assert.strictEqual(mapping.scale, MIN_SCALE);

    const expectedMappings = [
      [1.000001, 0],
      [1, -1],
      [Number.MAX_VALUE / 2, 0],
      [Number.MAX_VALUE, 0],
      [Number.MIN_VALUE, -1],
      [0.5, -1],
    ];

    expectedMappings.forEach(([value, expected]) => {
      const result = mapping.mapToIndex(value);
      assert.strictEqual(
        result,
        expected,
        `expected: ${value} to map to: ${expected}, got: ${result}`
      );
    });
  });

  it('maps expected values for scale -1', () => {
    const mapping = new ExponentMapping(-1);
    assert.strictEqual(mapping.scale, -1);

    const expectedMappings = [
      [17, 2],
      [16, 1],
      [15, 1],
      [9, 1],
      [8, 1],
      [5, 1],
      [4, 0],
      [3, 0],
      [2, 0],
      [1.5, 0],
      [1, -1],
      [0.75, -1],
      [0.5, -1],
      [0.25, -2],
      [0.2, -2],
      [0.13, -2],
      [0.125, -2],
      [0.1, -2],
      [0.0625, -3],
      [0.06, -3],
    ];

    expectedMappings.forEach(([value, expected]) => {
      const result = mapping.mapToIndex(value);
      assert.strictEqual(
        result,
        expected,
        `expected: ${value} to map to: ${expected}, got: ${result}`
      );
    });
  });

  it('maps expected values for scale -4', () => {
    const mapping = new ExponentMapping(-4);
    assert.strictEqual(mapping.scale, -4);

    const expectedMappings = [
      [0x1, -1],
      [0x10, 0],
      [0x100, 0],
      [0x1000, 0],
      [0x10000, 0], // Base == 2**16
      [0x100000, 1],
      [0x1000000, 1],
      [0x10000000, 1],
      [0x100000000, 1], // == 2**32
      [0x1000000000, 2],
      [0x10000000000, 2],
      [0x100000000000, 2],
      [0x1000000000000, 2], // 2**48
      [0x10000000000000, 3],
      [0x1000000000000000, 3],
      [0x10000000000000000, 3], // 2**64
      [0x100000000000000000, 4],
      [0x1000000000000000000, 4],
      [0x10000000000000000000, 4],
      [0x100000000000000000000, 4], // 2**80
      [0x1000000000000000000000, 5],

      [1 / 0x1, -1],
      [1 / 0x10, -1],
      [1 / 0x100, -1],
      [1 / 0x1000, -1],
      [1 / 0x10000, -2], // 2**-16
      [1 / 0x100000, -2],
      [1 / 0x1000000, -2],
      [1 / 0x10000000, -2],
      [1 / 0x100000000, -3], // 2**-32
      [1 / 0x1000000000, -3],
      [1 / 0x10000000000, -3],
      [1 / 0x100000000000, -3],
      [1 / 0x1000000000000, -4], // 2**-48
      [1 / 0x10000000000000, -4],
      [1 / 0x100000000000000, -4],
      [1 / 0x1000000000000000, -4],
      [1 / 0x10000000000000000, -5], // 2**-64
      [1 / 0x100000000000000000, -5],

      // Max values
      // below is equivalent to [0x1.FFFFFFFFFFFFFp1023, 63],
      [
        Array.from({ length: 13 }, (_, x) => 0xf * Math.pow(16, -x - 1)).reduce(
          (x, y) => x + y,
          1
        ) * Math.pow(2, 1023),
        63,
      ],
      [Math.pow(2, 1023), 63],
      [Math.pow(2, 1019), 63],
      [Math.pow(2, 1009), 63],
      [Math.pow(2, 1008), 62],
      [Math.pow(2, 1007), 62],
      [Math.pow(2, 1000), 62],
      [Math.pow(2, 993), 62],
      [Math.pow(2, 992), 61],
      [Math.pow(2, 991), 61],

      // Min and subnormal values
      [Math.pow(2, -1074), -64],
      [Math.pow(2, -1073), -64],
      [Math.pow(2, -1072), -64],
      [Math.pow(2, -1057), -64],
      [Math.pow(2, -1056), -64],
      [Math.pow(2, -1041), -64],
      [Math.pow(2, -1040), -64],
      [Math.pow(2, -1025), -64],
      [Math.pow(2, -1024), -64],
      [Math.pow(2, -1023), -64],
      [Math.pow(2, -1022), -64],
      [Math.pow(2, -1009), -64],
      [Math.pow(2, -1008), -64],
      [Math.pow(2, -1007), -63],
      [Math.pow(2, -993), -63],
      [Math.pow(2, -992), -63],
      [Math.pow(2, -991), -62],
      [Math.pow(2, -977), -62],
      [Math.pow(2, -976), -62],
      [Math.pow(2, -975), -61],
    ];

    expectedMappings.forEach(([value, expected]) => {
      const result = mapping.mapToIndex(value);
      assert.strictEqual(
        result,
        expected,
        `expected: ${value} to map to: ${expected}, got: ${result}`
      );
    });
  });

  it('handles max index for all scales', () => {
    for (let scale = MIN_SCALE; scale <= MAX_SCALE; scale++) {
      const mapping = new ExponentMapping(scale);
      const index = mapping.mapToIndex(Number.MAX_VALUE);
      const maxIndex = ((ieee754.MAX_NORMAL_EXPONENT + 1) >> -scale) - 1;
      assert.strictEqual(
        index,
        maxIndex,
        `expected index: ${index} and ${maxIndex} to be equal for scale: ${scale}`
      );

      const boundary = mapping.lowerBoundary(index);
      assert.strictEqual(boundary, roundedBoundary(scale, maxIndex));

      assert.throws(() => {
        // one larger will overflow
        mapping.lowerBoundary(index + 1);
      });
    }
  });

  it('handles min index for all scales', () => {
    for (let scale = MIN_SCALE; scale <= MAX_SCALE; scale++) {
      const mapping = new ExponentMapping(scale);
      const minIndex = mapping.mapToIndex(ieee754.MIN_VALUE);
      let expectedMinIndex = ieee754.MIN_NORMAL_EXPONENT >> -scale;
      if (ieee754.MIN_NORMAL_EXPONENT % (1 << -scale) === 0) {
        expectedMinIndex--;
      }
      assert.strictEqual(
        minIndex,
        expectedMinIndex,
        `expected expectedMinIndex: ${expectedMinIndex} and ${minIndex} to be equal for scale: ${scale}`
      );

      const boundary = mapping.lowerBoundary(minIndex);
      const expectedBoundary = roundedBoundary(scale, expectedMinIndex);
      assert.strictEqual(boundary, expectedBoundary);

      //one smaller will underflow
      assert.throws(() => {
        mapping.lowerBoundary(minIndex - 1);
      });

      // subnormals map to the min index
      [
        ieee754.MIN_VALUE / 2,
        ieee754.MIN_VALUE / 3,
        Math.pow(2, -1050),
        Math.pow(2, -1073),
        1.0625 * Math.pow(2, -1073),
        Math.pow(2, -1074),
      ].forEach(value => {
        assert.strictEqual(mapping.mapToIndex(value), expectedMinIndex);
      });
    }
  });
});

function roundedBoundary(scale: number, index: number): number {
  let result = Math.pow(2, index);
  for (let i = scale; i < 0; i++) {
    result = result * result;
  }
  return result;
}
