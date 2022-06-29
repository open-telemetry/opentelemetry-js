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
import { LastValueAccumulation, LastValueAggregator } from '../../src/aggregator';
import { MetricData, DataPointType } from '../../src/export/MetricData';
import { commonValues, defaultInstrumentDescriptor, sleep } from '../util';

describe('LastValueAggregator', () => {
  describe('createAccumulation', () => {
    it('no exceptions on createAccumulation', () => {
      const aggregator = new LastValueAggregator();
      const accumulation = aggregator.createAccumulation([0, 0]);
      assert(accumulation instanceof LastValueAccumulation);
    });
  });

  describe('merge', () => {
    it('no exceptions', () => {
      const aggregator = new LastValueAggregator();
      const prev = aggregator.createAccumulation([0, 0]);
      const delta = aggregator.createAccumulation([1, 1]);

      prev.record(2);
      delta.record(3);

      const expected = new LastValueAccumulation([0, 0], 3, delta.sampleTime);

      assert.deepStrictEqual(aggregator.merge(prev, delta), expected);
    });

    it('return the newly sampled accumulation', async () => {
      const aggregator = new LastValueAggregator();
      const accumulation1 = aggregator.createAccumulation([0, 0]);
      const accumulation2 = aggregator.createAccumulation([1, 1]);

      accumulation1.record(2);
      await sleep(1);
      accumulation2.record(3);
      // refresh the accumulation1
      await sleep(1);
      accumulation1.record(4);

      assert.deepStrictEqual(
        aggregator.merge(accumulation1, accumulation2),
        new LastValueAccumulation(accumulation1.startTime, 4, accumulation1.sampleTime));
      assert.deepStrictEqual(
        aggregator.merge(accumulation2, accumulation1),
        new LastValueAccumulation(accumulation2.startTime, 4, accumulation1.sampleTime));
    });
  });

  describe('diff', () => {
    it('no exceptions', () => {
      const aggregator = new LastValueAggregator();
      const prev = aggregator.createAccumulation([0, 0]);
      const curr = aggregator.createAccumulation([1, 1]);

      prev.record(2);
      curr.record(3);

      const expected = new LastValueAccumulation([1, 1], 3, curr.sampleTime);

      assert.deepStrictEqual(aggregator.diff(prev, curr), expected);
    });

    it('return the newly sampled accumulation', async () => {
      const aggregator = new LastValueAggregator();
      const accumulation1 = aggregator.createAccumulation([0, 0]);
      const accumulation2 = aggregator.createAccumulation([1, 1]);

      accumulation1.record(2);
      accumulation2.record(3);
      // refresh the accumulation1
      await sleep(1);
      accumulation1.record(4);

      assert.deepStrictEqual(
        aggregator.diff(accumulation1, accumulation2),
        new LastValueAccumulation(accumulation2.startTime, 4, accumulation1.sampleTime));
      assert.deepStrictEqual(
        aggregator.diff(accumulation2, accumulation1),
        new LastValueAccumulation(accumulation1.startTime, 4, accumulation1.sampleTime));
    });
  });

  describe('toMetricData', () => {
    it('transform without exception', () => {
      const aggregator = new LastValueAggregator();

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];
      const accumulation = aggregator.createAccumulation(startTime);
      accumulation.record(1);
      accumulation.record(2);
      accumulation.record(1);
      accumulation.record(4);

      const expected: MetricData = {
        descriptor: defaultInstrumentDescriptor,
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.SINGULAR,
        dataPoints: [
          {
            attributes: {},
            startTime,
            endTime,
            value: 4,
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

describe('LastValueAccumulation', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const accumulation = new LastValueAccumulation([0, 0]);

      for (const value of commonValues) {
        accumulation.record(value);
      }
    });
  });

  describe('setStartTime', () => {
    it('should set start time', () => {
      const accumulation = new LastValueAccumulation([0, 0]);
      accumulation.setStartTime([1, 1]);
      assert.deepStrictEqual(accumulation.startTime, [1, 1]);
    });
  });
});
