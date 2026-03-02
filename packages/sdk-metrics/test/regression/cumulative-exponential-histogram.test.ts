/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  AggregationOption,
  AggregationTemporality,
  AggregationType,
  InstrumentType,
  MeterProvider,
} from '../../src';
import { TestMetricReader } from '../export/TestMetricReader';
import { IMetricReader } from '../../src/export/MetricReader';

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
    await doTest({ type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM });
  });

  it('Cumulative ExponentialHistogram should have the same startTime every collection', async () => {
    // Fails
    await doTest({ type: AggregationType.EXPONENTIAL_HISTOGRAM });
  });

  const doTest = async (histogramAggregation: AggregationOption) => {
    const reader = new TestMetricReader({
      aggregationTemporalitySelector() {
        return AggregationTemporality.CUMULATIVE;
      },
      aggregationSelector(type) {
        return type === InstrumentType.HISTOGRAM
          ? histogramAggregation
          : { type: AggregationType.DEFAULT };
      },
    });
    const meterProvider = new MeterProvider({
      readers: [reader],
    });

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

  const collectNoErrors = async (reader: IMetricReader) => {
    const { resourceMetrics, errors } = await reader.collect();
    assert.strictEqual(errors.length, 0);
    return resourceMetrics;
  };
});
