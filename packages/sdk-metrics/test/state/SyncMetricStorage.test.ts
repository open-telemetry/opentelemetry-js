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

import { SumAggregator } from '../../src/aggregator';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { DataPointType } from '../../src/export/MetricData';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { SyncMetricStorage } from '../../src/state/SyncMetricStorage';
import { createNoopAttributesProcessor } from '../../src/view/AttributesProcessor';
import {
  assertMetricData,
  assertDataPoint,
  commonAttributes,
  commonValues,
  defaultInstrumentDescriptor,
} from '../util';

const deltaCollector: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.DELTA,
  selectCardinalityLimit: () => 2000,
};

const cumulativeCollector: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.CUMULATIVE,
  selectCardinalityLimit: () => 2000,
};

describe('SyncMetricStorage', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const metricStorage = new SyncMetricStorage(
        defaultInstrumentDescriptor,
        new SumAggregator(true),
        createNoopAttributesProcessor(),
        []
      );

      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          metricStorage.record(value, attributes, api.context.active(), [0, 0]);
        }
      }
    });
  });

  describe('collect', () => {
    describe('Delta Collector', () => {
      it('should collect and reset memos', async () => {
        const metricStorage = new SyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(true),
          createNoopAttributesProcessor(),
          [deltaCollector]
        );

        metricStorage.record(1, {}, api.context.active(), [0, 0]);
        metricStorage.record(2, {}, api.context.active(), [1, 1]);
        metricStorage.record(3, {}, api.context.active(), [2, 2]);
        {
          const metric = metricStorage.collect(deltaCollector, [3, 3]);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 6, [0, 0], [3, 3]);
        }

        // The attributes should not be memorized.
        {
          const metric = metricStorage.collect(deltaCollector, [4, 4]);

          assert.strictEqual(metric, undefined);
        }

        metricStorage.record(1, {}, api.context.active(), [5, 5]);
        {
          const metric = metricStorage.collect(deltaCollector, [6, 6]);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1, [5, 5], [6, 6]);
        }
      });
    });

    describe('Cumulative Collector', () => {
      it('should collect cumulative metrics', async () => {
        const metricStorage = new SyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(true),
          createNoopAttributesProcessor(),
          [cumulativeCollector]
        );
        metricStorage.record(1, {}, api.context.active(), [0, 0]);
        metricStorage.record(2, {}, api.context.active(), [1, 1]);
        metricStorage.record(3, {}, api.context.active(), [2, 2]);
        {
          const metric = metricStorage.collect(cumulativeCollector, [3, 3]);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 6, [0, 0], [3, 3]);
        }

        // The attributes should be memorized.
        {
          const metric = metricStorage.collect(cumulativeCollector, [4, 4]);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 6, [0, 0], [4, 4]);
        }

        metricStorage.record(1, {}, api.context.active(), [5, 5]);
        {
          const metric = metricStorage.collect(cumulativeCollector, [6, 6]);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 7, [0, 0], [6, 6]);
        }
      });
    });
  });
});
