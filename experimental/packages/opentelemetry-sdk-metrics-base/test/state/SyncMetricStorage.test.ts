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
import { hrTime } from '@opentelemetry/core';
import * as assert from 'assert';

import { SumAggregator } from '../../src/aggregator';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { DataPointType } from '../../src/export/MetricData';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { SyncMetricStorage } from '../../src/state/SyncMetricStorage';
import { NoopAttributesProcessor } from '../../src/view/AttributesProcessor';
import { assertMetricData, assertDataPoint, commonAttributes, commonValues, defaultInstrumentDescriptor } from '../util';

const deltaCollector: MetricCollectorHandle = {
  aggregatorTemporality: AggregationTemporality.DELTA,
};

const cumulativeCollector: MetricCollectorHandle = {
  aggregatorTemporality: AggregationTemporality.CUMULATIVE,
};

const sdkStartTime = hrTime();

describe('SyncMetricStorage', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const metricStorage = new SyncMetricStorage(defaultInstrumentDescriptor, new SumAggregator(), new NoopAttributesProcessor());

      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          metricStorage.record(value, attributes, api.context.active());
        }
      }
    });
  });

  describe('collect', () => {
    describe('Delta Collector', () => {
      const collectors = [deltaCollector];
      it('should collect and reset memos', async () => {
        const metricStorage = new SyncMetricStorage(defaultInstrumentDescriptor, new SumAggregator(), new NoopAttributesProcessor());
        metricStorage.record(1, {}, api.context.active());
        metricStorage.record(2, {}, api.context.active());
        metricStorage.record(3, {}, api.context.active());
        {
          const metric = await metricStorage.collect(
            deltaCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 6);
        }

        // The attributes should not be memorized.
        {
          const metric = await metricStorage.collect(
            deltaCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 0);
        }

        metricStorage.record(1, {}, api.context.active());
        {
          const metric = await metricStorage.collect(
            deltaCollector,
            [deltaCollector],
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 1);
        }
      });
    });

    describe('Cumulative Collector', () => {
      const collectors = [cumulativeCollector];
      it('should collect cumulative metrics', async () => {
        const metricStorage = new SyncMetricStorage(defaultInstrumentDescriptor, new SumAggregator(), new NoopAttributesProcessor());
        metricStorage.record(1, {}, api.context.active());
        metricStorage.record(2, {}, api.context.active());
        metricStorage.record(3, {}, api.context.active());
        {
          const metric = await metricStorage.collect(
            cumulativeCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 6);
        }

        // The attributes should be memorized.
        {
          const metric = await metricStorage.collect(
            cumulativeCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 6);
        }

        metricStorage.record(1, {}, api.context.active());
        {
          const metric = await metricStorage.collect(
            cumulativeCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(metric.dataPoints[0], {}, 7);
        }
      });
    });
  });
});
