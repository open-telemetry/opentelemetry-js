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

import * as api from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { SumAggregator } from '../../src/aggregator';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { DataPointType } from '../../src/export/MetricData';
import { DeltaMetricProcessor } from '../../src/state/DeltaMetricProcessor';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { TemporalMetricProcessor } from '../../src/state/TemporalMetricProcessor';
import {
  assertMetricData,
  assertDataPoint,
  defaultInstrumentDescriptor,
} from '../util';

const deltaCollector1: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.DELTA,
  selectCardinalityLimit: () => 2000,
};

const deltaCollector2: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.DELTA,
  selectCardinalityLimit: () => 2000,
};

const cumulativeCollector1: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.CUMULATIVE,
  selectCardinalityLimit: () => 2000,
};

describe('TemporalMetricProcessor', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('buildMetrics', () => {
    describe('single delta collector', () => {
      it('should build delta recording metrics', () => {
        const spy = sinon.spy(deltaCollector1, 'selectAggregationTemporality');

        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator, [
          deltaCollector1,
        ]);
        deltaMetricStorage.record(1, {}, api.context.active(), 1_000_000_001n);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            2_000_000_002n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            1,
            1_000_000_001n,
            2_000_000_002n
          );
        }

        deltaMetricStorage.record(2, {}, api.context.active(), 3_000_000_003n);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            4_000_000_004n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          // Time span: (lastCollectionTime, collectionTime)
          assertDataPoint(
            metric.dataPoints[0],
            {},
            2,
            2_000_000_002n,
            4_000_000_004n
          );
        }

        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            5_000_000_000_000n
          );

          // nothing recorded -> nothing collected
          assert.equal(metric, undefined);
        }

        // selectAggregationTemporality should be called only once.
        assert.strictEqual(spy.callCount, 1);
      });
    });

    describe('two delta collector', () => {
      it('should build delta recording metrics', () => {
        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator, [
          deltaCollector1,
          deltaCollector2,
        ]);

        deltaMetricStorage.record(1, {}, api.context.active(), 1_000_000_001n);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            2_000_000_002n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            1,
            1_000_000_001n,
            2_000_000_002n
          );
        }

        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector2,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            3_000_000_003n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            1,
            1_000_000_001n,
            3_000_000_003n
          );
        }
      });
    });

    describe('single cumulative collector', () => {
      it('should build delta recording metrics', () => {
        const spy = sinon.spy(
          cumulativeCollector1,
          'selectAggregationTemporality'
        );

        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator, [
          cumulativeCollector1,
        ]);

        deltaMetricStorage.record(1, {}, api.context.active(), 1_000_000_001n);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            2_000_000_002n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            1,
            1_000_000_001n,
            2_000_000_002n
          );
        }

        deltaMetricStorage.record(2, {}, api.context.active(), 3_000_000_003n);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            4_000_000_004n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            3,
            1_000_000_001n,
            4_000_000_004n
          );
        }

        // selectAggregationTemporality should be called only once.
        assert.strictEqual(spy.callCount, 1);
      });
    });

    describe('cumulative collector with delta collector', () => {
      it('should build delta recording metrics', () => {
        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator, [
          cumulativeCollector1,
          deltaCollector1,
        ]);

        deltaMetricStorage.record(1, {}, api.context.active(), 1_000_000_001n);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            2_000_000_002n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            1,
            1_000_000_001n,
            2_000_000_002n
          );
        }

        deltaMetricStorage.record(2, {}, api.context.active(), 3_000_000_003n);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            4_000_000_004n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            3,
            1_000_000_001n,
            4_000_000_004n
          );
        }
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            5_000_000_005n
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            {},
            3,
            1_000_000_001n,
            5_000_000_005n
          );
        }
      });
    });
  });
});
