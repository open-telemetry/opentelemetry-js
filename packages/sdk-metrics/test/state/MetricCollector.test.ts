/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { MeterProvider } from '../../src';
import { TimeoutError } from '../../src/utils';
import { DataPointType } from '../../src/export/MetricData';
import { MeterProviderSharedState } from '../../src/state/MeterProviderSharedState';
import { MetricCollector } from '../../src/state/MetricCollector';
import {
  defaultInstrumentationScope,
  testResource,
  assertMetricData,
  assertDataPoint,
  ObservableCallbackDelegate,
  BatchObservableCallbackDelegate,
} from '../util';
import {
  TestDeltaMetricReader,
  TestMetricReader,
} from '../export/TestMetricReader';

describe('MetricCollector', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should construct MetricCollector without exceptions', () => {
      const meterProviderSharedState = new MeterProviderSharedState(
        testResource
      );
      const readers = [new TestMetricReader(), new TestDeltaMetricReader()];
      for (const reader of readers) {
        assert.doesNotThrow(
          () => new MetricCollector(meterProviderSharedState, reader)
        );
      }
    });
  });

  describe('collect', () => {
    function setupInstruments() {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
      });

      const metricCollector = reader.getMetricCollector();

      const meter = meterProvider.getMeter(
        defaultInstrumentationScope.name,
        defaultInstrumentationScope.version,
        {
          schemaUrl: defaultInstrumentationScope.schemaUrl,
        }
      );

      return { metricCollector, meter };
    }

    it('should collect sync metrics', async () => {
      /** preparing test instrumentations */
      const { metricCollector, meter } = setupInstruments();

      /** creating metric events */
      const counter = meter.createCounter('counter1');
      counter.add(1, {});
      counter.add(2, { foo: 'bar' });

      const counter2 = meter.createCounter('counter2');
      counter2.add(3);

      /** collect metrics */
      const { resourceMetrics, errors } = await metricCollector.collect();
      assert.strictEqual(errors.length, 0);
      const { scopeMetrics } = resourceMetrics;
      const { metrics } = scopeMetrics[0];
      assert.strictEqual(metrics.length, 2);

      /** checking batch[0] */
      const metricData1 = metrics[0];
      assertMetricData(metricData1, DataPointType.SUM, {
        name: 'counter1',
      });
      assert.strictEqual(metricData1.dataPoints.length, 2);
      assertDataPoint(metricData1.dataPoints[0], {}, 1);
      assertDataPoint(metricData1.dataPoints[1], { foo: 'bar' }, 2);

      /** checking batch[1] */
      const metricData2 = metrics[1];
      assertMetricData(metricData2, DataPointType.SUM, {
        name: 'counter2',
      });
      assert.strictEqual(metricData2.dataPoints.length, 1);
      assertDataPoint(metricData2.dataPoints[0], {}, 3);
    });

    it('should collect async metrics', async () => {
      /** preparing test instrumentations */
      const { metricCollector, meter } = setupInstruments();

      /** creating metric events */
      /** observable */
      const delegate1 = new ObservableCallbackDelegate();
      const observableCounter1 = meter.createObservableCounter('observable1');
      observableCounter1.addCallback(delegate1.getCallback());
      delegate1.setDelegate(observableResult => {
        observableResult.observe(1, {});
        observableResult.observe(2, { foo: 'bar' });
      });

      /** batch observable */
      const delegate2 = new BatchObservableCallbackDelegate();
      const observableCounter2 = meter.createObservableCounter('observable2');
      const observableCounter3 = meter.createObservableCounter('observable3');
      meter.addBatchObservableCallback(delegate2.getCallback(), [
        observableCounter2,
        observableCounter3,
      ]);
      delegate2.setDelegate(observableResult => {
        observableResult.observe(observableCounter2, 3, {});
        observableResult.observe(observableCounter2, 4, { foo: 'bar' });
      });

      /** collect metrics */
      const { resourceMetrics, errors } = await metricCollector.collect();
      assert.strictEqual(errors.length, 0);
      const { scopeMetrics } = resourceMetrics;
      const { metrics } = scopeMetrics[0];
      // Should not export observableCounter3, as it was never observed
      assert.strictEqual(metrics.length, 2);

      /** checking batch[0] */
      const metricData1 = metrics[0];
      assertMetricData(metricData1, DataPointType.SUM, {
        name: 'observable1',
      });
      assert.strictEqual(metricData1.dataPoints.length, 2);
      assertDataPoint(metricData1.dataPoints[0], {}, 1);
      assertDataPoint(metricData1.dataPoints[1], { foo: 'bar' }, 2);

      /** checking batch[1] */
      const metricData2 = metrics[1];
      assertMetricData(metricData2, DataPointType.SUM, {
        name: 'observable2',
      });
      assert.strictEqual(metricData2.dataPoints.length, 2);
      assertDataPoint(metricData2.dataPoints[0], {}, 3);
      assertDataPoint(metricData2.dataPoints[1], { foo: 'bar' }, 4);
    });

    it('should collect observer metrics with timeout', async () => {
      const timer = sinon.useFakeTimers();
      /** preparing test instrumentations */
      const { metricCollector, meter } = setupInstruments();

      /** creating metric events */

      /** observer1 is an abnormal observer */
      const delegate1 = new ObservableCallbackDelegate();
      const observableCounter1 = meter.createObservableCounter('observer1');
      observableCounter1.addCallback(delegate1.getCallback());
      delegate1.setDelegate(_observableResult => {
        return new Promise(() => {
          /** promise never settles */
        });
      });

      /** observer2 is a normal observer */
      const delegate2 = new ObservableCallbackDelegate();
      const observableCounter2 = meter.createObservableCounter('observer2');
      observableCounter2.addCallback(delegate2.getCallback());
      delegate2.setDelegate(observableResult => {
        observableResult.observe(1, {});
      });

      /** collect metrics */
      {
        const future = metricCollector.collect({
          timeoutMillis: 100,
        });
        timer.tick(200);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 1);
        assert.ok(errors[0] instanceof TimeoutError);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];

        // Only observer2 is exported, observer1 never reported a measurement
        assert.strictEqual(metrics.length, 1);

        /** observer2 */
        assertMetricData(metrics[0], DataPointType.SUM, {
          name: 'observer2',
        });
        assert.strictEqual(metrics[0].dataPoints.length, 1);
      }

      /** now the observer1 is back to normal */
      delegate1.setDelegate(async observableResult => {
        observableResult.observe(100, {});
      });

      /** collect metrics */
      {
        const future = metricCollector.collect({
          timeoutMillis: 100,
        });
        timer.tick(100);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 0);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];
        assert.strictEqual(metrics.length, 2);

        /** observer1 */
        assertMetricData(metrics[0], DataPointType.SUM, {
          name: 'observer1',
        });
        assert.strictEqual(metrics[0].dataPoints.length, 1);
        assertDataPoint(metrics[0].dataPoints[0], {}, 100);

        /** observer2 */
        assertMetricData(metrics[1], DataPointType.SUM, {
          name: 'observer2',
        });
        assert.strictEqual(metrics[1].dataPoints.length, 1);
      }
    });

    it('should collect with throwing observable callbacks', async () => {
      /** preparing test instrumentations */
      const { metricCollector, meter } = setupInstruments();

      /** creating metric events */
      const counter = meter.createCounter('counter1');
      counter.add(1);

      /** observer1 is an abnormal observer */
      const observableCounter1 = meter.createObservableCounter('observer1');
      observableCounter1.addCallback(_observableResult => {
        throw new Error('foobar');
      });

      /** collect metrics */
      const { resourceMetrics, errors } = await metricCollector.collect();
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(`${errors[0]}`, 'Error: foobar');
      const { scopeMetrics } = resourceMetrics;
      const { metrics } = scopeMetrics[0];

      /** only counter1 data points are collected */
      assert.strictEqual(metrics.length, 1);
      assertMetricData(metrics[0], DataPointType.SUM, {
        name: 'counter1',
      });
      assert.strictEqual(metrics[0].dataPoints.length, 1);
    });

    it('should collect batch observer metrics with timeout', async () => {
      const timer = sinon.useFakeTimers();
      /** preparing test instrumentations */
      const { metricCollector, meter } = setupInstruments();

      /** creating metric events */

      /** observer1 is an abnormal observer */
      const observableCounter1 = meter.createObservableCounter('observer1');
      const delegate1 = new BatchObservableCallbackDelegate();
      meter.addBatchObservableCallback(delegate1.getCallback(), [
        observableCounter1,
      ]);
      delegate1.setDelegate(_observableResult => {
        return new Promise(() => {
          /** promise never settles */
        });
      });

      /** observer2 is a normal observer */
      const observableCounter2 = meter.createObservableCounter('observer2');
      const delegate2 = new BatchObservableCallbackDelegate();
      meter.addBatchObservableCallback(delegate2.getCallback(), [
        observableCounter2,
      ]);
      delegate2.setDelegate(observableResult => {
        observableResult.observe(observableCounter2, 1, {});
      });

      /** collect metrics */
      {
        const future = metricCollector.collect({
          timeoutMillis: 100,
        });
        timer.tick(200);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 1);
        assert.ok(errors[0] instanceof TimeoutError);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];

        /** only observer2 is present; observer1's promise never settled*/
        assert.strictEqual(metrics.length, 1);
        assertMetricData(metrics[0], DataPointType.SUM, {
          name: 'observer2',
        });
        assert.strictEqual(metrics[0].dataPoints.length, 1);
      }

      /** now the observer1 is back to normal */
      delegate1.setDelegate(async observableResult => {
        observableResult.observe(observableCounter1, 100, {});
      });

      /** collect metrics */
      {
        const future = metricCollector.collect({
          timeoutMillis: 100,
        });
        timer.tick(100);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 0);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];
        assert.strictEqual(metrics.length, 2);

        /** observer1 */
        assertMetricData(metrics[0], DataPointType.SUM, {
          name: 'observer1',
        });
        assert.strictEqual(metrics[0].dataPoints.length, 1);
        assertDataPoint(metrics[0].dataPoints[0], {}, 100);

        /** observer2 */
        assertMetricData(metrics[1], DataPointType.SUM, {
          name: 'observer2',
        });
        assert.strictEqual(metrics[1].dataPoints.length, 1);
      }
    });

    it('should collect with throwing batch observable callbacks', async () => {
      /** preparing test instrumentations */
      const { metricCollector, meter } = setupInstruments();

      /** creating metric events */
      const counter = meter.createCounter('counter1');
      counter.add(1);

      /** observer1 is an abnormal observer */
      const observableCounter1 = meter.createObservableCounter('observer1');
      const delegate1 = new BatchObservableCallbackDelegate();
      meter.addBatchObservableCallback(delegate1.getCallback(), [
        observableCounter1,
      ]);
      delegate1.setDelegate(_observableResult => {
        throw new Error('foobar');
      });

      /** collect metrics */
      const { resourceMetrics, errors } = await metricCollector.collect();
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(`${errors[0]}`, 'Error: foobar');
      const { scopeMetrics } = resourceMetrics;
      const { metrics } = scopeMetrics[0];

      /** counter1 data points are collected; observer1's callback did throw, so data points are not collected */
      assert.strictEqual(metrics.length, 1);
      assertMetricData(metrics[0], DataPointType.SUM, {
        name: 'counter1',
      });
      assert.strictEqual(metrics[0].dataPoints.length, 1);
    });
  });
});
