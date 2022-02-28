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
import { LastValueAccumulation, LastValueAggregator } from '../../src/aggregator';
import { MetricData, PointDataType } from '../../src/export/MetricData';
import { commonValues, defaultInstrumentDescriptor, sleep } from '../util';

describe('LastValueAggregator', () => {
  describe('createAccumulation', () => {
    it('no exceptions on createAccumulation', () => {
      const aggregator = new LastValueAggregator();
      const accumulation = aggregator.createAccumulation();
      assert(accumulation instanceof LastValueAccumulation);
    });
  });

  describe('merge', () => {
    it('no exceptions', () => {
      const aggregator = new LastValueAggregator();
      const prev = aggregator.createAccumulation();
      const delta = aggregator.createAccumulation();

      prev.record(2);
      delta.record(3);

      assert.deepStrictEqual(aggregator.merge(prev, delta), delta);
    });

    it('return the newly sampled accumulation', async () => {
      const aggregator = new LastValueAggregator();
      const accumulation1 = aggregator.createAccumulation();
      const accumulation2 = aggregator.createAccumulation();

      accumulation1.record(2);
      await sleep(1);
      accumulation2.record(3);
      // refresh the accumulation1
      await sleep(1);
      accumulation1.record(4);

      assert.deepStrictEqual(aggregator.merge(accumulation1, accumulation2), accumulation1);
      assert.deepStrictEqual(aggregator.merge(accumulation2, accumulation1), accumulation1);
    });
  });

  describe('diff', () => {
    it('no exceptions', () => {
      const aggregator = new LastValueAggregator();
      const prev = aggregator.createAccumulation();
      const curr = aggregator.createAccumulation();

      prev.record(2);
      curr.record(3);

      assert.deepStrictEqual(aggregator.diff(prev, curr), curr);
    });

    it('return the newly sampled accumulation', async () => {
      const aggregator = new LastValueAggregator();
      const accumulation1 = aggregator.createAccumulation();
      const accumulation2 = aggregator.createAccumulation();

      accumulation1.record(2);
      accumulation2.record(3);
      // refresh the accumulation1
      await sleep(1);
      accumulation1.record(4);

      assert.deepStrictEqual(aggregator.diff(accumulation1, accumulation2), accumulation1);
      assert.deepStrictEqual(aggregator.diff(accumulation2, accumulation1), accumulation1);
    });
  });

  describe('toMetricData', () => {
    it('transform without exception', () => {
      const aggregator = new LastValueAggregator();

      const accumulation = aggregator.createAccumulation();
      accumulation.record(1);
      accumulation.record(2);
      accumulation.record(1);
      accumulation.record(4);

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];

      const expected: MetricData = {
        instrumentDescriptor: defaultInstrumentDescriptor,
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            attributes: {},
            startTime,
            endTime,
            point: 4,
          },
        ],
      };
      assert.deepStrictEqual(aggregator.toMetricData(
        defaultInstrumentDescriptor,
        [[{}, accumulation]],
        startTime,
        endTime,
      ), expected);
    });
  });
});

describe('LastValueAccumulation', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const accumulation = new LastValueAccumulation();

      for (const value of commonValues) {
        accumulation.record(value);
      }
    });
  });
});
