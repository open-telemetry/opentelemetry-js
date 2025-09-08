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

import { HrTime, ValueType } from '@opentelemetry/api';
import {
  AggregationTemporality,
  DataPointType,
  InstrumentType,
  MetricData,
} from '../../src';
import {
  ExponentialHistogramAccumulation,
  ExponentialHistogramAggregator,
} from '../../src/aggregator/ExponentialHistogram';
import { Buckets } from '../../src/aggregator/exponential-histogram/Buckets';
import { getMapping } from '../../src/aggregator/exponential-histogram/mapping/getMapping';
import { Mapping } from '../../src/aggregator/exponential-histogram/mapping/types';
import * as assert from 'assert';
import {
  assertInEpsilon,
  assertInDelta,
} from './exponential-histogram/helpers';
import { defaultInstrumentDescriptor } from '../util';

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

      assert.strictEqual(accumulation.positive.offset, -1);
      assert.strictEqual(accumulation.scale, 0);
      assert.deepStrictEqual(getCounts(accumulation.positive), [1, 1, 1]);
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
      accumulation.record(4);
      accumulation.record(1);
      accumulation.record(8);
      accumulation.record(0.5);

      assert.strictEqual(accumulation.positive.offset, -1);
      assert.strictEqual(accumulation.scale, -1);
      assert.deepStrictEqual(getCounts(accumulation.positive), [2, 3, 1]);
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

        assert.strictEqual(accumulation.scale, -1);
        assert.strictEqual(accumulation.positive.offset, -1);
        assert.strictEqual(accumulation.positive.length, 2);
        assert.strictEqual(accumulation.positive.at(0), 2);
        assert.strictEqual(accumulation.positive.at(1), 1);
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

        assert.strictEqual(accumulation.scale, -1);
        assert.strictEqual(accumulation.positive.offset, -1);
        assert.strictEqual(accumulation.positive.length, 2);
        assert.strictEqual(accumulation.positive.at(0), 1);
        assert.strictEqual(accumulation.positive.at(1), 2);
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

          assert.strictEqual(accumulation.scale, -1);
          assert.strictEqual(accumulation.positive.offset, -2);
          assert.strictEqual(accumulation.positive.length, 2);
          assert.strictEqual(accumulation.positive.at(0), 1);
          assert.strictEqual(accumulation.positive.at(1), 2);
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
                  maxSize
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

                assert.strictEqual(accumulation.scale, initScale);
                assert.strictEqual(accumulation.positive.offset, offset);

                accumulation.record(maxValue);
                sum += maxValue;

                // The zeroth bucket is not empty
                assert.notStrictEqual(accumulation.positive.at(0), 0);

                // The maximum-index is at or above the midpoint,
                // otherwise we downscaled too much.

                let maxFill = 0;
                let totalCount = 0;

                for (let i = 0; i < accumulation.positive.length; i++) {
                  totalCount += accumulation.positive.at(i);
                  if (accumulation.positive.at(i) !== 0) {
                    maxFill = 0;
                  }
                }
                assert.ok(maxFill >= maxSize / 2);

                // count is correct
                assert.ok(maxSize + 1 >= totalCount);
                assert.ok(maxSize + 1 >= accumulation.count);
                // sum is correct
                assert.ok(sum >= accumulation.sum);

                // the offset is correct at the computed scale
                mapper = getMapping(accumulation.scale);
                let index = mapper.mapToIndex(minValue);
                assert.strictEqual(accumulation.positive.offset, index);

                // the maximum range is correct at the computed scale
                index = mapper.mapToIndex(maxValue);
                assert.strictEqual(
                  accumulation.positive.offset +
                    accumulation.positive.length -
                    1,
                  index
                );
              }
            }
          }
        }
      });
    });

    it('ignores NaN', () => {
      const accumulation = new ExponentialHistogramAccumulation([0, 0], 1);

      accumulation.record(NaN);

      assert.strictEqual(accumulation.scale, 0);
      assert.strictEqual(accumulation.max, -Infinity);
      assert.strictEqual(accumulation.min, Infinity);
      assert.strictEqual(accumulation.sum, 0);
      assert.strictEqual(accumulation.count, 0);
      assert.deepStrictEqual(getCounts(accumulation.positive), []);
      assert.deepStrictEqual(getCounts(accumulation.negative), []);
    });
  });
  describe('merge', () => {
    it('handles simple (even) case', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for (let i = 0; i < 4; i++) {
        const v1 = 2 << i;
        const v2 = 1 / (1 << i);

        acc0.record(v1);
        acc1.record(v2);
        acc2.record(v1);
        acc2.record(v2);
      }

      assert.strictEqual(acc0.scale, 0);
      assert.strictEqual(acc1.scale, 0);
      assert.strictEqual(acc2.scale, -1);

      assert.strictEqual(acc0.positive.offset, 0);
      assert.strictEqual(acc1.positive.offset, -4);
      assert.strictEqual(acc2.positive.offset, -2);

      assert.deepStrictEqual(getCounts(acc0.positive), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive), [2, 2, 2, 2]);

      acc0.merge(acc1);

      assert.strictEqual(acc0.scale, -1);
      assert.strictEqual(acc2.scale, -1);

      assertHistogramsEqual(acc0, acc2);
    });

    it('handles simple (odd) case', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for (let i = 0; i < 4; i++) {
        const v1 = 2 << i;
        const v2 = 2 / (1 << i);

        acc0.record(v1);
        acc1.record(v2);
        acc2.record(v1);
        acc2.record(v2);
      }

      assert.strictEqual(acc0.count, 4);
      assert.strictEqual(acc1.count, 4);
      assert.strictEqual(acc2.count, 8);

      assert.strictEqual(acc0.scale, 0);
      assert.strictEqual(acc1.scale, 0);
      assert.strictEqual(acc2.scale, -1);

      assert.strictEqual(acc0.positive.offset, 0);
      assert.strictEqual(acc1.positive.offset, -3);
      assert.strictEqual(acc2.positive.offset, -2);

      assert.deepStrictEqual(getCounts(acc0.positive), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive), [1, 2, 3, 2]);

      acc0.merge(acc1);

      assert.strictEqual(acc0.scale, -1);
      assert.strictEqual(acc2.scale, -1);

      assertHistogramsEqual(acc0, acc2);
    });

    it('handles exhaustive test case', () => {
      const testMergeExhaustive = (
        a: number[],
        b: number[],
        size: number,
        incr: number
      ) => {
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
      };

      const factor = 1024.0;
      const count = 16;
      const means = [0, factor];
      const stddevs = [1, factor];
      const sizes = [2, 6, 8, 9, 16];
      const increments = [1, 0x100, 0x10000, 0x100000000];

      for (const mean of means) {
        for (const stddev of stddevs) {
          const values = Array.from(
            { length: count },
            () => mean + Math.random() * stddev
          );
          for (let part = 1; part < count; part++) {
            for (const size of sizes) {
              for (const incr of increments) {
                testMergeExhaustive(
                  values.slice(0, part),
                  values.slice(part, count),
                  size,
                  incr
                );
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

      for (let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        acc0.record(v1);
        acc1.record(v1);
        acc1.record(v1);
      }

      assert.strictEqual(acc0.scale, 0);
      assert.strictEqual(acc1.scale, 0);

      assert.strictEqual(acc0.positive.offset, 0);
      assert.strictEqual(acc1.positive.offset, 0);

      assert.deepStrictEqual(getCounts(acc0.positive), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive), [2, 2, 2, 2]);

      acc1.diff(acc0);

      assertHistogramsEqual(acc0, acc1);
    });

    it('trims trailing 0 buckets after diff', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for (let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        if (i % 2 === 0) {
          acc0.record(v1);
        }

        if (i % 2 === 1) {
          acc1.record(v1);
        }

        acc2.record(v1);
      }

      assert.strictEqual(acc0.scale, 0);
      assert.strictEqual(acc1.scale, 0);
      assert.strictEqual(acc2.scale, 0);

      assert.strictEqual(acc0.positive.offset, 0);
      assert.strictEqual(acc1.positive.offset, 1);
      assert.strictEqual(acc2.positive.offset, 0);

      assert.deepStrictEqual(getCounts(acc0.positive), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive), [1, 1, 1, 1]);

      acc2.diff(acc1);

      assertHistogramsEqual(acc0, acc2);
    });

    it('trims leading 0 buckets after diff', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for (let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        if (i % 2 === 1) {
          acc0.record(v1);
        }

        if (i % 2 === 0) {
          acc1.record(v1);
        }

        acc2.record(v1);
      }

      assert.strictEqual(acc0.scale, 0);
      assert.strictEqual(acc1.scale, 0);
      assert.strictEqual(acc2.scale, 0);

      assert.strictEqual(acc0.positive.offset, 1);
      assert.strictEqual(acc1.positive.offset, 0);
      assert.strictEqual(acc2.positive.offset, 0);

      assert.deepStrictEqual(getCounts(acc0.positive), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc1.positive), [1, 0, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive), [1, 1, 1, 1]);

      acc2.diff(acc1);
      assertHistogramsEqual(acc0, acc2);
    });

    it('handles all zero bucket case', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc2 = new ExponentialHistogramAccumulation([0, 0], 4);

      for (let i = 0; i < 4; i++) {
        const v1 = 2 << i;

        acc1.record(v1);
        acc2.record(v1);
      }

      assert.strictEqual(acc0.scale, 0);
      assert.strictEqual(acc1.scale, 0);
      assert.strictEqual(acc2.scale, 0);

      assert.strictEqual(acc0.positive.offset, 0);
      assert.strictEqual(acc1.positive.offset, 0);
      assert.strictEqual(acc2.positive.offset, 0);

      assert.deepStrictEqual(getCounts(acc0.positive), []);
      assert.deepStrictEqual(getCounts(acc1.positive), [1, 1, 1, 1]);
      assert.deepStrictEqual(getCounts(acc2.positive), [1, 1, 1, 1]);

      acc2.diff(acc1);
      assertHistogramsEqual(acc0, acc2);
    });
  });
  describe('clone()', () => {
    it('makes a deep copy', () => {
      const acc0 = new ExponentialHistogramAccumulation([0, 0], 4);
      const acc1 = new ExponentialHistogramAccumulation([0, 0], 4);

      for (let i = 0; i < 4; i++) {
        const v = 2 << i;
        acc0.record(v);
        acc1.record(v);
      }

      assertHistogramsEqual(acc0, acc1);

      const acc2 = acc0.clone();

      assertHistogramsEqual(acc0, acc2);
      assert.strictEqual(acc0.scale, acc2.scale);
      assert.deepStrictEqual(
        getCounts(acc0.positive),
        getCounts(acc2.positive)
      );

      acc2.record(2 << 5);

      // no longer equal
      assert.notStrictEqual(acc0.scale, acc2.scale);
      assert.notDeepStrictEqual(
        getCounts(acc0.positive),
        getCounts(acc2.positive)
      );

      // ensure acc0 wasn't mutated
      assertHistogramsEqual(acc0, acc1);
    });
  });

  describe('toPointValue()', () => {
    it('returns representation of histogram internals', () => {
      const acc = new ExponentialHistogramAccumulation([0, 0], 4);

      for (let i = 0; i < 4; i++) {
        acc.record(2 << i);
      }

      const pv = acc.toPointValue();

      assert.strictEqual(pv.scale, acc.scale);
      assert.strictEqual(pv.min, acc.min);
      assert.strictEqual(pv.max, acc.max);
      assert.strictEqual(pv.sum, acc.sum);
      assert.strictEqual(pv.count, acc.count);
      assert.strictEqual(pv.zeroCount, acc.zeroCount);
      assert.strictEqual(pv.positive.offset, acc.positive.offset);
      assert.deepStrictEqual(pv.positive.bucketCounts, acc.positive.counts());
      assert.strictEqual(pv.negative.offset, acc.negative.offset);
      assert.deepStrictEqual(pv.negative.bucketCounts, acc.negative.counts());
    });
  });

  describe('min max size', () => {
    it('auto-corrects to min max', () => {
      const acc: any = new ExponentialHistogramAccumulation([0, 0], 0);
      assert.strictEqual(acc['_maxSize'], 2);
    });
  });
});

