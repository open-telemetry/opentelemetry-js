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
import { assertMetricData, assertDataPoint, defaultInstrumentDescriptor } from '../util';

const deltaCollector1: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.DELTA,
};

const deltaCollector2: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.DELTA,
};

const cumulativeCollector1: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.CUMULATIVE,
};

describe('TemporalMetricProcessor', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('buildMetrics', () => {
    describe('single delta collector', () => {
      const collectors = [ deltaCollector1 ];

      it('should build delta recording metrics', () => {
        const spy = sinon.spy(deltaCollector1, 'selectAggregationTemporality');

        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator);

        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        deltaMetricStorage.record(2, {}, api.context.active(), [3, 3]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [4, 4]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA);
          assert.strictEqual(metric.dataPoints.length, 1);
          // Time span: (lastCollectionTime, collectionTime)
          assertDataPoint(metric.dataPoints[0], {}, 2, [2, 2], [4, 4]);
        }

        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [5, 5]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA);
          assert.strictEqual(metric.dataPoints.length, 0);
        }

        // selectAggregationTemporality should be called only once.
        assert.strictEqual(spy.callCount, 1);
      });
    });

    describe('two delta collector', () => {
      const collectors = [ deltaCollector1, deltaCollector2 ];

      it('should build delta recording metrics', () => {
        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator);

        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector2,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [3, 3]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [3, 3]);
        }
      });
    });

    describe('single cumulative collector', () => {
      const collectors = [ cumulativeCollector1 ];
      it('should build delta recording metrics', () => {
        const spy = sinon.spy(cumulativeCollector1, 'selectAggregationTemporality');

        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator);

        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        deltaMetricStorage.record(2, {}, api.context.active(), [3, 3]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [4, 4]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 3, [1, 1], [4, 4]);
        }

        // selectAggregationTemporality should be called only once.
        assert.strictEqual(spy.callCount, 1);
      });
    });

    describe('cumulative collector with delta collector', () => {
      const collectors = [ deltaCollector1, cumulativeCollector1 ];
      it('should build delta recording metrics', () => {
        const aggregator = new SumAggregator(true);
        const deltaMetricStorage = new DeltaMetricProcessor(aggregator);
        const temporalMetricStorage = new TemporalMetricProcessor(aggregator);

        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        deltaMetricStorage.record(2, {}, api.context.active(), [3, 3]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [4, 4]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 3, [1, 1], [4, 4]);
        }
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            collectors,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [5, 5]);

          assertMetricData(metric,
            DataPointType.SINGULAR,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 3, [1, 1], [5, 5]);
        }
      });
    });
  });
});
