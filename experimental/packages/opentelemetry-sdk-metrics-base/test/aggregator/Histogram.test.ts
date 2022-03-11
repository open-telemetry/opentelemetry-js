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
import { HistogramAccumulation, HistogramAggregator } from '../../src/aggregator';
import { MetricData, PointDataType } from '../../src/export/MetricData';
import { commonValues, defaultInstrumentDescriptor } from '../util';

describe('HistogramAggregator', () => {
  describe('createAccumulation', () => {
    it('no exceptions on createAccumulation', () => {
      const aggregator = new HistogramAggregator([1, 10, 100]);
      const accumulation = aggregator.createAccumulation();
      assert(accumulation instanceof HistogramAccumulation);
    });
  });

  describe('merge', () => {
    it('no exceptions', () => {
      const aggregator = new HistogramAggregator([1, 10, 100]);
      const prev = aggregator.createAccumulation();
      prev.record(0);
      prev.record(1);

      const delta = aggregator.createAccumulation();
      delta.record(2);
      delta.record(11);

      const expected = aggregator.createAccumulation();
      // replay actions on prev
      expected.record(0);
      expected.record(1);
      // replay actions on delta
      expected.record(2);
      expected.record(11);

      assert.deepStrictEqual(aggregator.merge(prev, delta), expected);
    });
  });

  describe('diff', () => {
    it('no exceptions', () => {
      const aggregator = new HistogramAggregator([1, 10, 100]);
      const prev = aggregator.createAccumulation();
      prev.record(0);
      prev.record(1);

      const curr = aggregator.createAccumulation();
      // replay actions on prev
      curr.record(0);
      curr.record(1);
      // perform new actions
      curr.record(2);
      curr.record(11);

      const expected = new HistogramAccumulation([1, 10, 100], {
        buckets: {
          boundaries: [1, 10, 100],
          counts: [0, 1, 1, 0],
        },
        count: 2,
        sum: 13,
      });

      assert.deepStrictEqual(aggregator.diff(prev, curr), expected);
    });
  });

  describe('toMetricData', () => {
    it('transform without exception', () => {
      const aggregator = new HistogramAggregator([1, 10, 100]);

      const accumulation = aggregator.createAccumulation();
      accumulation.record(0);
      accumulation.record(1);

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];

      const expected: MetricData = {
        instrumentDescriptor: defaultInstrumentDescriptor,
        pointDataType: PointDataType.HISTOGRAM,
        pointData: [
          {
            attributes: {},
            startTime,
            endTime,
            point: {
              buckets: {
                boundaries: [1, 10, 100],
                counts: [1, 1, 0, 0],
              },
              count: 2,
              sum: 1,
            },
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

describe('HistogramAccumulation', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const accumulation = new HistogramAccumulation([1, 10, 100]);

      for (const value of commonValues) {
        accumulation.record(value);
      }
    });
  });
});
