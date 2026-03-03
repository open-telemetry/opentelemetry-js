/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        deltaMetricStorage.record(2, {}, api.context.active(), [3, 3]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [4, 4]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          // Time span: (lastCollectionTime, collectionTime)
          assertDataPoint(metric.dataPoints[0], {}, 2, [2, 2], [4, 4]);
        }

        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [5, 5]
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

        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector2,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [3, 3]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [3, 3]);
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

        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        deltaMetricStorage.record(2, {}, api.context.active(), [3, 3]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [4, 4]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 3, [1, 1], [4, 4]);
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

        deltaMetricStorage.record(1, {}, api.context.active(), [1, 1]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [2, 2]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [1, 1], [2, 2]);
        }

        deltaMetricStorage.record(2, {}, api.context.active(), [3, 3]);
        {
          const metric = temporalMetricStorage.buildMetrics(
            deltaCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [4, 4]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.DELTA
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 3, [1, 1], [4, 4]);
        }
        {
          const metric = temporalMetricStorage.buildMetrics(
            cumulativeCollector1,
            defaultInstrumentDescriptor,
            deltaMetricStorage.collect(),
            [5, 5]
          );

          assertMetricData(
            metric,
            DataPointType.SUM,
            defaultInstrumentDescriptor,
            AggregationTemporality.CUMULATIVE
          );
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 3, [1, 1], [5, 5]);
        }
      });
    });
  });
});
