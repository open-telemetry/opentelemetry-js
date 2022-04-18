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

import { hrTimeToNanoseconds, hrTime } from '@opentelemetry/core';
import { AggregationTemporality, DataPointType, InstrumentType } from '@opentelemetry/sdk-metrics-base';
import * as assert from 'assert';
import * as transform from '../../src/transformMetrics';
import {
  collect,
  ensureCounterIsCorrect,
  ensureDoubleCounterIsCorrect,
  ensureHistogramIsCorrect,
  ensureObservableCounterIsCorrect,
  ensureObservableGaugeIsCorrect,
  ensureObservableUpDownCounterIsCorrect,
  mockCounter,
  mockDoubleCounter,
  mockHistogram,
  mockObservableCounter,
  mockObservableGauge,
  mockObservableUpDownCounter,
  setUp,
} from '../metricsHelper';

describe('transformMetrics', () => {
  describe('toCollectorMetric', async () => {

    function getValue(count: number) {
      if (count % 2 === 0) {
        return 3;
      }
      return -1;
    }

    beforeEach(() => {
      setUp();
    });

    it('should convert counter', async () => {
        const counter = mockCounter();
        counter.add(1);
        const metrics = (await collect());

        const metric = metrics.instrumentationLibraryMetrics[0].metrics[0];
        ensureCounterIsCorrect(
          transform.toCollectorMetric(metric),
          hrTimeToNanoseconds(metric.dataPoints[0].endTime),
          hrTimeToNanoseconds(metric.dataPoints[0].startTime)
        );
      }
    );

    it('should convert double counter', async () => {
        const doubleCounter = mockDoubleCounter();
        doubleCounter.add(8);
        const metrics = (await collect());

        const metric = metrics.instrumentationLibraryMetrics[0].metrics[0];
        ensureDoubleCounterIsCorrect(
          transform.toCollectorMetric(metric),
          hrTimeToNanoseconds(metric.dataPoints[0].endTime),
          hrTimeToNanoseconds(metric.dataPoints[0].startTime),
        );
      }
    );

    it('should convert observable gauge', async () => {
        let count = 0;
        mockObservableGauge(observableResult => {
          count++;
          observableResult.observe(getValue(count), {});
        });

        // collect three times.
        await collect();
        await collect();
        const metrics = (await collect());

        const metric = metrics.instrumentationLibraryMetrics[0].metrics[0];
        ensureObservableGaugeIsCorrect(
          transform.toCollectorMetric(metric),
          hrTimeToNanoseconds(metric.dataPoints[0].endTime),
          hrTimeToNanoseconds(metric.dataPoints[0].startTime),
          -1,
        );
      }
    );


    it('should convert observable counter', async () => {
        mockObservableCounter(observableResult => {
          observableResult.observe(1, {});
        });

        // collect three times.
        await collect();
        await collect();
        const metrics = (await collect());
        // TODO: Collect seems to not deliver the last observation -> why?

        const metric = metrics.instrumentationLibraryMetrics[0].metrics[0];
        ensureObservableCounterIsCorrect(
          transform.toCollectorMetric(metric),
          hrTimeToNanoseconds(metric.dataPoints[0].endTime),
          hrTimeToNanoseconds(metric.dataPoints[0].startTime),
          2,
        );
      }
    );

    it('should convert observable up-down counter', async () => {
        mockObservableUpDownCounter(observableResult => {
          observableResult.observe(1, {});
        });

        // collect three times.
        await collect();
        await collect();
        const metrics = (await collect());
        // TODO: Collect seems to not deliver the last observation -> why?

        const metric = metrics.instrumentationLibraryMetrics[0].metrics[0];
        ensureObservableUpDownCounterIsCorrect(
          transform.toCollectorMetric(metric),
          hrTimeToNanoseconds(metric.dataPoints[0].endTime),
          hrTimeToNanoseconds(metric.dataPoints[0].startTime),
          2,
        );
      }
    );

    it('should convert observable histogram', async () => {
        const histogram = mockHistogram();
        histogram.record(7);
        histogram.record(14);

        const metrics = (await collect());

        const metric = metrics.instrumentationLibraryMetrics[0].metrics[0];
        ensureHistogramIsCorrect(
          transform.toCollectorMetric(metric),
          hrTimeToNanoseconds(metric.dataPoints[0].endTime),
          hrTimeToNanoseconds(metric.dataPoints[0].startTime),
          [0, 100],
          [0, 2, 0]
        );
      }
    );

    it('should convert metric attributes value to string', () => {
      const metric = transform.toCollectorMetric(
        {
          descriptor: {
            name: 'name',
            description: 'description',
            unit: 'unit',
            type: InstrumentType.COUNTER,
            valueType: 0,
          },
          aggregationTemporality: AggregationTemporality.CUMULATIVE,
          dataPoints: [
            {
              value: 1,
              attributes: { foo: (1 as unknown) as string },
              startTime: hrTime(),
              endTime: hrTime(),
            }
          ],
          dataPointType: DataPointType.SINGULAR,
        },
      );
      const collectorMetric = metric.intSum?.dataPoints[0];
      assert.strictEqual(collectorMetric?.labels[0].value, '1');
    });
  });
});
