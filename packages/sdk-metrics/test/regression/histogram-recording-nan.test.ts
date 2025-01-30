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
import {
  AggregationTemporality,
  AggregationType,
  DataPoint,
  ExponentialHistogram,
  Histogram,
  MeterProvider,
} from '../../src';
import { TestMetricReader } from '../export/TestMetricReader';
import { IMetricReader } from '../../src/export/MetricReader';

describe('histogram-recording-nan', () => {
  it('exponential histogram should not count NaN', async () => {
    const reader = new TestMetricReader({
      aggregationTemporalitySelector() {
        return AggregationTemporality.CUMULATIVE;
      },
      aggregationSelector(type) {
        return { type: AggregationType.EXPONENTIAL_HISTOGRAM };
      },
    });
    const meterProvider = new MeterProvider({
      readers: [reader],
    });

    const meter = meterProvider.getMeter('my-meter');
    const hist = meter.createHistogram('testhist');

    hist.record(1);
    hist.record(2);
    hist.record(4);
    hist.record(NaN);

    const resourceMetrics1 = await collectNoErrors(reader);
    const dataPoint1 = resourceMetrics1.scopeMetrics[0].metrics[0]
      .dataPoints[0] as DataPoint<ExponentialHistogram>;

    assert.deepStrictEqual(
      dataPoint1.value.count,
      3,
      'Sum of bucket count values should match overall count'
    );
  });

  it('explicit bucket histogram should not count NaN', async () => {
    const reader = new TestMetricReader({
      aggregationTemporalitySelector() {
        return AggregationTemporality.CUMULATIVE;
      },
      aggregationSelector(type) {
        return { type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM };
      },
    });
    const meterProvider = new MeterProvider({
      readers: [reader],
    });

    const meter = meterProvider.getMeter('my-meter');
    const hist = meter.createHistogram('testhist');

    hist.record(1);
    hist.record(2);
    hist.record(4);
    hist.record(NaN);

    const resourceMetrics1 = await collectNoErrors(reader);
    const dataPoint1 = resourceMetrics1.scopeMetrics[0].metrics[0]
      .dataPoints[0] as DataPoint<Histogram>;

    assert.deepStrictEqual(
      dataPoint1.value.count,
      3,
      'Sum of bucket count values should match overall count'
    );
  });

  const collectNoErrors = async (reader: IMetricReader) => {
    const { resourceMetrics, errors } = await reader.collect();
    assert.strictEqual(errors.length, 0);
    return resourceMetrics;
  };
});