describe('ExponentialHistogramAggregation', () => {
  describe('merge', () => {
    it('merges and does not mutate args', () => {
      const agg = new ExponentialHistogramAggregator(4, true);
      const acc0 = agg.createAccumulation([0, 0]);
      const acc1 = agg.createAccumulation([0, 0]);
      const acc2 = agg.createAccumulation([0, 0]);

      acc0.record(2 << 0);
      acc0.record(2 << 1);
      acc0.record(2 << 3);

      acc1.record(2 << 0);
      acc1.record(2 << 2);
      acc1.record(2 << 3);

      acc2.record(2 << 0);
      acc2.record(2 << 0);
      acc2.record(2 << 1);
      acc2.record(2 << 2);
      acc2.record(2 << 3);
      acc2.record(2 << 3);

      // snapshots before merging
      const acc0Snapshot = acc0.toPointValue();
      const acc1Snapshot = acc1.toPointValue();

      const result = agg.merge(acc0, acc1);

      // merge is as expected
      assertHistogramsEqual(result, acc2);

      // merged histos are not mutated
      assert.deepStrictEqual(acc0.toPointValue(), acc0Snapshot);
      assert.deepStrictEqual(acc1.toPointValue(), acc1Snapshot);
    });

    it("keeps the previous point's startTime", () => {
      const agg = new ExponentialHistogramAggregator(4, true);
      const acc0 = agg.createAccumulation([0, 0]);
      const acc1 = agg.createAccumulation([3, 0]);

      const result = agg.merge(acc0, acc1);
      assert.strictEqual(result.startTime, acc0.startTime);
    });
    it('handles zero-length buckets in source histogram', () => {
      // https://github.com/open-telemetry/opentelemetry-js/issues/4450
      const delta = new ExponentialHistogramAccumulation([0, 0], 160);
      delta.updateByIncrement(0.0, 2); // A histogram with zero count of two and empty buckets

      const previous = new ExponentialHistogramAccumulation([0, 0], 160);
      previous.updateByIncrement(0, 1);
      previous.updateByIncrement(0.000979, 41); //Bucket: (0.00097656, 0.0010198], Count: 41, Index: -160
      previous.updateByIncrement(0.001959, 17); //Bucket: (0.00195313, 0.0020396], Count: 17, Index: -144
      previous.updateByIncrement(0.002889, 1); //Bucket: (0.00288443, 0.00301213], Count: 1, Index: -135
      previous.updateByIncrement(0.003909, 1); //Bucket: (0.00390625, 0.00407919], Count: 1, Index: -128
      previous.updateByIncrement(0.004859, 2); //Bucket: (0.00485101, 0.00506578], Count: 2, Index: -123
      previous.updateByIncrement(0.008899, 1); //Bucket: (0.00889679, 0.00929068], Count: 1, Index: -109
      previous.updateByIncrement(0.018589, 1); //Bucket: (0.01858136, 0.01940403], Count: 1, Index: -92
      previous.updateByIncrement(0.020269, 2); //Bucket: (0.02026312, 0.02116024], Count: 2, Index: -90
      previous.updateByIncrement(0.021169, 3); //Bucket: (0.02116024, 0.02209709], Count: 3, Index: -89
      previous.updateByIncrement(0.023079, 2); //Bucket: (0.02307541, 0.02409704], Count: 2, Index: -87
      previous.updateByIncrement(0.025169, 2); //Bucket: (0.02516391, 0.02627801], Count: 2, Index: -85
      previous.updateByIncrement(0.026279, 1); //Bucket: (0.02627801, 0.02744144], Count: 1, Index: -84
      previous.updateByIncrement(0.029929, 2); //Bucket: (0.0299251, 0.03125], Count: 2, Index: -81
      previous.updateByIncrement(0.031259, 1); //Bucket: (0.03125, 0.03263356], Count: 1, Index: -80
      previous.updateByIncrement(0.032639, 1); //Bucket: (0.03263356, 0.03407837], Count: 1, Index: -79
      previous.updateByIncrement(0.037169, 1); //Bucket: (0.03716272, 0.03880806], Count: 1, Index: -76
      previous.updateByIncrement(0.038809, 1); //Bucket: (0.03880806, 0.04052624], Count: 1, Index: -75
      previous.updateByIncrement(0.042329, 1); //Bucket: (0.04232049, 0.04419417], Count: 1, Index: -73
      previous.updateByIncrement(0.044199, 1); //Bucket: (0.04419417, 0.04615082], Count: 1, Index: -72
      previous.updateByIncrement(0.048199, 1); //Bucket: (0.04819409, 0.05032782], Count: 1, Index: -70
      previous.updateByIncrement(0.065269, 1); //Bucket: (0.06526711, 0.06815673], Count: 1, Index: -63
      previous.updateByIncrement(0.092309, 1); //Bucket: (0.09230163, 0.09638818], Count: 1, Index: -55
      previous.updateByIncrement(0.100659, 1); //Bucket: (0.10065565, 0.10511205], Count: 1, Index: -53

      const result = delta.clone();
      result.merge(previous);

      assert.equal(result.count, delta.count + previous.count);
      assert.equal(result.count, bucketCounts(result));
      assert.equal(delta.count, bucketCounts(delta));
      assert.equal(previous.count, bucketCounts(previous));
      assert.equal(
        bucketCounts(result),
        bucketCounts(delta) + bucketCounts(previous)
      );
    });
  });

  describe('diff', () => {
    it('diffs and does not mutate args', () => {
      const agg = new ExponentialHistogramAggregator(4, true);
      const acc0 = agg.createAccumulation([0, 0]);
      const acc1 = agg.createAccumulation([0, 0]);
      const acc2 = agg.createAccumulation([0, 0]);

      acc0.record(2 << 0);
      acc0.record(2 << 1);
      acc0.record(2 << 3);

      acc1.record(2 << 0);
      acc1.record(2 << 0);
      acc1.record(2 << 1);
      acc1.record(2 << 2);
      acc1.record(2 << 3);
      acc1.record(2 << 3);

      acc2.record(2 << 0);
      acc2.record(2 << 2);
      acc2.record(2 << 3);

      // snapshots before diff
      const acc0Snapshot = acc0.toPointValue();
      const acc1Snapshot = acc1.toPointValue();

      const result = agg.diff(acc0, acc1);

      // diff as expected
      assertHistogramsEqual(result, acc2);

      // diffed histos are not mutated
      assert.deepStrictEqual(acc0.toPointValue(), acc0Snapshot);
      assert.deepStrictEqual(acc1.toPointValue(), acc1Snapshot);
    });
  });

  describe('toMetricData', () => {
    it('should transform to expected data with recordMinMax = true', () => {
      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];

      const agg = new ExponentialHistogramAggregator(4, true);
      const acc = agg.createAccumulation(startTime);

      acc.record(2);
      acc.record(-2);
      acc.record(4);
      acc.record(-4);

      const result = agg.toMetricData(
        defaultInstrumentDescriptor,
        AggregationTemporality.CUMULATIVE,
        [[{}, acc]],
        endTime
      );

      const expected: MetricData = {
        descriptor: defaultInstrumentDescriptor,
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.EXPONENTIAL_HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            startTime,
            endTime,
            value: {
              min: -4,
              max: 4,
              sum: 0,
              positive: {
                offset: 1,
                bucketCounts: [1, 0, 1],
              },
              negative: {
                offset: 1,
                bucketCounts: [1, 0, 1],
              },
              count: 4,
              scale: 1,
              zeroCount: 0,
            },
          },
        ],
      };

      assert.deepStrictEqual(result, expected);
    });

    it('should transform to expected data with recordMinMax = false', () => {
      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];

      const agg = new ExponentialHistogramAggregator(4, false);
      const acc = agg.createAccumulation(startTime);

      acc.record(2);
      acc.record(-2);
      acc.record(4);
      acc.record(-4);

      const result = agg.toMetricData(
        defaultInstrumentDescriptor,
        AggregationTemporality.CUMULATIVE,
        [[{}, acc]],
        endTime
      );

      const expected: MetricData = {
        descriptor: defaultInstrumentDescriptor,
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.EXPONENTIAL_HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            startTime,
            endTime,
            value: {
              min: undefined,
              max: undefined,
              sum: 0,
              positive: {
                offset: 1,
                bucketCounts: [1, 0, 1],
              },
              negative: {
                offset: 1,
                bucketCounts: [1, 0, 1],
              },
              count: 4,
              scale: 1,
              zeroCount: 0,
            },
          },
        ],
      };

      assert.deepStrictEqual(result, expected);
    });

    function testSum(instrumentType: InstrumentType, expectSum: boolean) {
      const agg = new ExponentialHistogramAggregator(4, true);

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];

      const acc = agg.createAccumulation(startTime);
      acc.record(0);
      acc.record(1);
      acc.record(4);

      const aggregatedData = agg.toMetricData(
        {
          name: 'default_metric',
          description: 'a simple instrument',
          type: instrumentType,
          unit: '1',
          valueType: ValueType.DOUBLE,
          advice: {},
        },
        AggregationTemporality.CUMULATIVE,
        [[{}, acc]],
        endTime
      );

      assert.notStrictEqual(aggregatedData, undefined);
      assert.strictEqual(
        aggregatedData?.dataPoints[0].value.sum,
        expectSum ? 5 : undefined
      );
    }

    describe('should have undefined sum when used with', () => {
      it('UpDownCounter', () => testSum(InstrumentType.UP_DOWN_COUNTER, false));
      it('ObservableUpDownCounter', () =>
        testSum(InstrumentType.OBSERVABLE_UP_DOWN_COUNTER, false));
      it('ObservableUpDownCounter', () =>
        testSum(InstrumentType.OBSERVABLE_GAUGE, false));
    });

    describe('should include sum with', () => {
      it('UpDownCounter', () => testSum(InstrumentType.COUNTER, true));
      it('ObservableUpDownCounter', () =>
        testSum(InstrumentType.HISTOGRAM, true));
      it('ObservableUpDownCounter', () =>
        testSum(InstrumentType.OBSERVABLE_COUNTER, true));
    });
  });
});

