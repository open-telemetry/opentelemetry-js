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
  ProxyMeter,
  ProxyMeterProvider,
  Meter,
  MeterProvider,
  Histogram,
  UpDownCounter,
  ObservableGauge,
  ObservableCounter,
  Counter,
  ObservableUpDownCounter,
} from '../../../src';
import {
  NoopHistogramMetric,
  NoopMeter,
  NoopObservableCounterMetric,
  NoopObservableGaugeMetric,
  NoopObservableUpDownCounterMetric,
  NoopUpDownCounterMetric,
} from '../../../src/metrics/NoopMeter';

describe('ProxyMeter', () => {
  let provider: ProxyMeterProvider;
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    provider = new ProxyMeterProvider();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when no delegate is set', () => {
    it('should return proxy meters', () => {
      const meter = provider.getMeter('test');

      assert.ok(meter instanceof ProxyMeter);
    });

    it('create instruments should return Noop metric instruments', () => {
      const meter = provider.getMeter('test');
      assert.ok(
        meter.createHistogram('histogram-name') instanceof NoopHistogramMetric
      );
      assert.ok(
        meter.createObservableCounter('observablecounter-name') instanceof
          NoopObservableCounterMetric
      );
      assert.ok(
        meter.createObservableGauge('observableGauge-name') instanceof
          NoopObservableGaugeMetric
      );
      assert.ok(
        meter.createObservableUpDownCounter('observableCounter-name') instanceof
          NoopObservableUpDownCounterMetric
      );
      assert.ok(
        meter.createUpDownCounter('upDownCounter-name') instanceof
          NoopUpDownCounterMetric
      );
    });
  });

  describe('when delegate is set before getMeter', () => {
    let delegate: MeterProvider;
    let getMeterStub: sinon.SinonStub;

    beforeEach(() => {
      getMeterStub = sandbox.stub().returns(new NoopMeter());
      delegate = {
        getMeter: getMeterStub,
      };
      provider.setDelegate(delegate);
    });

    it('should return meters directly from the delegate', () => {
      const meter = provider.getMeter('test', 'v0');

      sandbox.assert.calledOnce(getMeterStub);
      assert.strictEqual(getMeterStub.firstCall.returnValue, meter);
      assert.deepStrictEqual(getMeterStub.firstCall.args, [
        'test',
        'v0',
        undefined,
      ]);
    });

    it('should return meters directly from the delegate with schema url', () => {
      const meter = provider.getMeter('test', 'v0', {
        schemaUrl: 'https://opentelemetry.io/schemas/1.7.0',
      });

      sandbox.assert.calledOnce(getMeterStub);
      assert.strictEqual(getMeterStub.firstCall.returnValue, meter);
      assert.deepStrictEqual(getMeterStub.firstCall.args, [
        'test',
        'v0',
        { schemaUrl: 'https://opentelemetry.io/schemas/1.7.0' },
      ]);
    });
  });

  describe('when delegate is set after getMeter', () => {
    let meter: Meter;
    let delegate: MeterProvider;
    let delegateHistogram: Histogram;
    let delegateCounter: Counter;
    let delegateUpDownCounter: UpDownCounter;
    let delegateObservableGauge: ObservableGauge;
    let delegateObservableCounter: ObservableCounter;
    let delegateObservableUpDownCounter: ObservableUpDownCounter;
    let delegateMeter: Meter;

    beforeEach(() => {
      delegateHistogram = new NoopHistogramMetric();
      delegateMeter = {
        createHistogram() {
          return delegateHistogram;
        },
        createCounter() {
          return delegateCounter;
        },
        createObservableCounter() {
          return delegateObservableCounter;
        },
        createObservableGauge() {
          return delegateObservableGauge;
        },
        createObservableUpDownCounter() {
          return delegateObservableUpDownCounter;
        },
        createUpDownCounter() {
          return delegateUpDownCounter;
        },
        addBatchObservableCallback() {},
        removeBatchObservableCallback() {},
      };

      meter = provider.getMeter('test');

      delegate = {
        getMeter() {
          return delegateMeter;
        },
      };
      provider.setDelegate(delegate);
    });

    it('should create histograms using the delegate meter', () => {
      const instrument = meter.createHistogram('test');
      assert.strictEqual(instrument, delegateHistogram);
    });

    it('should create counters using the delegate meter', () => {
      const instrument = meter.createCounter('test');
      assert.strictEqual(instrument, delegateCounter);
    });

    it('should create observable counters using the delegate meter', () => {
      const instrument = meter.createObservableCounter('test');
      assert.strictEqual(instrument, delegateObservableCounter);
    });

    it('should create observable gauges using the delegate meter', () => {
      const instrument = meter.createObservableGauge('test');
      assert.strictEqual(instrument, delegateObservableGauge);
    });

    it('should create observable up down counters using the delegate meter', () => {
      const instrument = meter.createObservableUpDownCounter('test');
      assert.strictEqual(instrument, delegateObservableUpDownCounter);
    });

    it('should create observable up down counters using the delegate meter', () => {
      const histogram = meter.createUpDownCounter('test');
      assert.strictEqual(histogram, delegateUpDownCounter);
    });
  });
});
