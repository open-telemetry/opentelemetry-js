/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  NoopMeter,
  NOOP_COUNTER_METRIC,
  NOOP_HISTOGRAM_METRIC,
  NOOP_OBSERVABLE_COUNTER_METRIC,
  NOOP_OBSERVABLE_GAUGE_METRIC,
  NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC,
  NOOP_UP_DOWN_COUNTER_METRIC,
  createNoopMeter,
  NOOP_GAUGE_METRIC,
} from '../../../src/metrics/NoopMeter';
import { NoopMeterProvider } from '../../../src/metrics/NoopMeterProvider';

const attributes = {};
const options = {
  component: 'tests',
  description: 'the testing package',
};

describe('NoopMeter', function () {
  it('constructor should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    assert.ok(meter instanceof NoopMeter);
  });

  it('counter should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const counter = meter.createCounter('some-name');

    // ensure NoopMetric does not crash.
    counter.add(1, attributes);

    // ensure the correct noop const is returned
    assert.strictEqual(counter, NOOP_COUNTER_METRIC);

    const counterWithOptions = meter.createCounter('some-name', options);
    assert.strictEqual(counterWithOptions, NOOP_COUNTER_METRIC);
  });

  it('histogram should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const histogram = meter.createHistogram('some-name');
    histogram.record(1, attributes);

    // ensure the correct noop const is returned
    assert.strictEqual(histogram, NOOP_HISTOGRAM_METRIC);

    const histogramWithOptions = meter.createHistogram('some-name', options);
    assert.strictEqual(histogramWithOptions, NOOP_HISTOGRAM_METRIC);
  });

  it('up down counter should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const upDownCounter = meter.createUpDownCounter('some-name');
    upDownCounter.add(1, attributes);

    // ensure the correct noop const is returned
    assert.strictEqual(upDownCounter, NOOP_UP_DOWN_COUNTER_METRIC);

    const upDownCounterWithOptions = meter.createUpDownCounter(
      'some-name',
      options
    );
    assert.strictEqual(upDownCounterWithOptions, NOOP_UP_DOWN_COUNTER_METRIC);
  });

  it('observable counter should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const observableCounter = meter.createObservableCounter('some-name');
    observableCounter.addCallback(() => {});

    // ensure the correct noop const is returned
    assert.strictEqual(observableCounter, NOOP_OBSERVABLE_COUNTER_METRIC);

    const observableCounterWithOptions = meter.createObservableCounter(
      'some-name',
      options
    );
    assert.strictEqual(
      observableCounterWithOptions,
      NOOP_OBSERVABLE_COUNTER_METRIC
    );
  });

  it('observable gauge should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const observableGauge = meter.createObservableGauge('some-name');
    observableGauge.addCallback(() => {});

    // ensure the correct noop const is returned
    assert.strictEqual(observableGauge, NOOP_OBSERVABLE_GAUGE_METRIC);

    const observableGaugeWithOptions = meter.createObservableGauge(
      'some-name',
      options
    );
    assert.strictEqual(
      observableGaugeWithOptions,
      NOOP_OBSERVABLE_GAUGE_METRIC
    );
  });

  it('gauge should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const observableGauge = meter.createGauge('some-name');

    // ensure the correct noop const is returned
    assert.strictEqual(observableGauge, NOOP_GAUGE_METRIC);

    const gaugeWithOptions = meter.createGauge('some-name', options);
    assert.strictEqual(gaugeWithOptions, NOOP_GAUGE_METRIC);
  });

  it('observable up down counter should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const observableUpDownCounter =
      meter.createObservableUpDownCounter('some-name');
    observableUpDownCounter.addCallback(() => {});

    // ensure the correct noop const is returned
    assert.strictEqual(
      observableUpDownCounter,
      NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC
    );

    const observableUpDownCounterWithOptions =
      meter.createObservableUpDownCounter('some-name', options);
    assert.strictEqual(
      observableUpDownCounterWithOptions,
      NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC
    );
  });

  it('batch callback should not crash', function () {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    meter.addBatchObservableCallback(() => {}, []);
    meter.removeBatchObservableCallback(() => {}, []);
  });
});

describe('createNoopMeter', function () {
  it('should return NoopMeter', function () {
    assert.ok(createNoopMeter() instanceof NoopMeter);
  });
});
