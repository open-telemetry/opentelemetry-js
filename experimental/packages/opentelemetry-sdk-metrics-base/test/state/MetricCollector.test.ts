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
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { MetricData, PointDataType } from '../../src/export/MetricData';
import { MetricExporter } from '../../src/export/MetricExporter';
import { MetricReader } from '../../src/export/MetricReader';
import { Meter } from '../../src/Meter';
import { MeterProviderSharedState } from '../../src/state/MeterProviderSharedState';
import { MetricCollector } from '../../src/state/MetricCollector';
import { defaultInstrumentationLibrary, defaultResource, assertMetricData, assertPointData } from '../util';

class TestMetricExporter extends MetricExporter {
  metricDataList: MetricData[] = []
  async export(batch: MetricData[]): Promise<void> {
    this.metricDataList.push(...batch);
  }

  async forceFlush(): Promise<void> {}

  getPreferredAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE;
  }
}

class TestDeltaMetricExporter extends TestMetricExporter {
  override getPreferredAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.DELTA;
  }
}

class TestMetricReader extends MetricReader {
  getMetricCollector(): MetricCollector {
    return this['_metricProducer'] as MetricCollector;
  }
}

describe('MetricCollector', () => {
  afterEach(() => {
    sinon.restore();
  })

  describe('constructor', () => {
    it('should construct MetricCollector without exceptions', () => {
      const meterProviderSharedState = new MeterProviderSharedState(defaultResource);
      const exporters = [ new TestMetricExporter(), new TestDeltaMetricExporter() ];
      for (const exporter of exporters) {
        const reader = new TestMetricReader(exporter);
        const metricCollector = new MetricCollector(meterProviderSharedState, reader);

        assert.strictEqual(metricCollector.aggregatorTemporality, exporter.getPreferredAggregationTemporality());
      }
    });
  });

  describe('collect', () => {
    function setupInstruments(exporter: MetricExporter) {
      // TODO(legendecas): setup with MeterProvider when meter identity was settled.
      const meterProviderSharedState = new MeterProviderSharedState(defaultResource);

      const reader = new TestMetricReader(exporter);
      const metricCollector = new MetricCollector(meterProviderSharedState, reader);
      meterProviderSharedState.metricCollectors.push(metricCollector);

      const meter = new Meter(meterProviderSharedState, defaultInstrumentationLibrary);
      meterProviderSharedState.meters.set('test-meter', meter);

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
      const batch = await metricCollector.collect();
      assert(Array.isArray(batch));
      assert.strictEqual(batch.length, 2);

      /** checking batch[0] */
      const metricData1 = batch[0];
      assertMetricData(metricData1, PointDataType.SINGULAR, {
        name: 'counter1'
      }, defaultInstrumentationLibrary);
      assert.strictEqual(metricData1.pointData.length, 2);
      assertPointData(metricData1.pointData[0], {}, 1);
      assertPointData(metricData1.pointData[1], { foo: 'bar' }, 2);

      /** checking batch[1] */
      const metricData2 = batch[1];
      assertMetricData(metricData2, PointDataType.SINGULAR, {
        name: 'counter2'
      }, defaultInstrumentationLibrary);
      assert.strictEqual(metricData2.pointData.length, 1);
      assertPointData(metricData2.pointData[0], {}, 3);
    });
  });
});
