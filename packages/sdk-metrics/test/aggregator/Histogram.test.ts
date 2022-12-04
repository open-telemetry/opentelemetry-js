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
import * as assert from 'assert';
import {
  AggregationTemporality,
  InstrumentType,
  DataPointType,
  MetricData,
} from '../../src';
import {
  HistogramAccumulation,
  HistogramAggregator,
} from '../../src/aggregator';
import { commonValues, defaultInstrumentDescriptor } from '../util';

describe('HistogramAggregator', () => {
  describe('createAccumulation', () => {
    it('no exceptions on createAccumulation', () => {
      const aggregator = new HistogramAggregator([1, 10, 100], true);
      const accumulation = aggregator.createAccumulation([0, 0]);
      assert(accumulation instanceof HistogramAccumulation);
    });
  });

  describe('merge', () => {
    it('no exceptions', () => {
      const aggregator = new HistogramAggregator([1, 10, 100], true);
      const prev = aggregator.createAccumulation([0, 0]);
      prev.record(0);
      prev.record(1);

      const delta = aggregator.createAccumulation([1, 1]);
      delta.record(2);
      delta.record(11);

      const expected = aggregator.createAccumulation([0, 0]);
      // replay actions on prev
      expected.record(0);
      expected.record(1);
      // replay actions on delta
      expected.record(2);
      expected.record(11);

      assert.deepStrictEqual(aggregator.merge(prev, delta), expected);
    });

    it('with only negatives', () => {
      const aggregator = new HistogramAggregator([1, 10, 100], true);
      const prev = aggregator.createAccumulation([0, 0]);
      prev.record(-10);
      prev.record(-20);

      const delta = aggregator.createAccumulation([1, 1]);
      delta.record(-5);
      delta.record(-30);

      assert.deepStrictEqual(aggregator.merge(prev, delta).toPointValue(), {
        buckets: {
          boundaries: [1, 10, 100],
          counts: [4, 0, 0, 0],
        },
        count: 4,
        hasMinMax: true,
        max: -5,
        min: -30,
        sum: -65,
      });
    });
  });

  describe('diff', () => {
    it('no exceptions', () => {
      const aggregator = new HistogramAggregator([1, 10, 100], true);
      const prev = aggregator.createAccumulation([0, 0]);
      prev.record(0);
      prev.record(1);

      const curr = aggregator.createAccumulation([1, 1]);
      // replay actions on prev
      curr.record(0);
      curr.record(1);
      // perform new actions
      curr.record(2);
      curr.record(11);

      const expected = new HistogramAccumulation([1, 1], [1, 10, 100], true, {
        buckets: {
          boundaries: [1, 10, 100],
          counts: [0, 1, 1, 0],
        },
        count: 2,
        sum: 13,
        hasMinMax: false,
        min: Infinity,
        max: -Infinity,
      });

      assert.deepStrictEqual(aggregator.diff(prev, curr), expected);
    });
  });

  describe('toMetricData', () => {
    it('should transform to expected data with recordMinMax = true', () => {
      const aggregator = new HistogramAggregator([1, 10, 100], true);

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];
      const accumulation = aggregator.createAccumulation(startTime);
      accumulation.record(0);
      accumulation.record(1);

      const expected: MetricData = {
        descriptor: defaultInstrumentDescriptor,
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            startTime,
            endTime,
            value: {
              buckets: {
                boundaries: [1, 10, 100],
                counts: [1, 1, 0, 0],
              },
              count: 2,
              sum: 1,
              min: 0,
              max: 1,
            },
          },
        ],
      };
      assert.deepStrictEqual(
        aggregator.toMetricData(
          defaultInstrumentDescriptor,
          AggregationTemporality.CUMULATIVE,
          [[{}, accumulation]],
          endTime
        ),
        expected
      );
    });

    it('should transform to expected data with recordMinMax = false', () => {
      const aggregator = new HistogramAggregator([1, 10, 100], false);

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];
      const accumulation = aggregator.createAccumulation(startTime);
      accumulation.record(0);
      accumulation.record(1);

      const expected: MetricData = {
        descriptor: defaultInstrumentDescriptor,
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            startTime,
            endTime,
            value: {
              buckets: {
                boundaries: [1, 10, 100],
                counts: [1, 1, 0, 0],
              },
              count: 2,
              sum: 1,
              min: undefined,
              max: undefined,
            },
          },
        ],
      };
      assert.deepStrictEqual(
        aggregator.toMetricData(
          defaultInstrumentDescriptor,
          AggregationTemporality.CUMULATIVE,
          [[{}, accumulation]],
          endTime
        ),
        expected
      );
    });

    function testSum(instrumentType: InstrumentType, expectSum: boolean) {
      const aggregator = new HistogramAggregator([1, 10, 100], true);

      const startTime: HrTime = [0, 0];
      const endTime: HrTime = [1, 1];

      const accumulation = aggregator.createAccumulation(startTime);
      accumulation.record(0);
      accumulation.record(1);
      accumulation.record(4);

      const aggregatedData = aggregator.toMetricData(
        {
          name: 'default_metric',
          description: 'a simple instrument',
          type: instrumentType,
          unit: '1',
          valueType: ValueType.DOUBLE,
        },
        AggregationTemporality.CUMULATIVE,
        [[{}, accumulation]],
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

describe('HistogramAccumulation', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const accumulation = new HistogramAccumulation([0, 0], [1, 10, 100]);

      for (const value of commonValues) {
        accumulation.record(value);
      }
    });
  });

  describe('setStartTime', () => {
    it('should set start time', () => {
      const accumulation = new HistogramAccumulation([0, 0], [1, 10, 100]);
      accumulation.setStartTime([1, 1]);
      assert.deepStrictEqual(accumulation.startTime, [1, 1]);
    });
  });
});
