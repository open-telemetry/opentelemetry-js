/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as assert from 'assert';
import { HistogramAggregator } from '../../../src/export/aggregators';

describe('HistogramAggregator', () => {
  describe('constructor()', () => {
    it('should construct a histogramAggregator', () => {
      assert.doesNotThrow(() => {
        new HistogramAggregator([1, 2]);
      });
    });

    it('should sort boundaries', () => {
      const aggregator = new HistogramAggregator([500, 300, 700]);
      assert.deepEqual(aggregator.checkpoint.buckets.boundaries, [
        300,
        500,
        700,
      ]);
    });

    it('should throw if no boundaries are defined', () => {
      // @ts-ignore
      assert.throws(() => new HistogramAggregator());
      assert.throws(() => new HistogramAggregator([]));
    });
  });

  describe('.update()', () => {
    it('should not update checkpoint', () => {
      const aggregator = new HistogramAggregator([100, 200]);
      aggregator.update(150);
      assert.equal(aggregator.checkpoint.count, 0);
      assert.equal(aggregator.checkpoint.sum, 0);
    });

    it('should update the second bucket', () => {
      const aggregator = new HistogramAggregator([100, 200]);
      aggregator.update(150);
      aggregator.resetCheckpoint();
      assert.equal(aggregator.checkpoint.count, 1);
      assert.equal(aggregator.checkpoint.sum, 150);
      assert.equal(aggregator.checkpoint.buckets.counts[0], 0);
      assert.equal(aggregator.checkpoint.buckets.counts[1], 1);
      assert.equal(aggregator.checkpoint.buckets.counts[2], 0);
    });

    it('should update the second bucket', () => {
      const aggregator = new HistogramAggregator([100, 200]);
      aggregator.update(50);
      aggregator.resetCheckpoint();
      assert.equal(aggregator.checkpoint.count, 1);
      assert.equal(aggregator.checkpoint.sum, 50);
      assert.equal(aggregator.checkpoint.buckets.counts[0], 1);
      assert.equal(aggregator.checkpoint.buckets.counts[1], 0);
      assert.equal(aggregator.checkpoint.buckets.counts[2], 0);
    });

    it('should update the third bucket since value is above all boundaries', () => {
      const aggregator = new HistogramAggregator([100, 200]);
      aggregator.update(250);
      aggregator.resetCheckpoint();
      assert.equal(aggregator.checkpoint.count, 1);
      assert.equal(aggregator.checkpoint.sum, 250);
      assert.equal(aggregator.checkpoint.buckets.counts[0], 0);
      assert.equal(aggregator.checkpoint.buckets.counts[1], 0);
      assert.equal(aggregator.checkpoint.buckets.counts[2], 1);
    });
  });

  describe('.count', () => {
    it('should return last checkpoint count', () => {
      const aggregator = new HistogramAggregator([100]);
      assert.equal(aggregator.count, aggregator.checkpoint.count);
      aggregator.update(10);
      aggregator.resetCheckpoint();
      assert.equal(aggregator.checkpoint.count, 1);
      assert.equal(aggregator.count, aggregator.checkpoint.count);
    });
  });

  describe('.sum', () => {
    it('should return last checkpoint sum', () => {
      const aggregator = new HistogramAggregator([100]);
      assert.equal(aggregator.sum, aggregator.checkpoint.sum);
      aggregator.update(10);
      aggregator.resetCheckpoint();
      assert.equal(aggregator.checkpoint.sum, 10);
      assert.deepEqual(aggregator.sum, aggregator.checkpoint.sum);
    });
  });

  describe('.resetCheckpoint()', () => {
    it('should create a empty checkoint by default', () => {
      const aggregator = new HistogramAggregator([100]);
      assert.deepEqual(aggregator.checkpoint.buckets.boundaries, [100]);
      assert(aggregator.checkpoint.buckets.counts.every(count => count === 0));
      // should contains one bucket for each boundary + one for values outside of the largest boundary
      assert.equal(aggregator.checkpoint.buckets.counts.length, 2);
      assert.deepEqual(aggregator.checkpoint.buckets.boundaries, [100]);
      assert.equal(aggregator.checkpoint.count, 0);
      assert.equal(aggregator.checkpoint.sum, 0);
    });

    it('should update checkpoint', () => {
      const aggregator = new HistogramAggregator([100]);
      aggregator.update(10);
      aggregator.resetCheckpoint();
      assert.equal(aggregator.checkpoint.count, 1);
      assert.equal(aggregator.checkpoint.sum, 10);
      assert.deepEqual(aggregator.checkpoint.buckets.boundaries, [100]);
      assert.equal(aggregator.checkpoint.buckets.counts.length, 2);
      assert.deepEqual(aggregator.checkpoint.buckets.counts, [1, 0]);
    });
  });

  describe('.toPoint()', () => {
    it('should return default checkpoint', () => {
      const aggregator = new HistogramAggregator([100]);
      assert.deepEqual(aggregator.toPoint().value, aggregator.checkpoint);
      assert.deepEqual(aggregator.toPoint().timestamp, [0, 0]);
    });

    it('should return last checkpoint if updated', () => {
      const aggregator = new HistogramAggregator([100]);
      aggregator.update(100);
      aggregator.resetCheckpoint();
      assert.deepEqual(aggregator.toPoint().value, aggregator.checkpoint);
      console.log(aggregator.toPoint().timestamp);
      assert(
        aggregator
          .toPoint()
          .timestamp.every(nbr => typeof nbr === 'number' && nbr !== 0)
      );
    });
  });
});
