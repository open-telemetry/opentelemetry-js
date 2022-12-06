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

import { ExponentialHistogramAccumulation } from '../../src/aggregator/ExponentialHistogram';
import { Buckets } from '../../src/aggregator/exponential-histogram/Buckets';
import { Mapping } from '../../src/aggregator/exponential-histogram//mapping/types';
import { ExponentMapping } from '../../src/aggregator/exponential-histogram//mapping/ExponentMapping';
import { LogarithmMapping } from '../../src/aggregator/exponential-histogram/mapping/LogarithmMapping';
import * as assert from 'assert';
import { assertInEpsilon, assertInDelta } from './exponential-histogram/helpers';

describe('ExponentialHistogramAccumulation', () => {
  describe('record', () => {
    /**
     *  Tests insertion of [2, 4, 1].  The index of 2 (i.e., 0) becomes
     * `indexBase`, the 4 goes to its right and the 1 goes in the last
     * position of the backing array.  With 3 binary orders of magnitude
     * and MaxSize=4, this must finish with scale=0; with minimum value 1
     * this must finish with offset=-1 (all scales).
     */
    it('handles alternating growth: scenario 1', () => {
      const accumulation = new ExponentialHistogramAccumulation([0, 0], 4);
      accumulation.record(2);
      accumulation.record(4);
      accumulation.record(1);

      assert.strictEqual(accumulation.positive().offset(), -1);
      assert.strictEqual(accumulation.scale(), 0);
      assert.deepStrictEqual(getCounts(accumulation.positive()), [1, 1, 1]);
    });

    /**
     * Tests insertion of [2, 2, 4, 1, 8, 0.5].  The test proceeds as
     * above but then downscales once further to scale=-1, thus index -1
     * holds range [0.25, 1.0), index 0 holds range [1.0, 4), index 1
     * holds range [4, 16).
     */
    it('handles alternating growth: scenario 2', () => {
      const accumulation = new ExponentialHistogramAccumulation([0, 0], 4);
      accumulation.record(2);
      accumulation.record(2);
      accumulation.record(2);
      accumulation.record(1);
      accumulation.record(8);
      accumulation.record(0.5);

      assert.strictEqual(accumulation.positive().offset(), -1);
      assert.strictEqual(accumulation.scale(), -1);
      assert.deepStrictEqual(getCounts(accumulation.positive()), [2, 3, 1]);
    });

    it('handles permutations of [1/2, 1, 2] with maxSize: 2', () => {
      [
        [1, 0.5, 2],
        [1, 2, 0.5],
        [2, 0.5, 1],
        [2, 1, 0.5],
        [0.5, 1, 2],
        [0.5, 2, 1],
      ].forEach(row => {
        const accumulation = new ExponentialHistogramAccumulation([0, 0], 2);
        row.forEach(value => {
          accumulation.record(value);
        });

        assert.strictEqual(accumulation.scale(), -1);
        assert.strictEqual(accumulation.positive().offset(), -1);
        assert.strictEqual(accumulation.positive().length(), 2);
        assert.strictEqual(accumulation.positive().at(0), 2);
        assert.strictEqual(accumulation.positive().at(1), 1);
      });
    });

    it('handles permutations of [1, 2, 4] with maxSize: 2', () => {
      [
        [1, 2, 4],
        [1, 4, 2],
        [2, 4, 1],
        [2, 1, 4],
        [4, 1, 2],
        [4, 2, 1],
      ].forEach(row => {
        const accumulation = new ExponentialHistogramAccumulation([0, 0], 2);
        row.forEach(value => {
          accumulation.record(value);
        });

        assert.strictEqual(accumulation.scale(), -1);
        assert.strictEqual(accumulation.positive().offset(), -1);
        assert.strictEqual(accumulation.positive().length(), 2);
        assert.strictEqual(accumulation.positive().at(0), 1);
        assert.strictEqual(accumulation.positive().at(1), 2);
      });

      // Tests that every permutation of {1, 1/2, 1/4} with maxSize=2
      // results in the same scale=-1 histogram.
      it('handles permutations of [1, 1/2, 1/4] with maxSize: 2', () => {
        [
          [1, 0.5, 0.25],
          [1, 0.25, 0.5],
          [0.5, 0.25, 1],
          [0.5, 1, 0.25],
          [0.25, 1, 0.5],
          [0.25, 0.5, 1],
        ].forEach(row => {
          const accumulation = new ExponentialHistogramAccumulation([0, 0], 2);
          row.forEach(value => {
            accumulation.record(value);
          });

          assert.strictEqual(accumulation.scale(), -1);
          assert.strictEqual(accumulation.positive().offset(), -2);
          assert.strictEqual(accumulation.positive().length(), 2);
          assert.strictEqual(accumulation.positive().at(0), 1);
          assert.strictEqual(accumulation.positive().at(1), 2);
        });
      });

      // Tests a variety of ascending sequences, calculated using known
      // index ranges.  For example, with maxSize=3, using scale=0 and
      // offset -5, add a sequence of numbers. Because the numbers have
      // known range, we know the expected scale.
      it('handles ascending sequences', () => {
        for (const maxSize of [3, 4, 6, 9]) {
          for (let offset = -5; offset <= 5; offset++) {
            for (const initScale of [0, 4]) {
              for (let step = maxSize; step < 4 * maxSize; step++) {
                const accumulation = new ExponentialHistogramAccumulation(
                  [0, 0],
                  maxSize,
                );
                let mapper = getMapping(initScale);

                const minValue = centerValue(mapper, offset);
                const maxValue = centerValue(mapper, offset + step);
                let sum = 0.0;

                for (let i = 0; i < maxSize; i++) {
                  const value = centerValue(mapper, offset + i);
                  accumulation.record(value);
                  sum += value;
                }

                assert.strictEqual(accumulation.scale(), initScale);
                assert.strictEqual(accumulation.positive().offset(), offset);

                accumulation.record(maxValue);
                sum += maxValue;

                // The zeroth bucket is not empty
                assert.notStrictEqual(accumulation.positive().at(0), 0);

                // The maximum-index is at or above the midpoint,
                // otherwise we downscaled too much.

                let maxFill = 0;
                let totalCount = 0;

                for (let i = 0; i < accumulation.positive().length(); i++) {
                  totalCount += accumulation.positive().at(i);
                  if (accumulation.positive().at(i) !== 0) {
                    maxFill = 0;
                  }
                }
                assert.ok(maxFill >= maxSize / 2);

                // count is correct
                assert.ok(maxSize + 1 >= totalCount);
                assert.ok(maxSize + 1 >= accumulation.count());
                // sum is correct
                assert.ok(sum >= accumulation.sum());

                // the offset is correct at the computed scale
                mapper = getMapping(accumulation.scale());
                let index = mapper.mapToIndex(minValue);
                assert.strictEqual(accumulation.positive().offset(), index);

                // the maximum range is correct at the computed scale
                index = mapper.mapToIndex(maxValue);
                assert.strictEqual(
                  accumulation.positive().offset() +
                    accumulation.positive().length() -
                    1,
                  index
                );
              }
            }
          }
        }
      });
    });
  });
  describe('merge', () => {
    it('handles simple (even) case', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for(let i = 0; i < 4; i++) {
        const v1 = 2 << i;
        const v2 = 1 / (1 << i);

        acc0.record(v1);
        acc1.record(v2);
        acc2.record(v1);
        acc2.record(v2);
      }

      assert.strictEqual(acc0.scale(), 0);
      assert.strictEqual(acc1.scale(), 0);
      assert.strictEqual(acc2.scale(), -1);

      assert.strictEqual(acc0.positive().offset(), 0);
      assert.strictEqual(acc1.positive().offset(), -4);
      assert.strictEqual(acc2.positive().offset(), -2);

      assert.deepStrictEqual(getCounts(acc0.positive()), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive()), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive()), [2, 2, 2, 2]);

      acc0.merge(acc1);

      assert.strictEqual(acc0.scale(), -1);
      assert.strictEqual(acc2.scale(), -1);

      assertHistogramsEqual(acc0, acc2);
    });

    it('handles simple (odd) case', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for(let i = 0; i < 4; i++) {
        const v1 = 2 << i;
        const v2 = 2 / (1 << i);

        acc0.record(v1);
        acc1.record(v2);
        acc2.record(v1);
        acc2.record(v2);
      }

      assert.strictEqual(acc0.count(), 4);
      assert.strictEqual(acc1.count(), 4);
      assert.strictEqual(acc2.count(), 8);

      assert.strictEqual(acc0.scale(), 0);
      assert.strictEqual(acc1.scale(), 0);
      assert.strictEqual(acc2.scale(), -1);

      assert.strictEqual(acc0.positive().offset(), 0);
      assert.strictEqual(acc1.positive().offset(), -3);
      assert.strictEqual(acc2.positive().offset(), -2);

      assert.deepStrictEqual(getCounts(acc0.positive()), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive()), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive()), [1, 2, 3, 2]);

      acc0.merge(acc1);

      assert.strictEqual(acc0.scale(), -1);
      assert.strictEqual(acc2.scale(), -1);

      assertHistogramsEqual(acc0, acc2);
    });

    it('handles exhaustive test case', () => {
      const testMergeExhaustive =  (a: number[], b: number[], size: number, incr: number) => {
        const aHist = new ExponentialHistogramAccumulation([0, 0], size);
        const bHist = new ExponentialHistogramAccumulation([0, 0], size);
        const cHist = new ExponentialHistogramAccumulation([0, 0], size);

        a.forEach(av => {
          aHist.updateByIncrement(av, incr);
          cHist.updateByIncrement(av, incr);
        });
        b.forEach(bv => {
          bHist.updateByIncrement(bv, incr);
          cHist.updateByIncrement(bv, incr);
        });

        aHist.merge(bHist);

        assertHistogramsEqual(aHist, cHist);
      }

      const factor = 1024.0;
      const count = 16;
      const means = [0, factor];
      const stddevs = [1, factor];
      const sizes = [2, 6, 8, 9, 16];
      const increments = [1, 0x100, 0x10000, 0x100000000];

      for(let mean of means) {
        for(let stddev of stddevs) {
          const values = Array.from({length: count}, () => mean + Math.random() * stddev);
          for(let part = 1; part < count; part++) {
            for(let size of sizes) {
              for (let incr of increments) {
                testMergeExhaustive(values.slice(0, part), values.slice(part, count), size, incr);
              }
            }
          }
        }
      }
    });
  });
  describe('diff', () => {
    it('handles simple case', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);

      for(let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        acc0.record(v1);
        acc1.record(v1);
        acc1.record(v1);
      }

      assert.strictEqual(acc0.scale(), 0);
      assert.strictEqual(acc1.scale(), 0);

      assert.strictEqual(acc0.positive().offset(), 0);
      assert.strictEqual(acc1.positive().offset(), 0);

      assert.deepStrictEqual(getCounts(acc0.positive()), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive()), [2, 2, 2, 2]);

      acc1.diff(acc0);

      assertHistogramsEqual(acc0, acc1);
    });

    it('trims trailing 0 buckets after diff', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for(let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        if( i % 2 == 0) {
          acc0.record(v1);
        }

        if( i % 2 == 1 ) {
          acc1.record(v1);
        }

        acc2.record(v1);
      }

      assert.strictEqual(acc0.scale(), 0);
      assert.strictEqual(acc1.scale(), 0);
      assert.strictEqual(acc2.scale(), 0);

      assert.strictEqual(acc0.positive().offset(), 0);
      assert.strictEqual(acc1.positive().offset(), 1);
      assert.strictEqual(acc2.positive().offset(), 0);

      assert.deepStrictEqual(getCounts(acc0.positive()), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive()), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive()), [1, 1, 1, 1]);

      acc2.diff(acc1);

      assertHistogramsEqual(acc0, acc2);
    });

    it('trims leading 0 buckets after diff', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for(let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        if( i % 2 == 1 ) {
          acc0.record(v1);
        }

        if( i % 2 == 0) {
          acc1.record(v1);
        }

        acc2.record(v1);
      }

      assert.strictEqual(acc0.scale(), 0);
      assert.strictEqual(acc1.scale(), 0);
      assert.strictEqual(acc2.scale(), 0);

      assert.strictEqual(acc0.positive().offset(), 1);
      assert.strictEqual(acc1.positive().offset(), 0);
      assert.strictEqual(acc2.positive().offset(), 0);

      assert.deepStrictEqual(getCounts(acc0.positive()), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive()), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive()), [1, 1, 1, 1]);

      acc2.diff(acc1);
      assertHistogramsEqual(acc0, acc2);
    });

    it('handles all zero bucket case', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for(let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        acc1.record(v1);
        acc2.record(v1);
      }

      assert.strictEqual(acc0.scale(), 0);
      assert.strictEqual(acc1.scale(), 0);
      assert.strictEqual(acc2.scale(), 0);

      assert.strictEqual(acc0.positive().offset(), 0);
      assert.strictEqual(acc1.positive().offset(), 0);
      assert.strictEqual(acc2.positive().offset(), 0);

      assert.deepStrictEqual(getCounts(acc0.positive()), []);
      assert.deepStrictEqual(getCounts(acc1.positive()), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive()), [1, 1, 1, 1]);

      acc2.diff(acc1);
      assertHistogramsEqual(acc0, acc2);
    });
  });
});

