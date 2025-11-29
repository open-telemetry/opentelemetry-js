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
  ProxyMeterProvider,
  Meter,
  MeterProvider,
  Histogram,
  UpDownCounter,
  ObservableGauge,
  ObservableCounter,
  Counter,
  ObservableUpDownCounter,
  Gauge,
} from '../../../src';
import { ProxyMeter } from '../../../src/metrics/ProxyMeter';
import { NoopMeter } from '../../../src/metrics/NoopMeter';

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

    it('creates proxy instruments that act as no-ops before delegation', () => {
      const meter = provider.getMeter('test');

      const counter = meter.createCounter('counter');
      const histogram = meter.createHistogram('histogram');
      const observable = meter.createObservableGauge('gauge');

      assert.doesNotThrow(() => counter.add(1));
      assert.doesNotThrow(() => histogram.record(1));
      assert.doesNotThrow(() => observable.addCallback(() => {}));
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
    let delegateMeter: Meter;
    let delegateGauge: Gauge;
    let delegateHistogram: Histogram;
    let delegateCounter: Counter;
    let delegateUpDownCounter: UpDownCounter;
    let delegateObservableGauge: ObservableGauge;
    let delegateObservableCounter: ObservableCounter;
    let delegateObservableUpDownCounter: ObservableUpDownCounter;
    let addBatchStub: sinon.SinonStub;
    let removeBatchStub: sinon.SinonStub;

    beforeEach(() => {
      delegateGauge = { record: sandbox.stub() };
      delegateHistogram = { record: sandbox.stub() };
      delegateCounter = { add: sandbox.stub() };
      delegateUpDownCounter = { add: sandbox.stub() };
      delegateObservableGauge = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      delegateObservableCounter = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      delegateObservableUpDownCounter = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      addBatchStub = sandbox.stub();
      removeBatchStub = sandbox.stub();

      delegateMeter = {
        createGauge: sandbox.stub().returns(delegateGauge),
        createHistogram: sandbox.stub().returns(delegateHistogram),
        createCounter: sandbox.stub().returns(delegateCounter),
        createObservableCounter: sandbox
          .stub()
          .returns(delegateObservableCounter),
        createObservableGauge: sandbox.stub().returns(delegateObservableGauge),
        createObservableUpDownCounter: sandbox
          .stub()
          .returns(delegateObservableUpDownCounter),
        createUpDownCounter: sandbox.stub().returns(delegateUpDownCounter),
        addBatchObservableCallback: addBatchStub,
        removeBatchObservableCallback: removeBatchStub,
      };

      meter = provider.getMeter('test');

      delegate = {
        getMeter() {
          return delegateMeter;
        },
      };
      provider.setDelegate(delegate);
    });

    it('should create gauges using the delegate meter', () => {
      const instrument = meter.createGauge('test');
      assert.strictEqual(instrument, delegateGauge);
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

    it('should create up down counters using the delegate meter', () => {
      const instrument = meter.createUpDownCounter('test');
      assert.strictEqual(instrument, delegateUpDownCounter);
    });
  });

  describe('when instruments are created before delegate is set', () => {
    it('hydrates synchronous instruments once the delegate registers', () => {
      const meter = provider.getMeter('test');
      const counter = meter.createCounter('pre-counter');
      const addStub = sandbox.stub();
      const delegateCounter: Counter = {
        add: addStub,
      };
      const delegateMeter = new NoopMeter();
      sandbox.stub(delegateMeter, 'createCounter').returns(delegateCounter);

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      counter.add(7);
      sandbox.assert.calledOnceWithExactly(addStub, 7);
    });

    it('hydrates observable callbacks that were added before delegation', () => {
      const meter = provider.getMeter('test');
      const observable = meter.createObservableGauge('observable');
      const callback = sandbox.stub();
      observable.addCallback(callback);

      const delegateObservable: ObservableGauge = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      const delegateMeter = new NoopMeter();
      sandbox
        .stub(delegateMeter, 'createObservableGauge')
        .returns(delegateObservable);

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      sandbox.assert.calledOnceWithExactly(
        delegateObservable.addCallback as sinon.SinonStub,
        callback
      );
    });

    it('hydrates batch observable callbacks registered before delegation', () => {
      const meter = provider.getMeter('test');
      const observable = meter.createObservableGauge('batch');
      const callback = sandbox.stub();
      meter.addBatchObservableCallback(callback, [observable]);

      const delegateObservable: ObservableGauge = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      const delegateMeter = new NoopMeter();
      sandbox
        .stub(delegateMeter, 'createObservableGauge')
        .returns(delegateObservable);
      const addBatchStub = sandbox.stub(
        delegateMeter,
        'addBatchObservableCallback'
      );

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      sandbox.assert.calledOnce(addBatchStub);
      const [, registeredObservables] = addBatchStub.firstCall.args;
      assert.strictEqual(registeredObservables[0], delegateObservable);
    });
  });
});
