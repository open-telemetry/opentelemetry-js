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

import { hrTime } from '@opentelemetry/core';
import * as assert from 'assert';

import { SumAggregator } from '../../src/aggregator';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { DataPointType } from '../../src/export/MetricData';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { AsyncMetricStorage } from '../../src/state/AsyncMetricStorage';
import { NoopAttributesProcessor } from '../../src/view/AttributesProcessor';
import { assertMetricData, assertDataPoint, defaultInstrumentDescriptor } from '../util';
import { ObservableCallback } from '@opentelemetry/api-metrics';

const deltaCollector: MetricCollectorHandle = {
  aggregatorTemporality: AggregationTemporality.DELTA,
};

const cumulativeCollector: MetricCollectorHandle = {
  aggregatorTemporality: AggregationTemporality.CUMULATIVE,
};

const sdkStartTime = hrTime();

class ObservableCallbackDelegate {
  private _delegate?: ObservableCallback;
  setDelegate(delegate: ObservableCallback) {
    this._delegate = delegate;
  }

  getCallback(): ObservableCallback {
    return observableResult => {
      this._delegate?.(observableResult);
    };
  }
}

describe('AsyncMetricStorage', () => {
  describe('collect', () => {
    describe('Delta Collector', () => {
      const collectors = [deltaCollector];
      it('should collect and reset memos', async () => {
        const delegate = new ObservableCallbackDelegate();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(),
          new NoopAttributesProcessor(),
          delegate.getCallback(),
        );

        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
          observableResult.observe(2, { key: '2' });
          observableResult.observe(3, { key: '3' });
        });
        {
          const metric = await metricStorage.collect(
            deltaCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(metric.dataPoints[0], { key: '1' }, 1);
          assertDataPoint(metric.dataPoints[1], { key: '2' }, 2);
          assertDataPoint(metric.dataPoints[2], { key: '3' }, 3);
        }

        delegate.setDelegate(observableResult => {});
        // The attributes should not be memorized if no measurement was reported.
        {
          const metric = await metricStorage.collect(
            deltaCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 0);
        }

        delegate.setDelegate(observableResult => {
          observableResult.observe(4, { key: '1' });
          observableResult.observe(5, { key: '2' });
          observableResult.observe(6, { key: '3' });
        });
        {
          const metric = await metricStorage.collect(
            deltaCollector,
            [deltaCollector],
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 3);
          // all values were diffed.
          assertDataPoint(metric.dataPoints[0], { key: '1' }, 3);
          assertDataPoint(metric.dataPoints[1], { key: '2' }, 3);
          assertDataPoint(metric.dataPoints[2], { key: '3' }, 3);
        }
      });
    });

    describe('Cumulative Collector', () => {
      const collectors = [cumulativeCollector];
      it('should collect cumulative metrics', async () => {
        const delegate = new ObservableCallbackDelegate();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(),
          new NoopAttributesProcessor(),
          delegate.getCallback(),
        );

        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
          observableResult.observe(2, { key: '2' });
          observableResult.observe(3, { key: '3' });
        });
        {
          const metric = await metricStorage.collect(
            cumulativeCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(metric.dataPoints[0], { key: '1' }, 1);
          assertDataPoint(metric.dataPoints[1], { key: '2' }, 2);
          assertDataPoint(metric.dataPoints[2], { key: '3' }, 3);
        }

        delegate.setDelegate(observableResult => {});
        // The attributes should be memorized even if no measurement was reported.
        {
          const metric = await metricStorage.collect(
            cumulativeCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(metric.dataPoints[0], { key: '1' }, 1);
          assertDataPoint(metric.dataPoints[1], { key: '2' }, 2);
          assertDataPoint(metric.dataPoints[2], { key: '3' }, 3);
        }

        delegate.setDelegate(observableResult => {
          observableResult.observe(4, { key: '1' });
          observableResult.observe(5, { key: '2' });
          observableResult.observe(6, { key: '3' });
        });
        {
          const metric = await metricStorage.collect(
            cumulativeCollector,
            collectors,
            sdkStartTime,
            hrTime());

          assertMetricData(metric, DataPointType.SINGULAR);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(metric.dataPoints[0], { key: '1' }, 4);
          assertDataPoint(metric.dataPoints[1], { key: '2' }, 5);
          assertDataPoint(metric.dataPoints[2], { key: '3' }, 6);
        }
      });
    });
  });
});
