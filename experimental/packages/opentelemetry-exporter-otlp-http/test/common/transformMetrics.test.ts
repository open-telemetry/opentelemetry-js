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
import {
  Counter,
  ObservableCounter,
  ObservableUpDownCounter,
  ObservableGauge,
  Histogram,
} from '@opentelemetry/api-metrics';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import {
  BoundCounter,
  BoundObservable,
  BoundHistogram,
  Metric,
  SumAggregator,
} from '@opentelemetry/sdk-metrics-base';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as transform from '../../src/transformMetrics';
import {
  ensureCounterIsCorrect,
  ensureDoubleCounterIsCorrect,
  ensureObservableGaugeIsCorrect,
  ensureObservableCounterIsCorrect,
  ensureObservableUpDownCounterIsCorrect,
  ensureHistogramIsCorrect,
  mockCounter,
  mockDoubleCounter,
  mockedInstrumentationLibraries,
  mockedResources,
  mockObservableGauge,
  mockObservableCounter,
  mockObservableUpDownCounter,
  mockHistogram,
  multiInstrumentationLibraryMetricsGet,
  multiResourceMetricsGet,
} from '../helper';

describe('transformMetrics', () => {
  describe('toCollectorMetric', async () => {
    let counter: Metric<BoundCounter> & Counter;
    let doubleCounter: Metric<BoundCounter> & Counter;
    let observableGauge: Metric<BoundObservable> & ObservableGauge;
    let observableCounter: Metric<BoundObservable> & ObservableCounter;
    let observableUpDownCounter: Metric<BoundObservable> & ObservableUpDownCounter;
    let histogram: Metric<BoundHistogram> & Histogram;
    beforeEach(() => {
      counter = mockCounter();
      doubleCounter = mockDoubleCounter();
      let count1 = 0;
      let count2 = 0;
      let count3 = 0;

      function getValue(count: number) {
        if (count % 2 === 0) {
          return 3;
        }
        return -1;
      }

      observableGauge = mockObservableGauge(observableResult => {
        count1++;
        observableResult.observe(getValue(count1), {});
      });

      observableCounter = mockObservableCounter(observableResult => {
        count2++;
        observableResult.observe(getValue(count2), {});
      });

      observableUpDownCounter = mockObservableUpDownCounter(observableResult => {
        count3++;
        observableResult.observe(getValue(count3), {});
      });

      histogram = mockHistogram();

      // Counter
      counter.add(1);

      // Double Counter
      doubleCounter.add(8);

      // Histogram
      histogram.record(7);
      histogram.record(14);
    });

    it('should convert metric', async () => {
      const counterMetric = (await counter.getMetricRecord())[0];
      ensureCounterIsCorrect(
        transform.toCollectorMetric(counterMetric, 1592602232694000000),
        hrTimeToNanoseconds(await counterMetric.aggregator.toPoint().timestamp)
      );

      const doubleCounterMetric = (await doubleCounter.getMetricRecord())[0];
      ensureDoubleCounterIsCorrect(
        transform.toCollectorMetric(doubleCounterMetric, 1592602232694000000),
        hrTimeToNanoseconds(doubleCounterMetric.aggregator.toPoint().timestamp)
      );

      await observableGauge.getMetricRecord();
      await observableGauge.getMetricRecord();
      const observableGaugeMetric = (await observableGauge.getMetricRecord())[0];
      ensureObservableGaugeIsCorrect(
        transform.toCollectorMetric(observableGaugeMetric, 1592602232694000000),
        hrTimeToNanoseconds(observableGaugeMetric.aggregator.toPoint().timestamp),
        -1
      );

      // collect 3 times
      await observableCounter.getMetricRecord();
      await observableCounter.getMetricRecord();
      const observableCounterMetric = (await observableCounter.getMetricRecord())[0];
      ensureObservableCounterIsCorrect(
        transform.toCollectorMetric(observableCounterMetric, 1592602232694000000),
        hrTimeToNanoseconds(observableCounterMetric.aggregator.toPoint().timestamp),
        3
      );

      // collect 3 times
      await observableUpDownCounter.getMetricRecord();
      await observableUpDownCounter.getMetricRecord();
      const observableUpDownCounterMetric = (
        await observableUpDownCounter.getMetricRecord()
      )[0];
      ensureObservableUpDownCounterIsCorrect(
        transform.toCollectorMetric(
          observableUpDownCounterMetric,
          1592602232694000000
        ),
        hrTimeToNanoseconds(
          observableUpDownCounterMetric.aggregator.toPoint().timestamp
        ),
        -1
      );

      const histogramMetric = (await histogram.getMetricRecord())[0];
      ensureHistogramIsCorrect(
        transform.toCollectorMetric(histogramMetric, 1592602232694000000),
        hrTimeToNanoseconds(histogramMetric.aggregator.toPoint().timestamp),
        [0, 100],
        [0, 2, 0]
      );
    });

    it('should convert metric labels value to string', () => {
      const metric = transform.toCollectorMetric(
        {
          descriptor: {
            name: 'name',
            description: 'description',
            unit: 'unit',
            metricKind: 0,
            valueType: 0,
          },
          labels: { foo: (1 as unknown) as string },
          aggregator: new SumAggregator(),
          resource: new Resource({}),
          aggregationTemporality: 0,
          instrumentationLibrary: { name: 'x', version: 'y' },
        },
        1592602232694000000
      );
      const collectorMetric = metric.intSum?.dataPoints[0];
      assert.strictEqual(collectorMetric?.labels[0].value, '1');
    });
  });

  describe('groupMetricsByResourceAndLibrary', () => {
    it('should group by resource', async () => {
      const [resource1, resource2] = mockedResources;
      const [library] = mockedInstrumentationLibraries;
      const [metric1, metric2, metric3] = multiResourceMetricsGet(
        observableResult => {
          observableResult.observe(1, {});
        }
      );

      const expected = new Map([
        [resource1, new Map([[library, [metric1, metric3]]])],
        [resource2, new Map([[library, [metric2]]])],
      ]);

      const result = transform.groupMetricsByResourceAndLibrary(
        multiResourceMetricsGet(observableResult => {
          observableResult.observe(1, {});
        })
      );

      assert.deepStrictEqual(result, expected);
    });

    it('should group by instrumentation library', async () => {
      const [resource] = mockedResources;
      const [lib1, lib2] = mockedInstrumentationLibraries;
      const [
        metric1,
        metric2,
        metric3,
      ] = multiInstrumentationLibraryMetricsGet(observableResult => {});
      const expected = new Map([
        [
          resource,
          new Map([
            [lib1, [metric1, metric3]],
            [lib2, [metric2]],
          ]),
        ],
      ]);

      const result = transform.groupMetricsByResourceAndLibrary(
        multiInstrumentationLibraryMetricsGet(observableResult => {})
      );

      assert.deepStrictEqual(result, expected);
    });
  });
});