function getCounts(buckets: Buckets): Array<number> {
  const counts = new Array<number>(buckets.length());
  for (let i = 0; i < buckets.length(); i++) {
    counts[i] = buckets.at(i);
  }
  return counts;
}

function centerValue(mapper: Mapping, x: number): number {
  const lower = mapper.lowerBoundary(x);
  const upper = mapper.lowerBoundary(x + 1);
  return (lower + upper) / 2;
}

function getMapping(scale: number): Mapping {
  if (scale <= 0) {
    return ExponentMapping.get(scale);
  } else {
    return LogarithmMapping.get(scale);
  }
}

function assertHistogramsEqual(
  actual: ExponentialHistogramAccumulation,
  expected: ExponentialHistogramAccumulation,
) {
  const actualSum = actual.sum();
  const expectedSum = expected.sum();

  if(actualSum === 0 || expectedSum === 0) {
    assertInDelta(actualSum, expectedSum, 1e-6);
  } else {
    assertInEpsilon(actualSum, expectedSum, 1e-6);
  }

  assert.strictEqual(actual.count(), expected.count());
  assert.strictEqual(actual.zeroCount(), expected.zeroCount());
  assert.strictEqual(actual.scale(), expected.scale());

  assert.strictEqual(
    bucketsToString(actual.positive()),
    bucketsToString(expected.positive())
  );

  assert.strictEqual(
    bucketsToString(actual.negative()),
    bucketsToString(expected.negative())
  );
}

function bucketsToString(buckets: Buckets): string {
  let str = `[@${buckets.offset()}`;
  for(let i = 0; i < buckets.length(); i++) {
    str += buckets.at(i).toString();
  }
  str += ']\n';
  return str;
}
