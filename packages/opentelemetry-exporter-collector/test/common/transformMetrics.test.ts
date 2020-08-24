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
import * as transform from '../../src/transformMetrics';
import {
  mockCounter,
  mockDoubleCounter,
  mockObserver,
  mockedResources,
  mockedInstrumentationLibraries,
  multiResourceMetrics,
  multiInstrumentationLibraryMetrics,
  ensureCounterIsCorrect,
  ensureDoubleCounterIsCorrect,
  ensureObserverIsCorrect,
  mockHistogram,
  ensureHistogramIsCorrect,
  ensureValueRecorderIsCorrect,
  mockValueRecorder,
} from '../helper';
import { MetricRecord, SumAggregator } from '@opentelemetry/metrics';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';

describe('transformMetrics', () => {
  describe('toCollectorMetric', () => {
    const counter: MetricRecord = mockCounter();
    const doubleCounter: MetricRecord = mockDoubleCounter();
    const observer: MetricRecord = mockObserver();
    const histogram: MetricRecord = mockHistogram();
    const recorder: MetricRecord = mockValueRecorder();
    const invalidMetric: MetricRecord = {
      descriptor: {
        name: 'name',
        description: 'description',
        unit: 'unit',
        metricKind: 8, // Not a valid metricKind
        valueType: 2, // Not double or int
      },
      labels: {},
      aggregator: new SumAggregator(),
      resource: new Resource({}),
      instrumentationLibrary: { name: 'x', version: 'y' },
    };
    beforeEach(() => {
      // Counter
      counter.aggregator.update(1);

      // Double Counter
      doubleCounter.aggregator.update(8);

      // Observer
      observer.aggregator.update(3);
      observer.aggregator.update(6);

      // Histogram
      histogram.aggregator.update(7);
      histogram.aggregator.update(14);

      // ValueRecorder
      recorder.aggregator.update(5);
    });

    it('should convert metric', () => {
      ensureCounterIsCorrect(
        transform.toCollectorMetric(counter, 1592602232694000000),
        hrTimeToNanoseconds(counter.aggregator.toPoint().timestamp)
      );
      ensureObserverIsCorrect(
        transform.toCollectorMetric(observer, 1592602232694000000),
        hrTimeToNanoseconds(observer.aggregator.toPoint().timestamp)
      );
      ensureHistogramIsCorrect(
        transform.toCollectorMetric(histogram, 1592602232694000000),
        hrTimeToNanoseconds(histogram.aggregator.toPoint().timestamp)
      );

      ensureValueRecorderIsCorrect(
        transform.toCollectorMetric(recorder, 1592602232694000000),
        hrTimeToNanoseconds(recorder.aggregator.toPoint().timestamp)
      );

      ensureDoubleCounterIsCorrect(
        transform.toCollectorMetric(doubleCounter, 1592602232694000000),
        hrTimeToNanoseconds(doubleCounter.aggregator.toPoint().timestamp)
      );

      const emptyMetric = transform.toCollectorMetric(
        invalidMetric,
        1592602232694000000
      );
      assert.deepStrictEqual(emptyMetric.int64DataPoints, []);
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
          instrumentationLibrary: { name: 'x', version: 'y' },
        },
        1592602232694000000
      );
      const collectorMetric =
        metric.int64DataPoints && metric.int64DataPoints[0];
      assert.strictEqual(collectorMetric?.labels[0].value, '1');
    });
  });
  describe('toCollectorMetricDescriptor', () => {
    describe('groupMetricsByResourceAndLibrary', () => {
      it('should group by resource', () => {
        const [resource1, resource2] = mockedResources;
        const [library] = mockedInstrumentationLibraries;
        const [metric1, metric2, metric3] = multiResourceMetrics;

        const expected = new Map([
          [resource1, new Map([[library, [metric1, metric3]]])],
          [resource2, new Map([[library, [metric2]]])],
        ]);

        const result = transform.groupMetricsByResourceAndLibrary(
          multiResourceMetrics
        );

        assert.deepStrictEqual(result, expected);
      });

      it('should group by instrumentation library', () => {
        const [resource] = mockedResources;
        const [lib1, lib2] = mockedInstrumentationLibraries;
        const [metric1, metric2, metric3] = multiInstrumentationLibraryMetrics;
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
          multiInstrumentationLibraryMetrics
        );

        assert.deepStrictEqual(result, expected);
      });
    });
  });
});
