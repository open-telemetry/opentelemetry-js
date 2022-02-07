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
import { Meter, MeterProvider, MetricData, PointDataType } from '../../src';
import { assertMetricData, defaultInstrumentationLibrary, defaultResource, sleep } from '../util';
import { TestMetricReader } from '../export/TestMetricReader';
import { TestDeltaMetricExporter, TestMetricExporter } from '../export/TestMetricExporter';
import { MeterSharedState } from '../../src/state/MeterSharedState';
import { View } from '../../src/view/View';
import { InstrumentSelector } from '../../src/view/InstrumentSelector';
import { MeterSelector } from '../../src/view/MeterSelector';

describe('MeterSharedState', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('collect', () => {
    function setupInstruments() {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const cumulativeReader = new TestMetricReader(new TestMetricExporter().getPreferredAggregationTemporality());
      meterProvider.addMetricReader(cumulativeReader);
      const cumulativeCollector = cumulativeReader.getMetricCollector();

      const deltaReader = new TestMetricReader(new TestDeltaMetricExporter().getPreferredAggregationTemporality());
      meterProvider.addMetricReader(deltaReader);
      const deltaCollector = deltaReader.getMetricCollector();

      const metricCollectors = [cumulativeCollector, deltaCollector];

      const meter = meterProvider.getMeter(defaultInstrumentationLibrary.name, defaultInstrumentationLibrary.version, {
        schemaUrl: defaultInstrumentationLibrary.schemaUrl,
      }) as Meter;
      const meterSharedState = meter['_meterSharedState'] as MeterSharedState;

      return { metricCollectors, cumulativeCollector, deltaCollector, meter, meterSharedState, meterProvider };
    }

    it('should collect sync metrics', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter } = setupInstruments();

      /** creating metric events */
      const counter = meter.createCounter('test');

      /** collect metrics */
      counter.add(1);
      await Promise.all(metricCollectors.map(async collector => {
        const result = await collector.collect();
        assert.strictEqual(result.length, 1);
        assertMetricData(result[0], PointDataType.SINGULAR, {
          name: 'test',
        });
      }));
    });

    it('should collect sync metrics with views', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter, meterProvider } = setupInstruments();

      /** creating metric events */
      meterProvider.addView(
        new View({ name: 'foo' }),
        new InstrumentSelector({ name: 'test' }),
        new MeterSelector());
      meterProvider.addView(
        new View({ name: 'bar' }),
        new InstrumentSelector({ name: 'test' }),
        new MeterSelector());

      const counter = meter.createCounter('test');

      /** collect metrics */
      counter.add(1);
      await Promise.all(metricCollectors.map(async collector => {
        const result = await collector.collect();
        assert.strictEqual(result.length, 2);
        assertMetricData(result[0], PointDataType.SINGULAR, {
          name: 'foo',
        });
        assertMetricData(result[1], PointDataType.SINGULAR, {
          name: 'bar',
        });
      }));
    });

    it('should collect async metrics without concurrent callback', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter } = setupInstruments();

      /** creating metric events */
      let observableCalledCount = 0;
      meter.createObservableCounter('test', observableResult => {
        observableCalledCount++;
        observableResult.observe(1);

        // async observers.
        return sleep(10);
      });

      /** collect metrics */
      await Promise.all([
        // initiate collection concurrently.
        ...metricCollectors.map(collector => collector.collect()),
        sleep(1).then(() => metricCollectors[0].collect()),
      ]);
      assert.strictEqual(observableCalledCount, 1);

      /** collect metrics */
      await Promise.all([
        // initiate collection concurrently.
        ...metricCollectors.map(collector => collector.collect()),
        sleep(1).then(() => metricCollectors[0].collect()),
      ]);
      assert.strictEqual(observableCalledCount, 2);
    });

    it('should call one observable callback once with views', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter, meterProvider } = setupInstruments();

      /** creating metric events */
      meterProvider.addView(
        new View({ name: 'foo' }),
        new InstrumentSelector({ name: 'test' }),
        new MeterSelector());
      meterProvider.addView(
        new View({ name: 'bar' }),
        new InstrumentSelector({ name: 'test' }),
        new MeterSelector());

      let observableCalledCount = 0;
      meter.createObservableCounter('test', observableResult => {
        observableCalledCount++;
        observableResult.observe(1);

        // async observers.
        return sleep(10);
      });

      function verifyResult(metricData: MetricData[]) {
        assert.strictEqual(metricData.length, 2);
        assertMetricData(metricData[0], PointDataType.SINGULAR, {
          name: 'foo'
        });
        assertMetricData(metricData[1], PointDataType.SINGULAR, {
          name: 'bar'
        });
      }

      /** collect metrics */
      await Promise.all([
        // initiate collection concurrently.
        ...metricCollectors.map(collector => collector.collect().then(verifyResult)),
        sleep(1).then(() => metricCollectors[0].collect().then(verifyResult)),
      ]);
      assert.strictEqual(observableCalledCount, 1);

      /** collect metrics */
      await Promise.all([
        // initiate collection concurrently.
        ...metricCollectors.map(collector => collector.collect().then(verifyResult)),
        sleep(1).then(() => metricCollectors[0].collect().then(verifyResult)),
      ]);
      assert.strictEqual(observableCalledCount, 2);
    });
  });
});
