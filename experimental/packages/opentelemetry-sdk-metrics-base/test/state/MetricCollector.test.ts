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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { MeterProvider, TimeoutError } from '../../src';
import { DataPointType } from '../../src/export/MetricData';
import { PushMetricExporter } from '../../src/export/MetricExporter';
import { MeterProviderSharedState } from '../../src/state/MeterProviderSharedState';
import { MetricCollector } from '../../src/state/MetricCollector';
import {
  defaultInstrumentationScope,
  defaultResource,
  assertMetricData,
  assertDataPoint,
  ObservableCallbackDelegate,
  BatchObservableCallbackDelegate,
} from '../util';
import { TestMetricReader } from '../export/TestMetricReader';
import { TestDeltaMetricExporter, TestMetricExporter } from '../export/TestMetricExporter';

describe('MetricCollector', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should construct MetricCollector without exceptions', () => {
      const meterProviderSharedState = new MeterProviderSharedState(defaultResource);
      const exporters = [ new TestMetricExporter(), new TestDeltaMetricExporter() ];
      for (const exporter of exporters) {
        const reader = new TestMetricReader(exporter.selectAggregationTemporality);
        assert.doesNotThrow(() => new MetricCollector(meterProviderSharedState, reader));
      }
    });
  });

  describe('collect', () => {

    function setupInstruments(exporter: PushMetricExporter) {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader(exporter.selectAggregationTemporality);
      meterProvider.addMetricReader(reader);
      const metricCollector = reader.getMetricCollector();

      const meter = meterProvider.getMeter(defaultInstrumentationScope.name, defaultInstrumentationScope.version, {
        schemaUrl: defaultInstrumentationScope.schemaUrl,
      });

      return { metricCollector, meter };
    }

    it('should collect sync metrics', async () => {
      /** preparing test instrumentations */
      const exporter = new TestMetricExporter();
      const { metricCollector, meter } = setupInstruments(exporter);

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
      assertMetricData(metricData1, DataPointType.SINGULAR, {
        name: 'counter1'
      });
      assert.strictEqual(metricData1.dataPoints.length, 2);
      assertDataPoint(metricData1.dataPoints[0], {}, 1);
      assertDataPoint(metricData1.dataPoints[1], { foo: 'bar' }, 2);

      /** checking batch[1] */
      const metricData2 = metrics[1];
      assertMetricData(metricData2, DataPointType.SINGULAR, {
        name: 'counter2'
      });
      assert.strictEqual(metricData2.dataPoints.length, 1);
      assertDataPoint(metricData2.dataPoints[0], {}, 3);
    });

    it('should collect async metrics', async () => {
      /** preparing test instrumentations */
      const exporter = new TestMetricExporter();
      const { metricCollector, meter } = setupInstruments(exporter);

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
      meter.addBatchObservableCallback(delegate2.getCallback(), [ observableCounter2, observableCounter3 ]);
      delegate2.setDelegate(observableResult => {
        observableResult.observe(observableCounter2, 3, {});
        observableResult.observe(observableCounter2, 4, { foo: 'bar' });
      });

      /** collect metrics */
      const { resourceMetrics, errors } = await metricCollector.collect();
      assert.strictEqual(errors.length, 0);
      const { scopeMetrics } = resourceMetrics;
      const { metrics } = scopeMetrics[0];
      assert.strictEqual(metrics.length, 3);

      /** checking batch[0] */
      const metricData1 = metrics[0];
      assertMetricData(metricData1, DataPointType.SINGULAR, {
        name: 'observable1'
      });
      assert.strictEqual(metricData1.dataPoints.length, 2);
      assertDataPoint(metricData1.dataPoints[0], {}, 1);
      assertDataPoint(metricData1.dataPoints[1], { foo: 'bar' }, 2);

      /** checking batch[1] */
      const metricData2 = metrics[1];
      assertMetricData(metricData2, DataPointType.SINGULAR, {
        name: 'observable2'
      });
      assert.strictEqual(metricData2.dataPoints.length, 2);
      assertDataPoint(metricData2.dataPoints[0], {}, 3);
      assertDataPoint(metricData2.dataPoints[1], { foo: 'bar' }, 4);

      /** checking batch[2] */
      const metricData3 = metrics[2];
      assertMetricData(metricData3, DataPointType.SINGULAR, {
        name: 'observable3'
      });
      assert.strictEqual(metricData3.dataPoints.length, 0);
    });

    it('should collect observer metrics with timeout', async () => {
      sinon.useFakeTimers();
      /** preparing test instrumentations */
      const exporter = new TestMetricExporter();
      const { metricCollector, meter } = setupInstruments(exporter);

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
        sinon.clock.tick(200);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 1);
        assert(errors[0] instanceof TimeoutError);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];
        assert.strictEqual(metrics.length, 2);

        /** observer1 */
        assertMetricData(metrics[0], DataPointType.SINGULAR, {
          name: 'observer1'
        });
        assert.strictEqual(metrics[0].dataPoints.length, 0);

        /** observer2 */
        assertMetricData(metrics[1], DataPointType.SINGULAR, {
          name: 'observer2'
        });
        assert.strictEqual(metrics[1].dataPoints.length, 1);
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
        sinon.clock.tick(100);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 0);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];
        assert.strictEqual(metrics.length, 2);

        /** observer1 */
        assertMetricData(metrics[0], DataPointType.SINGULAR, {
          name: 'observer1'
        });
        assert.strictEqual(metrics[0].dataPoints.length, 1);
        assertDataPoint(metrics[0].dataPoints[0], {}, 100);

        /** observer2 */
        assertMetricData(metrics[1], DataPointType.SINGULAR, {
          name: 'observer2'
        });
        assert.strictEqual(metrics[1].dataPoints.length, 1);
      }
    });

    it('should collect with throwing observable callbacks', async () => {
      /** preparing test instrumentations */
      const exporter = new TestMetricExporter();
      const { metricCollector, meter } = setupInstruments(exporter);

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
      assert.strictEqual(metrics.length, 2);

      /** counter1 data points are collected */
      assertMetricData(metrics[0], DataPointType.SINGULAR, {
        name: 'counter1'
      });
      assert.strictEqual(metrics[0].dataPoints.length, 1);

      /** observer1 data points are not collected */
      assertMetricData(metrics[1], DataPointType.SINGULAR, {
        name: 'observer1'
      });
      assert.strictEqual(metrics[1].dataPoints.length, 0);
    });

    it('should collect batch observer metrics with timeout', async () => {
      sinon.useFakeTimers();
      /** preparing test instrumentations */
      const exporter = new TestMetricExporter();
      const { metricCollector, meter } = setupInstruments(exporter);

      /** creating metric events */

      /** observer1 is an abnormal observer */
      const observableCounter1 = meter.createObservableCounter('observer1');
      const delegate1 = new BatchObservableCallbackDelegate();
      meter.addBatchObservableCallback(delegate1.getCallback(), [ observableCounter1 ]);
      delegate1.setDelegate(_observableResult => {
        return new Promise(() => {
          /** promise never settles */
        });
      });

      /** observer2 is a normal observer */
      const observableCounter2 = meter.createObservableCounter('observer2');
      const delegate2 = new BatchObservableCallbackDelegate();
      meter.addBatchObservableCallback(delegate2.getCallback(), [ observableCounter2 ]);
      delegate2.setDelegate(observableResult => {
        observableResult.observe(observableCounter2, 1, {});
      });

      /** collect metrics */
      {
        const future = metricCollector.collect({
          timeoutMillis: 100,
        });
        sinon.clock.tick(200);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 1);
        assert(errors[0] instanceof TimeoutError);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];
        assert.strictEqual(metrics.length, 2);

        /** observer1 */
        assertMetricData(metrics[0], DataPointType.SINGULAR, {
          name: 'observer1'
        });
        assert.strictEqual(metrics[0].dataPoints.length, 0);

        /** observer2 */
        assertMetricData(metrics[1], DataPointType.SINGULAR, {
          name: 'observer2'
        });
        assert.strictEqual(metrics[1].dataPoints.length, 1);
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
        sinon.clock.tick(100);
        const { resourceMetrics, errors } = await future;
        assert.strictEqual(errors.length, 0);
        const { scopeMetrics } = resourceMetrics;
        const { metrics } = scopeMetrics[0];
        assert.strictEqual(metrics.length, 2);

        /** observer1 */
        assertMetricData(metrics[0], DataPointType.SINGULAR, {
          name: 'observer1'
        });
        assert.strictEqual(metrics[0].dataPoints.length, 1);
        assertDataPoint(metrics[0].dataPoints[0], {}, 100);

        /** observer2 */
        assertMetricData(metrics[1], DataPointType.SINGULAR, {
          name: 'observer2'
        });
        assert.strictEqual(metrics[1].dataPoints.length, 1);
      }
    });

    it('should collect with throwing batch observable callbacks', async () => {
      /** preparing test instrumentations */
      const exporter = new TestMetricExporter();
      const { metricCollector, meter } = setupInstruments(exporter);

      /** creating metric events */
      const counter = meter.createCounter('counter1');
      counter.add(1);

      /** observer1 is an abnormal observer */
      const observableCounter1 = meter.createObservableCounter('observer1');
      const delegate1 = new BatchObservableCallbackDelegate();
      meter.addBatchObservableCallback(delegate1.getCallback(), [ observableCounter1 ]);
      delegate1.setDelegate(_observableResult => {
        throw new Error('foobar');
      });

      /** collect metrics */
      const { resourceMetrics, errors } = await metricCollector.collect();
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(`${errors[0]}`, 'Error: foobar');
      const { scopeMetrics } = resourceMetrics;
      const { metrics } = scopeMetrics[0];
      assert.strictEqual(metrics.length, 2);

      /** counter1 data points are collected */
      assertMetricData(metrics[0], DataPointType.SINGULAR, {
        name: 'counter1'
      });
      assert.strictEqual(metrics[0].dataPoints.length, 1);

      /** observer1 data points are not collected */
      assertMetricData(metrics[1], DataPointType.SINGULAR, {
        name: 'observer1'
      });
      assert.strictEqual(metrics[1].dataPoints.length, 0);
    });
  });
});
