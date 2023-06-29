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
  Aggregation,
  AggregationTemporality,
  InstrumentType,
  MeterProvider,
  MetricReader,
} from '../../src';
import { TestMetricReader } from '../export/TestMetricReader';

describe('cumulative-exponential-histogram', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    sinon.restore();
  });

  it('Cumulative Histogram should have the same startTime every collection', async () => {
    // Works fine and passes
    await doTest(Aggregation.Histogram());
  });

  it('Cumulative ExponentialHistogram should have the same startTime every collection', async () => {
    // Fails
    await doTest(Aggregation.ExponentialHistogram());
  });

  const doTest = async (histogramAggregation: Aggregation) => {
    const meterProvider = new MeterProvider();
    const reader = new TestMetricReader({
      aggregationTemporalitySelector() {
        return AggregationTemporality.CUMULATIVE;
      },
      aggregationSelector(type) {
        return type === InstrumentType.HISTOGRAM
          ? histogramAggregation
          : Aggregation.Default();
      },
    });

    meterProvider.addMetricReader(reader);
    const meter = meterProvider.getMeter('my-meter');
    const hist = meter.createHistogram('testhist');

    hist.record(1);

    const resourceMetrics1 = await collectNoErrors(reader);
    const dataPoint1 =
      resourceMetrics1.scopeMetrics[0].metrics[0].dataPoints[0];

    clock.tick(1000);
    hist.record(2);

    const resourceMetrics2 = await collectNoErrors(reader);
    const dataPoint2 =
      resourceMetrics2.scopeMetrics[0].metrics[0].dataPoints[0];

    assert.deepStrictEqual(
      dataPoint1.startTime,
      dataPoint2.startTime,
      'The start time should be the same across cumulative collections'
    );
  };

  const collectNoErrors = async (reader: MetricReader) => {
    const { resourceMetrics, errors } = await reader.collect();
    assert.strictEqual(errors.length, 0);
    return resourceMetrics;
  };
});
