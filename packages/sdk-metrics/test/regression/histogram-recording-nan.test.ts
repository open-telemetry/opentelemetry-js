/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