function getCounts(buckets: Buckets): Array<number> {
  const counts = new Array<number>(buckets.length);
  for (let i = 0; i < buckets.length; i++) {
    counts[i] = buckets.at(i);
  }
  return counts;
}

function centerValue(mapper: Mapping, x: number): number {
  const lower = mapper.lowerBoundary(x);
  const upper = mapper.lowerBoundary(x + 1);
  return (lower + upper) / 2;
}

function assertHistogramsEqual(
  actual: ExponentialHistogramAccumulation,
  expected: ExponentialHistogramAccumulation
) {
  const actualSum = actual.sum;
  const expectedSum = expected.sum;

  if (actualSum === 0 || expectedSum === 0) {
    assertInDelta(actualSum, expectedSum, 1e-6);
  } else {
    assertInEpsilon(actualSum, expectedSum, 1e-6);
  }

  assert.strictEqual(actual.count, expected.count);
  assert.strictEqual(actual.zeroCount, expected.zeroCount);
  assert.strictEqual(actual.scale, expected.scale);

  assert.strictEqual(
    bucketsToString(actual.positive),
    bucketsToString(expected.positive)
  );

  assert.strictEqual(
    bucketsToString(actual.negative),
    bucketsToString(expected.negative)
  );
}

function bucketsToString(buckets: Buckets): string {
  let str = `[@${buckets.offset}`;
  for (let i = 0; i < buckets.length; i++) {
    str += buckets.at(i).toString();
  }
  str += ']\n';
  return str;
}

function bucketCounts(histo: ExponentialHistogramAccumulation): number {
  // zero counts do not get a dedicated bucket, but they are part of the overall
  // histogram count
  return histo
    .toPointValue()
    .positive.bucketCounts.reduce(
      (total, current) => (total += current),
      histo.zeroCount
    );
}
