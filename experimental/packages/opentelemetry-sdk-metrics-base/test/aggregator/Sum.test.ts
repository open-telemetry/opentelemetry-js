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

import { HrTime } from '@opentelemetry/api';
import * as assert from 'assert';
import { AggregationTemporality } from '../../src';
import { SumAccumulation, SumAggregator } from '../../src/aggregator';
import { MetricData, DataPointType } from '../../src/export/MetricData';
import { commonValues, defaultInstrumentDescriptor } from '../util';

describe('SumAggregator', () => {
  describe('createAccumulation', () => {
    it('no exceptions on createAccumulation', () => {
      const aggregator = new SumAggregator(true);
      const accumulation = aggregator.createAccumulation([0, 0]);
      assert(accumulation instanceof SumAccumulation);
    });
  });

  describe('merge', () => {
    it('no exceptions', () => {
      const aggregator = new SumAggregator(true);
      const prev = aggregator.createAccumulation([0, 0]);
      prev.record(1);
      prev.record(2);

      const delta = aggregator.createAccumulation([1, 1]);
      delta.record(3);
      delta.record(4);

      const expected = new SumAccumulation([0, 0], true, 1 + 2 + 3 + 4);
      assert.deepStrictEqual(aggregator.merge(prev, delta), expected);
    });
  });

  describe('diff', () => {
    it('non-monotonic', () => {
      const aggregator = new SumAggregator(false);
      const prev = aggregator.createAccumulation([0, 0]);
      prev.record(1);
      prev.record(2);

      const curr = aggregator.createAccumulation([1, 1]);
      // replay actions performed on prev
      curr.record(1);
      curr.record(2);
      // perform new actions
      curr.record(3);
      curr.record(4);

      const expected = new SumAccumulation([1, 1], false, 3 + 4);
      assert.deepStrictEqual(aggregator.diff(prev, curr), expected);
    });

    it('monotonic', () => {
      const aggregator = new SumAggregator(true);
      const prev = aggregator.createAccumulation([0, 0]);
      prev.record(10);

      // Create a new record that indicates a reset.
      const curr = aggregator.createAccumulation([1, 1]);
      curr.record(3);

      // Diff result detected reset.
      const expected = new SumAccumulation([1, 1], true, 3, true);
      assert.deepStrictEqual(aggregator.diff(prev, curr), expected);
    });
  });

  describe('toMetricData', () => {
    it('transform without exception', () => {
      const aggregator = new SumAggregator(true);

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];
      const accumulation = aggregator.createAccumulation(startTime);
      accumulation.record(1);
      accumulation.record(2);

      const expected: MetricData = {
        descriptor: defaultInstrumentDescriptor,
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.SINGULAR,
        dataPoints: [
          {
            attributes: {},
            startTime,
            endTime,
            value: 3,
          },
        ],
      };
      assert.deepStrictEqual(aggregator.toMetricData(
        defaultInstrumentDescriptor,
        AggregationTemporality.CUMULATIVE,
        [[{}, accumulation]],
        endTime,
      ), expected);
    });
  });
});

describe('SumAccumulation', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      for (const monotonic of [true, false]) {
        const accumulation = new SumAccumulation([0, 0], monotonic);

        for (const value of commonValues) {
          accumulation.record(value);
        }
      }
    });

    it('should ignore negative values on monotonic sum', () => {
      const accumulation = new SumAccumulation([0, 0], true);
      accumulation.record(1);
      accumulation.record(-1);
      assert.strictEqual(accumulation.toPointValue(), 1);
    });
  });

  describe('setStartTime', () => {
    it('should set start time', () => {
      const accumulation = new SumAccumulation([0, 0], true);
      accumulation.setStartTime([1, 1]);
      assert.deepStrictEqual(accumulation.startTime, [1, 1]);
    });
  });
});
