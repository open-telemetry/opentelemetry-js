/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { LogarithmMapping } from '../../../src/aggregator/exponential-histogram/mapping/LogarithmMapping';
import * as ieee754 from '../../../src/aggregator/exponential-histogram/mapping/ieee754';
import * as assert from 'assert';
import { assertInEpsilon } from './helpers';

const MIN_SCALE = 1;
const MAX_SCALE = 20;

describe('LogarithmMapping', () => {
  it('maps values for scale 1', () => {
    const mapping = new LogarithmMapping(1);
    assert.strictEqual(mapping.scale, 1);

    const expectedMappings = [
      [15, 7],
      [9, 6],
      [7, 5],
      [5, 4],
      [3, 3],
      [2.5, 2],
      [1.5, 1],
      [1.2, 0],
      [1, -1],
      [0.75, -1],
      [0.55, -2],
      [0.45, -3],
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

  it('computes boundary', () => {
    [1, 2, 3, 4, 10, 15].forEach(scale => {
      const mapping = new LogarithmMapping(scale);
      [-100, -10, -1, 0, 1, 10, 100].forEach(index => {
        const boundary = mapping.lowerBoundary(index);
        const mappedIndex = mapping.mapToIndex(boundary);

        assert.ok(index - 1 <= mappedIndex);
        assert.ok(index >= mappedIndex);
        assertInEpsilon(roundedBoundary(scale, index), boundary, 1e-9);
      });
    });
  });

  it('handles max index for each scale', () => {
    for (let scale = MIN_SCALE; scale <= MAX_SCALE; scale++) {
      const mapping = new LogarithmMapping(scale);
      const index = mapping.mapToIndex(Number.MAX_VALUE);

      // the max index is one less than the first index that
      // overflows Number.MAX_VALUE
      const maxIndex = ((ieee754.MAX_NORMAL_EXPONENT + 1) << scale) - 1;

      assert.strictEqual(index, maxIndex);

      const boundary = mapping.lowerBoundary(index);
      const base = mapping.lowerBoundary(1);

      assert.ok(
        boundary < Number.MAX_VALUE,
        `expected boundary: ${boundary} to be < max value: ${Number.MAX_VALUE}`
      );

      assertInEpsilon(
        base - 1,
        (Number.MAX_VALUE - boundary) / boundary,
        10e-6
      );
    }
  });

  it('handles min index for each scale', () => {
    for (let scale = MIN_SCALE; scale <= MAX_SCALE; scale++) {
      const mapping = new LogarithmMapping(scale);
      const minIndex = mapping.mapToIndex(ieee754.MIN_VALUE);

      const expectedMinIndex = (ieee754.MIN_NORMAL_EXPONENT << scale) - 1;
      assert.strictEqual(minIndex, expectedMinIndex);

      const expectedBoundary = roundedBoundary(scale, expectedMinIndex);
      assert.ok(expectedBoundary < ieee754.MIN_VALUE);

      const expectedUpperBoundary = roundedBoundary(
        scale,
        expectedMinIndex + 1
      );
      assert.strictEqual(ieee754.MIN_VALUE, expectedUpperBoundary);

      const mappedLowerBoundary = mapping.lowerBoundary(minIndex + 1);
      assertInEpsilon(ieee754.MIN_VALUE, mappedLowerBoundary, 1e-6);

      // subnormals map to the min index
      [
        ieee754.MIN_VALUE / 2,
        ieee754.MIN_VALUE / 3,
        ieee754.MIN_VALUE / 100,
        Math.pow(2, -1050),
        Math.pow(2, -1073),
        1.0625 * Math.pow(2, -1073),
        Math.pow(2, -1074),
      ].forEach(value => {
        const result = mapping.mapToIndex(value);
        assert.strictEqual(result, expectedMinIndex);
      });

      const mappedMinLower = mapping.lowerBoundary(minIndex);

      assertInEpsilon(expectedBoundary, mappedMinLower, 1e-6);

      // one smaller will underflow
      assert.throws(() => {
        mapping.lowerBoundary(minIndex - 1);
      });
    }
  });

  it('maps max float to max index for each scale', () => {
    for (let scale = MIN_SCALE; scale <= MAX_SCALE; scale++) {
      const mapping = new LogarithmMapping(scale);
      const index = mapping.mapToIndex(Number.MAX_VALUE);
      const maxIndex = ((ieee754.MAX_NORMAL_EXPONENT + 1) << scale) - 1;
      assert.strictEqual(maxIndex, index);

      const boundary = mapping.lowerBoundary(index);
      const base = mapping.lowerBoundary(1);

      assert.ok(boundary < Number.MAX_VALUE);
      assertInEpsilon(base - 1, (Number.MAX_VALUE - boundary) / boundary, 1e-6);

      //one larger will overflow
      assert.throws(() => {
        mapping.lowerBoundary(index + 1);
      });
    }
  });
});

function roundedBoundary(scale: number, index: number): number {
  while (scale > 0) {
    if (index < -1022) {
      index /= 2;
      scale--;
    } else {
      break;
    }
  }

  let result = Math.pow(2, index);
  for (let i = scale; i > 0; i--) {
    result = Math.sqrt(result);
  }

  return result;
}
