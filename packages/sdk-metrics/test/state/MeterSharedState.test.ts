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
import {
  MeterProvider,
  DataPointType,
  View,
  Aggregation,
  MetricReader,
  InstrumentType,
} from '../../src';
import {
  assertMetricData,
  defaultInstrumentationScope,
  defaultResource,
  sleep,
} from '../util';
import {
  TestDeltaMetricReader,
  TestMetricReader,
} from '../export/TestMetricReader';
import { MeterSharedState } from '../../src/state/MeterSharedState';
import { CollectionResult } from '../../src/export/MetricData';
import { Meter } from '../../src/Meter';

describe('MeterSharedState', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('registerMetricStorage', () => {
    function setupMeter(views?: View[], readers?: MetricReader[]) {
      const meterProvider = new MeterProvider({
        resource: defaultResource,
        views,
      });
      readers?.forEach(reader => meterProvider.addMetricReader(reader));

      const meter = meterProvider.getMeter('test-meter');

      return {
        meter,
        meterSharedState: meterProvider['_sharedState'].getMeterSharedState({
          name: 'test-meter',
        }),
        collectors: Array.from(meterProvider['_sharedState'].metricCollectors),
      };
    }

    it('should register metric storages with views', () => {
      const reader = new TestMetricReader({
        aggregationSelector: () => {
          throw new Error('should not be called');
        },
      });
      const { meter, meterSharedState, collectors } = setupMeter(
        [new View({ instrumentName: 'test-counter' })],
        [reader]
      );

      meter.createCounter('test-counter');
      const metricStorages = meterSharedState.metricStorageRegistry.getStorages(
        collectors[0]
      );

      assert.strictEqual(metricStorages.length, 1);
      assert.strictEqual(
        metricStorages[0].getInstrumentDescriptor().name,
        'test-counter'
      );
    });

    it('should register metric storages with views', () => {
      const reader = new TestMetricReader({
        aggregationSelector: () => {
          throw new Error('should not be called');
        },
      });
      const { meter, meterSharedState, collectors } = setupMeter(
        [new View({ instrumentName: 'test-counter' })],
        [reader]
      );

      meter.createCounter('test-counter');
      const metricStorages = meterSharedState.metricStorageRegistry.getStorages(
        collectors[0]
      );

      assert.strictEqual(metricStorages.length, 1);
      assert.strictEqual(
        metricStorages[0].getInstrumentDescriptor().name,
        'test-counter'
      );
    });

    it('should register metric storages with the collector', () => {
      const reader = new TestMetricReader({
        aggregationSelector: (instrumentType: InstrumentType) => {
          return Aggregation.Drop();
        },
      });
      const readerAggregationSelectorSpy = sinon.spy(
        reader,
        'selectAggregation'
      );

      const { meter, meterSharedState, collectors } = setupMeter(
        [] /** no views registered */,
        [reader]
      );

      meter.createCounter('test-counter');
      const metricStorages = meterSharedState.metricStorageRegistry.getStorages(
        collectors[0]
      );

      // Should select aggregation with the metric reader.
      assert.strictEqual(readerAggregationSelectorSpy.callCount, 1);
      assert.strictEqual(metricStorages.length, 1);
      assert.strictEqual(
        metricStorages[0].getInstrumentDescriptor().name,
        'test-counter'
      );
    });

    it('should register metric storages with collectors', () => {
      const reader = new TestMetricReader({
        aggregationSelector: (instrumentType: InstrumentType) => {
          return Aggregation.Drop();
        },
      });
      const reader2 = new TestMetricReader({
        aggregationSelector: (instrumentType: InstrumentType) => {
          return Aggregation.LastValue();
        },
      });

      const { meter, meterSharedState, collectors } = setupMeter(
        [] /** no views registered */,
        [reader, reader2]
      );

      meter.createCounter('test-counter');
      const metricStorages = meterSharedState.metricStorageRegistry.getStorages(
        collectors[0]
      );
      const metricStorages2 =
        meterSharedState.metricStorageRegistry.getStorages(collectors[1]);

      // Should select aggregation with the metric reader.
      assert.strictEqual(metricStorages.length, 1);
      assert.strictEqual(
        metricStorages[0].getInstrumentDescriptor().name,
        'test-counter'
      );

      assert.strictEqual(metricStorages2.length, 1);
      assert.strictEqual(
        metricStorages2[0].getInstrumentDescriptor().name,
        'test-counter'
      );

      assert.notStrictEqual(
        metricStorages[0],
        metricStorages2[0],
        'should create a distinct metric storage for each metric reader'
      );
    });
  });

  describe('collect', () => {
    function setupInstruments(views?: View[]) {
      const meterProvider = new MeterProvider({
        resource: defaultResource,
        views: views,
      });

      const cumulativeReader = new TestMetricReader();
      meterProvider.addMetricReader(cumulativeReader);
      const cumulativeCollector = cumulativeReader.getMetricCollector();

      const deltaReader = new TestDeltaMetricReader();
      meterProvider.addMetricReader(deltaReader);
      const deltaCollector = deltaReader.getMetricCollector();

      const metricCollectors = [cumulativeCollector, deltaCollector];

      const meter = meterProvider.getMeter(
        defaultInstrumentationScope.name,
        defaultInstrumentationScope.version,
        {
          schemaUrl: defaultInstrumentationScope.schemaUrl,
        }
      ) as Meter;
      const meterSharedState = meter['_meterSharedState'] as MeterSharedState;

      return {
        metricCollectors,
        cumulativeCollector,
        deltaCollector,
        meter,
        meterSharedState,
      };
    }

    it('should collect sync metrics', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter } = setupInstruments();

      /** creating metric events */
      const counter = meter.createCounter('test');

      /** collect metrics */
      counter.add(1);
      await Promise.all(
        metricCollectors.map(async collector => {
          const { resourceMetrics, errors } = await collector.collect();
          assert.strictEqual(errors.length, 0);
          assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
          assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
          assertMetricData(
            resourceMetrics.scopeMetrics[0].metrics[0],
            DataPointType.SUM,
            {
              name: 'test',
            }
          );
        })
      );
    });

    it('should collect sync metrics with views', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter } = setupInstruments([
        new View({ name: 'foo', instrumentName: 'test' }),
        new View({ name: 'bar', instrumentName: 'test' }),
      ]);

      /** creating metric events */
      const counter = meter.createCounter('test');

      /** collect metrics */
      counter.add(1);
      await Promise.all(
        metricCollectors.map(async collector => {
          const { resourceMetrics, errors } = await collector.collect();
          assert.strictEqual(errors.length, 0);
          assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
          assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 2);
          assertMetricData(
            resourceMetrics.scopeMetrics[0].metrics[0],
            DataPointType.SUM,
            {
              name: 'foo',
            }
          );
          assertMetricData(
            resourceMetrics.scopeMetrics[0].metrics[1],
            DataPointType.SUM,
            {
              name: 'bar',
            }
          );
        })
      );
    });

    it('should collect async metrics with callbacks', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter } = setupInstruments();

      /** creating metric events */
      let observableCalledCount = 0;
      const observableCounter = meter.createObservableCounter('test');
      observableCounter.addCallback(observableResult => {
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
      // the callback is called each time the collection initiated.
      assert.strictEqual(observableCalledCount, 3);

      /** collect metrics */
      await Promise.all([
        // initiate collection concurrently.
        ...metricCollectors.map(collector => collector.collect()),
        sleep(1).then(() => metricCollectors[0].collect()),
      ]);
      assert.strictEqual(observableCalledCount, 6);
    });

    it('should call observable callback once with view-ed async instruments', async () => {
      /** preparing test instrumentations */
      const { metricCollectors, meter } = setupInstruments([
        new View({ name: 'foo', instrumentName: 'test' }),
        new View({ name: 'bar', instrumentName: 'test' }),
      ]);

      /** creating metric events */
      let observableCalledCount = 0;
      const observableCounter = meter.createObservableCounter('test');
      observableCounter.addCallback(observableResult => {
        observableCalledCount++;
        observableResult.observe(1);

        // async observers.
        return sleep(10);
      });

      function verifyResult(collectionResult: CollectionResult) {
        const { resourceMetrics, errors } = collectionResult;
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 2);
        assertMetricData(
          resourceMetrics.scopeMetrics[0].metrics[0],
          DataPointType.SUM,
          {
            name: 'foo',
          }
        );
        assertMetricData(
          resourceMetrics.scopeMetrics[0].metrics[1],
          DataPointType.SUM,
          {
            name: 'bar',
          }
        );
      }

      /** collect metrics */
      await Promise.all([
        // initiate collection concurrently.
        ...metricCollectors.map(collector =>
          collector.collect().then(verifyResult)
        ),
        sleep(1).then(() => metricCollectors[0].collect().then(verifyResult)),
      ]);
      /**
       * Two collectors, one collects 2 times, one collects 1 time.
       */
      assert.strictEqual(observableCalledCount, 3);

      /** collect metrics */
      await Promise.all([
        // initiate collection concurrently.
        ...metricCollectors.map(collector =>
          collector.collect().then(verifyResult)
        ),
        sleep(1).then(() => metricCollectors[0].collect().then(verifyResult)),
      ]);
      assert.strictEqual(observableCalledCount, 6);
    });
  });
});
