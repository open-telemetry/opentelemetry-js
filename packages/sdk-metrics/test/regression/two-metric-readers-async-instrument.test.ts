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
import { DataPointType, MeterProvider } from '../../src';
import { TestDeltaMetricReader } from '../export/TestMetricReader';
import { assertDataPoint, assertMetricData } from '../util';
import { IMetricReader } from '../../src/export/MetricReader';

// https://github.com/open-telemetry/opentelemetry-js/issues/3664

describe('two-metric-readers-async-instrument', () => {
  it('both metric readers should collect metrics', async () => {
    const reader1 = new TestDeltaMetricReader();
    const reader2 = new TestDeltaMetricReader();
    const meterProvider = new MeterProvider({
      readers: [reader1, reader2],
    });

    const meter = meterProvider.getMeter('my-meter');

    let counter = 1;
    const asyncUpDownCounter = meter.createObservableUpDownCounter(
      'my_async_updowncounter'
    );
    asyncUpDownCounter.addCallback(observableResult => {
      observableResult.observe(counter);
    });

    await assertCollection(reader1, 1);
    await assertCollection(reader2, 1);

    counter = 10;
    await assertCollection(reader1, 9);
    await assertCollection(reader2, 9);

    async function assertCollection(reader: IMetricReader, value: number) {
      const { errors, resourceMetrics } = await reader.collect();
      assert.strictEqual(errors.length, 0);

      // Collected only one Metric.
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];

      assertMetricData(metric, DataPointType.SUM, {
        name: 'my_async_updowncounter',
      });
      assertDataPoint(metric.dataPoints[0], {}, value);
    }
  });
});
