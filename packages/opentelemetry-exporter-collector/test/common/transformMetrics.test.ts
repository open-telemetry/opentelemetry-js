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
  ensureCounterIsCorrect,
  ensureDoubleCounterIsCorrect,
  ensureObserverIsCorrect,
  ensureValueRecorderIsCorrect,
  mockValueRecorder,
  mockedResources,
  mockedInstrumentationLibraries,
  multiResourceMetricsGet,
  multiInstrumentationLibraryMetricsGet,
} from '../helper';
import { MetricRecord, SumAggregator } from '@opentelemetry/metrics';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';

describe('transformMetrics', () => {
  describe('toCollectorMetric', async () => {
    const counter: MetricRecord = await mockCounter();
    const doubleCounter: MetricRecord = await mockDoubleCounter();
    const observer: MetricRecord = await mockObserver();
    const recorder: MetricRecord = await mockValueRecorder();
    beforeEach(() => {
      // Counter
      counter.aggregator.update(1);

      // Double Counter
      doubleCounter.aggregator.update(8);

      // Observer
      observer.aggregator.update(3);
      observer.aggregator.update(6);

      // ValueRecorder
      recorder.aggregator.update(7);
      recorder.aggregator.update(14);
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

      ensureValueRecorderIsCorrect(
        transform.toCollectorMetric(recorder, 1592602232694000000),
        hrTimeToNanoseconds(recorder.aggregator.toPoint().timestamp)
      );

      ensureDoubleCounterIsCorrect(
        transform.toCollectorMetric(doubleCounter, 1592602232694000000),
        hrTimeToNanoseconds(doubleCounter.aggregator.toPoint().timestamp)
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
      const [metric1, metric2, metric3] = await multiResourceMetricsGet();

      const expected = new Map([
        [resource1, new Map([[library, [metric1, metric3]]])],
        [resource2, new Map([[library, [metric2]]])],
      ]);

      const result = transform.groupMetricsByResourceAndLibrary(
        await multiResourceMetricsGet()
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
      ] = await multiInstrumentationLibraryMetricsGet();
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
        await multiInstrumentationLibraryMetricsGet()
      );

      assert.deepStrictEqual(result, expected);
    });
  });
});
