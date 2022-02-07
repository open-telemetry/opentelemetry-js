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
import { Meter, MeterProvider } from '../../src';
import { defaultInstrumentationLibrary, defaultResource, sleep } from '../util';
import { TestMetricReader } from '../export/TestMetricReader';
import { TestDeltaMetricExporter, TestMetricExporter } from '../export/TestMetricExporter';
import { MeterSharedState } from '../../src/state/MeterSharedState';

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

      return { metricCollectors, meter, meterSharedState };
    }

    it('should collect metrics', async () => {
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
  });
});
