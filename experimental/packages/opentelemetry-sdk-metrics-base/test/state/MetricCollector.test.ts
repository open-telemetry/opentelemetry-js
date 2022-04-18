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
import { MeterProvider } from '../../src';
import { DataPointType } from '../../src/export/MetricData';
import { PushMetricExporter } from '../../src/export/MetricExporter';
import { MeterProviderSharedState } from '../../src/state/MeterProviderSharedState';
import { MetricCollector } from '../../src/state/MetricCollector';
import { defaultInstrumentationLibrary, defaultResource, assertMetricData, assertDataPoint } from '../util';
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
        const reader = new TestMetricReader(exporter.getAggregationTemporality);
        assert.doesNotThrow(() => new MetricCollector(meterProviderSharedState, reader));
      }
    });
  });

  describe('collect', () => {

    function setupInstruments(exporter: PushMetricExporter) {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader(exporter.getAggregationTemporality);
      meterProvider.addMetricReader(reader);
      const metricCollector = reader.getMetricCollector();

      const meter = meterProvider.getMeter(defaultInstrumentationLibrary.name, defaultInstrumentationLibrary.version, {
        schemaUrl: defaultInstrumentationLibrary.schemaUrl,
      });

      return { metricCollector, meter };
    }

    it('should collect metrics', async () => {
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
      const { instrumentationLibraryMetrics } = await metricCollector.collect();
      const { metrics } = instrumentationLibraryMetrics[0];
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
  });
});
