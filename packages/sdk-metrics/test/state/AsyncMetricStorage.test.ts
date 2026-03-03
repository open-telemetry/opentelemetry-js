/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import { SumAggregator } from '../../src/aggregator';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { DataPointType } from '../../src/export/MetricData';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { AsyncMetricStorage } from '../../src/state/AsyncMetricStorage';
import { createNoopAttributesProcessor } from '../../src/view/AttributesProcessor';
import { ObservableRegistry } from '../../src/state/ObservableRegistry';
import {
  assertMetricData,
  assertDataPoint,
  defaultInstrumentDescriptor,
  ObservableCallbackDelegate,
} from '../util';
import { ObservableInstrument } from '../../src/Instruments';
import { HrTime } from '@opentelemetry/api';

const deltaCollector: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.DELTA,
  selectCardinalityLimit: () => 2000,
};

const cumulativeCollector: MetricCollectorHandle = {
  selectAggregationTemporality: () => AggregationTemporality.CUMULATIVE,
  selectCardinalityLimit: () => 2000,
};

describe('AsyncMetricStorage', () => {
  describe('collect', () => {
    describe('Delta Collector', () => {
      it('should collect and reset memos', async () => {
        const delegate = new ObservableCallbackDelegate();
        const observableRegistry = new ObservableRegistry();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(true),
          createNoopAttributesProcessor(),
          [deltaCollector]
        );

        const observable = new ObservableInstrument(
          defaultInstrumentDescriptor,
          [metricStorage],
          observableRegistry
        );

        observableRegistry.addCallback(delegate.getCallback(), observable);

        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
          observableResult.observe(2, { key: '2' });
          observableResult.observe(3, { key: '3' });
        });
        {
          const collectionTime: HrTime = [0, 0];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            1,
            collectionTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[1],
            { key: '2' },
            2,
            collectionTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[2],
            { key: '3' },
            3,
            collectionTime,
            collectionTime
          );
        }

        delegate.setDelegate(observableResult => {});
        // The attributes should not be memorized if no measurement was reported.
        {
          const collectionTime: HrTime = [1, 1];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assert.equal(metric, undefined);
        }

        delegate.setDelegate(observableResult => {
          observableResult.observe(4, { key: '1' });
          observableResult.observe(5, { key: '2' });
          observableResult.observe(6, { key: '3' });
        });
        {
          const collectionTime: HrTime = [2, 2];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 3);
          // All values were diffed. StartTime is being reset for gaps.
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            3,
            collectionTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[1],
            { key: '2' },
            3,
            collectionTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[2],
            { key: '3' },
            3,
            collectionTime,
            collectionTime
          );
        }
      });

      it('should detect resets for monotonic sum metrics', async () => {
        const delegate = new ObservableCallbackDelegate();
        const observableRegistry = new ObservableRegistry();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(true),
          createNoopAttributesProcessor(),
          [deltaCollector]
        );

        const observable = new ObservableInstrument(
          defaultInstrumentDescriptor,
          [metricStorage],
          observableRegistry
        );

        observableRegistry.addCallback(delegate.getCallback(), observable);

        // Observe a metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(100, { key: '1' });
        });
        let lastCollectionTime: HrTime;
        {
          const collectionTime: HrTime = [0, 0];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            100,
            collectionTime,
            collectionTime
          );
          lastCollectionTime = collectionTime;
        }

        // Observe a drop on the metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
        });
        // The result data should not be diff-ed to be a negative value
        {
          const collectionTime: HrTime = [1, 1];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            1,
            lastCollectionTime,
            collectionTime
          );
          lastCollectionTime = collectionTime;
        }

        // Observe a new data point
        delegate.setDelegate(observableResult => {
          observableResult.observe(50, { key: '1' });
        });
        // The result data should now be a delta to the previous collection
        {
          const collectionTime: HrTime = [2, 2];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            49,
            lastCollectionTime,
            collectionTime
          );
        }
      });

      it('should not detect resets and gaps for non-monotonic sum metrics', async () => {
        const delegate = new ObservableCallbackDelegate();
        const observableRegistry = new ObservableRegistry();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(false),
          createNoopAttributesProcessor(),
          [deltaCollector]
        );

        const observable = new ObservableInstrument(
          defaultInstrumentDescriptor,
          [metricStorage],
          observableRegistry
        );

        observableRegistry.addCallback(delegate.getCallback(), observable);

        // Observe a metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(100, { key: '1' });
        });
        let lastCollectionTime: HrTime;
        {
          const collectionTime: HrTime = [0, 0];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            100,
            collectionTime,
            collectionTime
          );
          lastCollectionTime = collectionTime;
        }

        // Observe a drop on the metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
        });
        // The result data should be a delta to the previous collection
        {
          const collectionTime: HrTime = [0, 0];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            -99,
            lastCollectionTime,
            collectionTime
          );
          lastCollectionTime = collectionTime;
        }

        // Observe a new data point
        delegate.setDelegate(observableResult => {
          observableResult.observe(50, { key: '1' });
        });
        // The result data should be a delta to the previous collection
        {
          const collectionTime: HrTime = [2, 2];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(deltaCollector, collectionTime);

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            49,
            lastCollectionTime,
            collectionTime
          );
        }
      });
    });

    describe('Cumulative Collector', () => {
      it('should collect cumulative metrics', async () => {
        const delegate = new ObservableCallbackDelegate();
        const observableRegistry = new ObservableRegistry();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(true),
          createNoopAttributesProcessor(),
          [cumulativeCollector]
        );

        const observable = new ObservableInstrument(
          defaultInstrumentDescriptor,
          [metricStorage],
          observableRegistry
        );

        observableRegistry.addCallback(delegate.getCallback(), observable);

        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
          observableResult.observe(2, { key: '2' });
          observableResult.observe(3, { key: '3' });
        });
        let startTime: HrTime;
        {
          const collectionTime: HrTime = [0, 0];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          startTime = collectionTime;
          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            1,
            startTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[1],
            { key: '2' },
            2,
            startTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[2],
            { key: '3' },
            3,
            startTime,
            collectionTime
          );
        }

        delegate.setDelegate(observableResult => {});
        // The attributes should be memorized even if no measurement was reported.
        {
          const collectionTime: HrTime = [1, 1];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            1,
            startTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[1],
            { key: '2' },
            2,
            startTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[2],
            { key: '3' },
            3,
            startTime,
            collectionTime
          );
        }

        delegate.setDelegate(observableResult => {
          observableResult.observe(4, { key: '1' });
          observableResult.observe(5, { key: '2' });
          observableResult.observe(6, { key: '3' });
        });
        {
          const collectionTime: HrTime = [2, 2];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 3);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            4,
            startTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[1],
            { key: '2' },
            5,
            startTime,
            collectionTime
          );
          assertDataPoint(
            metric.dataPoints[2],
            { key: '3' },
            6,
            startTime,
            collectionTime
          );
        }
      });

      it('should collect monotonic metrics with resets and gaps', async () => {
        const delegate = new ObservableCallbackDelegate();
        const observableRegistry = new ObservableRegistry();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(true),
          createNoopAttributesProcessor(),
          [cumulativeCollector]
        );

        const observable = new ObservableInstrument(
          defaultInstrumentDescriptor,
          [metricStorage],
          observableRegistry
        );

        observableRegistry.addCallback(delegate.getCallback(), observable);

        // Observe a metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(100, { key: '1' });
        });
        let startTime: HrTime;
        {
          const collectionTime: HrTime = [0, 0];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          startTime = collectionTime;
          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            100,
            startTime,
            collectionTime
          );
        }

        // Observe a drop on the metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
        });
        // The result data should not be diff-ed to be a negative value
        {
          const collectionTime: HrTime = [1, 1];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          // The startTime should be reset.
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            1,
            collectionTime,
            collectionTime
          );
          startTime = collectionTime;
        }

        // Observe a new data point
        delegate.setDelegate(observableResult => {
          observableResult.observe(50, { key: '1' });
        });
        // The result data should now be a delta to the previous collection
        {
          const collectionTime: HrTime = [2, 2];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            50,
            startTime,
            collectionTime
          );
        }
      });

      it('should collect non-monotonic metrics with resets and gaps', async () => {
        const delegate = new ObservableCallbackDelegate();
        const observableRegistry = new ObservableRegistry();
        const metricStorage = new AsyncMetricStorage(
          defaultInstrumentDescriptor,
          new SumAggregator(false),
          createNoopAttributesProcessor(),
          [cumulativeCollector]
        );

        const observable = new ObservableInstrument(
          defaultInstrumentDescriptor,
          [metricStorage],
          observableRegistry
        );

        observableRegistry.addCallback(delegate.getCallback(), observable);

        // Observe a metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(100, { key: '1' });
        });
        let startTime: HrTime;
        {
          const collectionTime: HrTime = [0, 0];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          startTime = collectionTime;
          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            100,
            startTime,
            collectionTime
          );
        }

        // Observe a drop on the metric
        delegate.setDelegate(observableResult => {
          observableResult.observe(1, { key: '1' });
        });
        // The result data should be a delta to the previous collection
        {
          const collectionTime: HrTime = [1, 1];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          // No reset on the value or the startTime
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            1,
            startTime,
            collectionTime
          );
        }

        // Observe a new data point
        delegate.setDelegate(observableResult => {
          observableResult.observe(50, { key: '1' });
        });
        // The result data should be a delta to the previous collection
        {
          const collectionTime: HrTime = [2, 2];
          await observableRegistry.observe(collectionTime);
          const metric = metricStorage.collect(
            cumulativeCollector,
            collectionTime
          );

          assertMetricData(metric, DataPointType.SUM);
          assert.strictEqual(metric.dataPoints.length, 1);
          assertDataPoint(
            metric.dataPoints[0],
            { key: '1' },
            50,
            startTime,
            collectionTime
          );
        }
      });
    });
  });
});
