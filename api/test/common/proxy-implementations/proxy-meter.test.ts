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
  Observable,
} from '../../../src';
import { NoopMeterProvider } from '../../../src/metrics/NoopMeterProvider';
import { ProxyMeter } from '../../../src/metrics/ProxyMeter';
import { NoopMeter, NOOP_METER } from '../../../src/metrics/NoopMeter';

describe('ProxyMeter', () => {
  let provider: ProxyMeterProvider;
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    provider = new ProxyMeterProvider();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDelegate', () => {
    it('returns NoopMeterProvider when delegate is unset', () => {
      const delegate = provider.getDelegate();
      assert.ok(delegate instanceof NoopMeterProvider);
    });

    it('returns the configured delegate when set', () => {
      const noopDelegate = new NoopMeterProvider();
      provider.setDelegate(noopDelegate);

      const delegate = provider.getDelegate();
      assert.strictEqual(delegate, noopDelegate);
    });
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

    it('creates additional synchronous instruments that remain no-ops before delegation', () => {
      const meter = provider.getMeter('test');

      const gauge = meter.createGauge('gauge');
      const upDownCounter = meter.createUpDownCounter('upDown');

      assert.doesNotThrow(() => gauge.record(5));
      assert.doesNotThrow(() => upDownCounter.add(-1));
    });

    it('creates observable counters that buffer callbacks before delegation', () => {
      const meter = provider.getMeter('test');

      const observableCounter = meter.createObservableCounter('observable-counter');
      const observableUpDownCounter = meter.createObservableUpDownCounter(
        'observable-up-down-counter'
      );
      const counterCallback = sandbox.stub();
      const upDownCallback = sandbox.stub();

      assert.doesNotThrow(() => observableCounter.addCallback(counterCallback));
      assert.doesNotThrow(() => observableCounter.removeCallback(counterCallback));
      assert.doesNotThrow(() =>
        observableUpDownCounter.addCallback(upDownCallback)
      );
      assert.doesNotThrow(() =>
        observableUpDownCounter.removeCallback(upDownCallback)
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

    it('registers batch callbacks through the delegate once bound', () => {
      const proxyObservable = meter.createObservableGauge('proxy');
      const foreignObservable: ObservableGauge = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      const callback = sandbox.stub();

      meter.addBatchObservableCallback(callback, [
        proxyObservable,
        foreignObservable,
      ]);

      sandbox.assert.calledOnce(addBatchStub);
      const [, registeredObservables] = addBatchStub.firstCall.args;
      assert.strictEqual(registeredObservables[0], delegateObservableGauge);
      assert.strictEqual(registeredObservables[1], foreignObservable);
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

    it('hydrates gauges that were created before delegation', () => {
      const meter = provider.getMeter('test');
      const gauge = meter.createGauge('pre-gauge');
      const recordStub = sandbox.stub();
      const delegateGauge: Gauge = {
        record: recordStub,
      } as Gauge;
      const delegateMeter = new NoopMeter();
      sandbox.stub(delegateMeter, 'createGauge').returns(delegateGauge);

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      gauge.record(9);
      sandbox.assert.calledOnceWithExactly(recordStub, 9);
    });

    it('hydrates histograms that were created before delegation', () => {
      const meter = provider.getMeter('test');
      const histogram = meter.createHistogram('pre-histogram');
      const recordStub = sandbox.stub();
      const delegateHistogram: Histogram = {
        record: recordStub,
      } as Histogram;
      const delegateMeter = new NoopMeter();
      sandbox.stub(delegateMeter, 'createHistogram').returns(delegateHistogram);

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      histogram.record(33);
      sandbox.assert.calledOnceWithExactly(recordStub, 33);
    });

    it('hydrates up down counters that were created before delegation', () => {
      const meter = provider.getMeter('test');
      const upDownCounter = meter.createUpDownCounter('pre-updown');
      const addStub = sandbox.stub();
      const delegateUpDownCounter: UpDownCounter = {
        add: addStub,
      } as UpDownCounter;
      const delegateMeter = new NoopMeter();
      sandbox.stub(delegateMeter, 'createUpDownCounter').returns(delegateUpDownCounter);

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      upDownCounter.add(-11);
      sandbox.assert.calledOnceWithExactly(addStub, -11);
    });

    it('hydrates observable counters that were created before delegation', () => {
      const meter = provider.getMeter('test');
      const observableCounter = meter.createObservableCounter('pre-observable-counter');
      const callback = sandbox.stub();
      observableCounter.addCallback(callback);

      const delegateObservableCounter: ObservableCounter = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      const delegateMeter = new NoopMeter();
      sandbox
        .stub(delegateMeter, 'createObservableCounter')
        .returns(delegateObservableCounter);

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      sandbox.assert.calledOnceWithExactly(
        delegateObservableCounter.addCallback as sinon.SinonStub,
        callback
      );
    });

    it('hydrates observable up down counters that were created before delegation', () => {
      const meter = provider.getMeter('test');
      const observableUpDownCounter = meter.createObservableUpDownCounter(
        'pre-observable-updown'
      );
      const callback = sandbox.stub();
      observableUpDownCounter.addCallback(callback);

      const delegateObservableUpDownCounter: ObservableUpDownCounter = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };
      const delegateMeter = new NoopMeter();
      sandbox
        .stub(delegateMeter, 'createObservableUpDownCounter')
        .returns(delegateObservableUpDownCounter);

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      sandbox.assert.calledOnceWithExactly(
        delegateObservableUpDownCounter.addCallback as sinon.SinonStub,
        callback
      );
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

      it('remaps proxy observables when registering batch callbacks after delegation', () => {
        const meter = provider.getMeter('test');
        const proxyObservable = meter.createObservableGauge('proxy-batch');
        const callback = sandbox.stub();
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

        meter.addBatchObservableCallback(callback, [proxyObservable]);

        sandbox.assert.calledOnce(addBatchStub);
        const [, registeredObservables] = addBatchStub.firstCall.args;
        assert.strictEqual(registeredObservables[0], delegateObservable);
      });

    it('removes batch callbacks via the current delegate before delegation', () => {
      const meter = provider.getMeter('test');
      const observable = meter.createObservableGauge('batch');
      const callback = sandbox.stub();

      meter.addBatchObservableCallback(callback, [observable]);

      const noopMeter = new NoopMeter();
      const getMeterStub = sandbox
        .stub(meter as unknown as { _getMeter: () => Meter }, '_getMeter')
        .returns(noopMeter);
      sandbox.stub(noopMeter, 'removeBatchObservableCallback');

      assert.doesNotThrow(() =>
        meter.removeBatchObservableCallback(callback, [observable])
      );
      sandbox.assert.calledOnce(getMeterStub);
      sandbox.assert.calledOnceWithExactly(
        noopMeter.removeBatchObservableCallback as sinon.SinonStub,
        callback,
        [observable]
      );
    });

      it('removes batch callbacks by delegating to the noop meter when unset', () => {
        const meter = provider.getMeter('test');
        const observable = meter.createObservableGauge('noop-batch');
        const callback = sandbox.stub();
        meter.addBatchObservableCallback(callback, [observable]);

        const noopSpy = sandbox.spy(NOOP_METER, 'removeBatchObservableCallback');

        meter.removeBatchObservableCallback(callback, [observable]);

        sandbox.assert.calledOnce(noopSpy);
      });
  });

  describe('proxy instrument internals', () => {
    it('does not track instruments that already have delegates', () => {
      const meter = provider.getMeter('test') as ProxyMeter;
      const privateMeter = meter as unknown as {
        _trackInstrument: (instrument: unknown) => void;
        _instruments: Set<unknown>;
      };
      privateMeter._instruments.clear();
      const instrument = {
        hasDelegate: sandbox.stub().returns(true),
        bindDelegate: sandbox.stub(),
      };

      privateMeter._trackInstrument(instrument);

      assert.strictEqual(privateMeter._instruments.size, 0);
    });

    it('leaves non-proxy observables untouched when mapping delegates', () => {
      const meter = provider.getMeter('test') as ProxyMeter;
      const privateMeter = meter as unknown as {
        _mapObservablesToDelegates: (observables: Observable[]) => Observable[];
      };
      const observable: Observable = {
        addCallback: sandbox.stub(),
        removeCallback: sandbox.stub(),
      };

      const [result] = privateMeter._mapObservablesToDelegates([observable]);

      assert.strictEqual(result, observable);
    });

    it('maps proxy observables to their delegates after binding', () => {
      const meter = provider.getMeter('test') as ProxyMeter;
      const privateMeter = meter as unknown as {
        _mapObservablesToDelegates: (observables: Observable[]) => Observable[];
      };
      const proxyObservable = meter.createObservableGauge('proxy');
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

      const [result] = privateMeter._mapObservablesToDelegates([
        proxyObservable as unknown as Observable,
      ]);

      assert.strictEqual(result, delegateObservable);
    });

    it('does not bind pending instruments when no delegate is present', () => {
      const meter = provider.getMeter('test') as ProxyMeter;
      const privateMeter = meter as unknown as {
        _bindPendingInstruments: () => void;
        _instruments: Set<any>;
      };
      const instrument = {
        hasDelegate: sandbox.stub().returns(false),
        bindDelegate: sandbox.stub(),
      };
      privateMeter._instruments.add(instrument);

      privateMeter._bindPendingInstruments();

      sandbox.assert.notCalled(instrument.bindDelegate);
      assert.strictEqual(privateMeter._instruments.size, 1);
    });

    it('falls back to NOOP meter when no delegate is available', () => {
      const meter = provider.getMeter('test') as ProxyMeter;
      const privateMeter = meter as unknown as { _getMeter: () => Meter };

      const result = privateMeter._getMeter();

      assert.strictEqual(result, NOOP_METER);
    });

    it('allows proxy instruments to attempt delegate binding before delegation', () => {
      const meter = provider.getMeter('test');
      const counter = meter.createCounter('lazy');

      assert.doesNotThrow(() =>
        (counter as unknown as { bindDelegate: () => void }).bindDelegate()
      );
    });

    it('hydrates instruments lazily when pending state flush is prevented', () => {
      const meter = provider.getMeter('test') as ProxyMeter;
      const counter = meter.createCounter('lazy');
      const delegateCounter: Counter = {
        add: sandbox.stub(),
      } as Counter;
      const delegateMeter = new NoopMeter();
      sandbox.stub(delegateMeter, 'createCounter').returns(delegateCounter);
      sandbox.stub(meter as unknown as { _flushPendingState: () => void }, '_flushPendingState');

      provider.setDelegate({
        getMeter() {
          return delegateMeter;
        },
      });

      counter.add(3);

      sandbox.assert.calledOnce(
        delegateMeter.createCounter as sinon.SinonStub
      );
      sandbox.assert.calledOnce(delegateCounter.add as sinon.SinonStub);
    });
  });
});
